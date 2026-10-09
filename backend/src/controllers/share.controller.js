const crypto = require('crypto');
const ShareLink = require('../models/ShareLink.model');
const Pet = require('../models/Pet.model');
const User = require('../models/User.model');
const Vaccination = require('../models/Vaccination.model');
const WeightRecord = require('../models/WeightRecord.model');
const Appointment = require('../models/Appointment.model');
const Document = require('../models/Document.model');
const Medication = require('../models/Medication.model');
const MedicationDose = require('../models/MedicationDose.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { findOwnedPetOrFail } = require('../services/petAccess.service');
const { withStatus } = require('../services/vaccinationStatus.service');
const { withTrend } = require('../services/weightTrend.service');
const { localDateKey, addDays, summarizeMedication } = require('../services/medicationSchedule.service');

const ALLOWED_DAYS = [1, 7, 30];
const MAX_ACTIVE_LINKS_PER_PET = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

// What the owner sees in their list of links — the token is included so they can copy it again
function toOwnerView(link, now = new Date()) {
  return {
    id: link._id,
    token: link.token,
    label: link.label || '',
    createdAt: link.createdAt,
    expiresAt: link.expiresAt,
    expired: link.expiresAt <= now,
    viewCount: link.viewCount,
    lastViewedAt: link.lastViewedAt || null,
  };
}

// GET /pets/:id/shares — links that haven't been revoked, newest first
const listForPet = asyncHandler(async (req, res) => {
  await findOwnedPetOrFail(req.params.id, req.userId);
  const links = await ShareLink.find({ pet: req.params.id, owner: req.userId, revokedAt: null }).sort({ createdAt: -1 });
  res.json(links.map((l) => toOwnerView(l)));
});

// POST /pets/:id/shares { days: 1 | 7 | 30, label? }
const createForPet = asyncHandler(async (req, res) => {
  await findOwnedPetOrFail(req.params.id, req.userId);
  const days = Number(req.body.days ?? 7);
  if (!ALLOWED_DAYS.includes(days)) throw new ApiError(400, `Links can last ${ALLOWED_DAYS.join(', ')} days`);

  const active = await ShareLink.countDocuments({ pet: req.params.id, revokedAt: null, expiresAt: { $gt: new Date() } });
  if (active >= MAX_ACTIVE_LINKS_PER_PET) throw new ApiError(400, 'Too many active links for this pet — revoke an old one first');

  const link = await ShareLink.create({
    token: crypto.randomBytes(24).toString('base64url'),
    pet: req.params.id,
    owner: req.userId,
    label: typeof req.body.label === 'string' ? req.body.label.trim().slice(0, 60) : undefined,
    expiresAt: new Date(Date.now() + days * DAY_MS),
  });
  res.status(201).json(toOwnerView(link));
});

// DELETE /shares/:id — revoke; the link stops working immediately
const revoke = asyncHandler(async (req, res) => {
  const link = await ShareLink.findOne({ _id: req.params.id, owner: req.userId });
  if (!link) throw new ApiError(404, 'Share link not found');
  link.revokedAt = new Date();
  await link.save();
  res.status(204).send();
});

// GET /shares/public/:token — no login. Read-only health summary for whoever
// holds the link. Only fields useful to a vet or carer are included.
const viewPublic = asyncHandler(async (req, res) => {
  const token = String(req.params.token || '');
  const link = token.length >= 20 ? await ShareLink.findOne({ token }) : null;
  if (!link || link.revokedAt || link.expiresAt <= new Date()) {
    throw new ApiError(404, 'This link has expired or was turned off by the owner.');
  }

  const pet = await Pet.findById(link.pet).lean();
  if (!pet) throw new ApiError(404, 'This pet profile no longer exists.');

  const today = localDateKey();
  const [owner, vaccinations, weightsAsc, appointments, documents, medications] = await Promise.all([
    User.findById(link.owner).select('name').lean(),
    Vaccination.find({ pet: pet._id }).sort({ administrationDate: -1 }).lean(),
    WeightRecord.find({ pet: pet._id }).sort({ recordedAt: 1 }).lean(),
    Appointment.find({ pet: pet._id }).sort({ date: -1 }).limit(20).lean(),
    Document.find({ pet: pet._id }).sort({ createdAt: -1 }).select('category originalName createdAt').lean(),
    Medication.find({ pet: pet._id }).lean(),
  ]);

  const doses = await MedicationDose.find({ medication: { $in: medications.map((m) => m._id) }, date: { $gte: addDays(today, -31) } }).lean();
  const currentMedications = medications
    .map((m) => ({ med: m, schedule: summarizeMedication(m, doses.filter((d) => String(d.medication) === String(m._id)), today) }))
    .filter(({ schedule }) => schedule.active)
    .map(({ med, schedule }) => ({
      name: med.name,
      dosage: med.dosage || '',
      frequencyLabel: schedule.frequencyLabel,
      instructions: med.instructions || '',
      startDate: med.startDate,
      endDate: med.endDate || null,
      adherence30: schedule.adherence30,
    }));

  await ShareLink.updateOne({ _id: link._id }, { $inc: { viewCount: 1 }, $set: { lastViewedAt: new Date() } });

  res.json({
    sharedBy: (owner?.name || 'The owner').split(' ')[0],
    expiresAt: link.expiresAt,
    pet: {
      _id: pet._id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      gender: pet.gender,
      dateOfBirth: pet.dateOfBirth,
      photoUrl: pet.photoUrl,
      microchipId: pet.microchipId,
      allergies: pet.allergies,
      medications: pet.medications,
      emergencyContacts: pet.emergencyContacts,
    },
    currentMedications,
    vaccinations: vaccinations.map(withStatus),
    weights: withTrend(weightsAsc).slice(-10),
    appointments: appointments.map(({ _id, pet: petId, date, clinic, reason, notes, status }) => ({ _id, pet: petId, date, clinic, reason, notes, status })),
    documents: documents.map(({ _id, category, originalName, createdAt }) => ({ _id, category, originalName, createdAt })),
  });
});

module.exports = { listForPet, createForPet, revoke, viewPublic };
