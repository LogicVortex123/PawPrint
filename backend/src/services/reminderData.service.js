// Loads everything buildReminders() needs for a set of pets. Shared by the
// GET /reminders endpoint and the daily email job so both always agree.

const Vaccination = require('../models/Vaccination.model');
const WeightRecord = require('../models/WeightRecord.model');
const Appointment = require('../models/Appointment.model');
const Medication = require('../models/Medication.model');
const MedicationDose = require('../models/MedicationDose.model');
const { addDays } = require('./medicationSchedule.service');

async function loadReminderInputs(ownerId, pets, todayKey) {
  const petIds = pets.map((p) => p._id);

  const [vaccinations, appointments, latestWeights, medications] = await Promise.all([
    Vaccination.find({ pet: { $in: petIds } }).lean(),
    Appointment.find({ owner: ownerId, pet: { $in: petIds }, status: 'scheduled' }).lean(),
    // Only the newest weigh-in per pet matters for the "time for a weigh-in" nudge
    WeightRecord.aggregate([
      { $match: { pet: { $in: petIds } } },
      { $sort: { recordedAt: -1 } },
      { $group: { _id: '$pet', recordedAt: { $first: '$recordedAt' }, weightKg: { $first: '$weightKg' } } },
    ]),
    Medication.find({ owner: ownerId, pet: { $in: petIds } }).lean(),
  ]);

  // Today and yesterday are all the medication reminders look at
  const medicationDoses = medications.length
    ? await MedicationDose.find({ medication: { $in: medications.map((m) => m._id) }, date: { $gte: addDays(todayKey, -1) } }).lean()
    : [];

  return {
    vaccinations,
    appointments,
    latestWeightByPet: Object.fromEntries(latestWeights.map((w) => [String(w._id), w.recordedAt])),
    latestWeightKgByPet: Object.fromEntries(latestWeights.map((w) => [String(w._id), w.weightKg])),
    medications,
    medicationDoses,
  };
}

module.exports = { loadReminderInputs };
