const Pet = require('../models/Pet.model');
const Medication = require('../models/Medication.model');
const MedicationDose = require('../models/MedicationDose.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { findOwnedPetOrFail } = require('../services/petAccess.service');
const { isDateKey, localDateKey, addDays, summarizeMedication } = require('../services/medicationSchedule.service');

// Dose history sent with each medication — enough for the 30-day adherence figure
const HISTORY_DAYS = 31;
const EDITABLE_FIELDS = ['name', 'dosage', 'frequency', 'startDate', 'endDate', 'instructions', 'prescribedBy'];

// The browser sends its own calendar day; fall back to the server's
function todayFrom(req) {
  const date = req.query.date || req.body?.today;
  return isDateKey(date) ? date : localDateKey();
}

function pickFields(body) {
  const out = {};
  for (const key of EDITABLE_FIELDS) {
    if (body[key] !== undefined) out[key] = typeof body[key] === 'string' ? body[key].trim() : body[key];
  }
  // An empty end date means "ongoing"
  if (out.endDate === '') out.endDate = undefined;
  return out;
}

async function findOwnedMedicationOrFail(id, ownerId) {
  const med = await Medication.findOne({ _id: id, owner: ownerId });
  if (!med) throw new ApiError(404, 'Medication not found');
  return med;
}

// Medications plus their recent doses and today's schedule
async function withSchedules(medications, todayKey) {
  const ids = medications.map((m) => m._id);
  const doses = await MedicationDose.find({ medication: { $in: ids }, date: { $gte: addDays(todayKey, -HISTORY_DAYS) } })
    .select('medication date slot givenAt')
    .lean();

  const byMedication = new Map();
  for (const d of doses) {
    const key = String(d.medication);
    if (!byMedication.has(key)) byMedication.set(key, []);
    byMedication.get(key).push(d);
  }

  return medications.map((m) => {
    const obj = m.toObject ? m.toObject() : m;
    const medDoses = byMedication.get(String(obj._id)) || [];
    return {
      ...obj,
      doses: medDoses.map(({ date, slot, givenAt }) => ({ date, slot, givenAt })),
      schedule: summarizeMedication(obj, medDoses, todayKey),
    };
  });
}

// GET /medications?date=YYYY-MM-DD — every medication across the user's pets
const list = asyncHandler(async (req, res) => {
  const pets = await Pet.find({ owner: req.userId }).select('_id');
  const medications = await Medication.find({ owner: req.userId, pet: { $in: pets.map((p) => p._id) } }).sort({ createdAt: 1 });
  res.json(await withSchedules(medications, todayFrom(req)));
});

// GET /pets/:id/medications
const listForPet = asyncHandler(async (req, res) => {
  await findOwnedPetOrFail(req.params.id, req.userId);
  const medications = await Medication.find({ pet: req.params.id, owner: req.userId }).sort({ createdAt: 1 });
  res.json(await withSchedules(medications, todayFrom(req)));
});

// POST /pets/:id/medications
const createForPet = asyncHandler(async (req, res) => {
  await findOwnedPetOrFail(req.params.id, req.userId);
  const fields = pickFields(req.body);
  if (!fields.name) throw new ApiError(400, 'Medication name is required');
  if (!isDateKey(fields.startDate)) throw new ApiError(400, 'A valid start date is required');
  if (fields.endDate && !isDateKey(fields.endDate)) throw new ApiError(400, 'End date is invalid');

  const medication = await Medication.create({ ...fields, pet: req.params.id, owner: req.userId });
  const [result] = await withSchedules([medication], todayFrom(req));
  res.status(201).json(result);
});

// PUT /medications/:id
const update = asyncHandler(async (req, res) => {
  const medication = await findOwnedMedicationOrFail(req.params.id, req.userId);
  const fields = pickFields(req.body);
  if (fields.startDate !== undefined && !isDateKey(fields.startDate)) throw new ApiError(400, 'Start date is invalid');
  if (fields.endDate && !isDateKey(fields.endDate)) throw new ApiError(400, 'End date is invalid');

  // pickFields turns a cleared end date into undefined, which makes the course ongoing again
  Object.assign(medication, fields);
  await medication.save();

  const [result] = await withSchedules([medication], todayFrom(req));
  res.json(result);
});

// DELETE /medications/:id — also removes its dose history
const remove = asyncHandler(async (req, res) => {
  const medication = await findOwnedMedicationOrFail(req.params.id, req.userId);
  await MedicationDose.deleteMany({ medication: medication._id });
  await medication.deleteOne();
  res.status(204).send();
});

// POST /medications/:id/doses { date, slot } — mark a dose as given
const markDose = asyncHandler(async (req, res) => {
  const medication = await findOwnedMedicationOrFail(req.params.id, req.userId);
  const { date } = req.body;
  const slot = Number(req.body.slot ?? 0);
  if (!isDateKey(date)) throw new ApiError(400, 'A valid date is required');
  if (!Number.isInteger(slot) || slot < 0 || slot > 23) throw new ApiError(400, 'Invalid dose slot');
  if (date > addDays(todayFrom(req), 1)) throw new ApiError(400, "Doses can't be logged for future days");

  // Upsert so a double click or a second tab can't create a duplicate
  await MedicationDose.updateOne(
    { medication: medication._id, date, slot },
    { $setOnInsert: { pet: medication.pet, givenAt: new Date() } },
    { upsert: true }
  );

  const [result] = await withSchedules([medication], todayFrom(req));
  res.json(result);
});

// DELETE /medications/:id/doses?date=YYYY-MM-DD&slot=0 — undo a dose
const unmarkDose = asyncHandler(async (req, res) => {
  const medication = await findOwnedMedicationOrFail(req.params.id, req.userId);
  const date = req.query.doseDate;
  const slot = Number(req.query.slot ?? 0);
  if (!isDateKey(date)) throw new ApiError(400, 'A valid doseDate is required');

  await MedicationDose.deleteOne({ medication: medication._id, date, slot });
  const [result] = await withSchedules([medication], todayFrom(req));
  res.json(result);
});

module.exports = { list, listForPet, createForPet, update, remove, markDose, unmarkDose };
