// Builds the "what PawPal knows" snapshot for the chat assistant: a compact,
// read-only summary of the signed-in owner's pets and their records. The same
// snapshot feeds the built-in replies and, when configured, Claude's prompt.

const Pet = require('../models/Pet.model');
const User = require('../models/User.model');
const Vaccination = require('../models/Vaccination.model');
const WeightRecord = require('../models/WeightRecord.model');
const Appointment = require('../models/Appointment.model');
const Medication = require('../models/Medication.model');
const MedicationDose = require('../models/MedicationDose.model');
const Expense = require('../models/Expense.model');
const { buildReminders } = require('./reminders.service');
const { summarizeMedication, addDays } = require('./medicationSchedule.service');

const DAY_MS = 24 * 60 * 60 * 1000;
const dayKey = (date) => new Date(date).toISOString().slice(0, 10);

function ageText(dateOfBirth, now) {
  if (!dateOfBirth) return '';
  const months = (now.getFullYear() - dateOfBirth.getFullYear()) * 12 + (now.getMonth() - dateOfBirth.getMonth());
  if (months < 1) return 'under a month old';
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} old`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} old`;
}

/**
 * Pure: turns raw records for one pet into the assistant's view of it.
 * Only the newest dose of each vaccine counts, and only medications active today.
 */
function summarizePet({ pet, vaccinations = [], weights = [], appointments = [], medications = [], doses = [], expenses = [], todayKey, now = new Date() }) {
  const latestByVaccine = new Map();
  for (const v of vaccinations) {
    const key = v.vaccineName.trim().toLowerCase();
    const seen = latestByVaccine.get(key);
    if (!seen || new Date(v.administrationDate) > new Date(seen.administrationDate)) latestByVaccine.set(key, v);
  }
  const vaccines = [...latestByVaccine.values()]
    .map((v) => {
      const daysUntil = Math.ceil((new Date(v.nextDueDate) - now) / DAY_MS);
      return {
        name: v.vaccineName,
        lastGiven: dayKey(v.administrationDate),
        nextDue: dayKey(v.nextDueDate),
        daysUntil,
        status: daysUntil < 0 ? 'overdue' : daysUntil <= 30 ? 'due soon' : 'up to date',
      };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const sortedWeights = [...weights].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
  const latest = sortedWeights[sortedWeights.length - 1];
  const previous = sortedWeights[sortedWeights.length - 2];

  const meds = medications
    .map((m) => ({ med: m, s: summarizeMedication(m, doses.filter((d) => String(d.medication) === String(m._id)), todayKey) }))
    .filter(({ s }) => s.active)
    .map(({ med, s }) => ({
      name: med.name,
      dosage: med.dosage || '',
      frequency: s.frequencyLabel,
      instructions: med.instructions || '',
      dueToday: s.dueToday,
      givenToday: s.givenToday.length,
      remainingToday: s.remainingToday,
      endsInDays: s.endsInDays,
      adherence7: s.adherence7,
    }));

  const upcoming = appointments
    .filter((a) => a.status === 'scheduled' && new Date(a.date) >= new Date(now.getTime() - 60 * 60 * 1000))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((a) => ({ date: new Date(a.date).toISOString(), clinic: a.clinic?.name || '', reason: a.reason || '' }));

  const month = todayKey.slice(0, 7);
  const year = todayKey.slice(0, 4);
  const sum = (list) => Math.round(list.reduce((s, e) => s + e.amount, 0) * 100) / 100;

  return {
    id: String(pet._id),
    name: pet.name,
    species: pet.species,
    breed: pet.breed || '',
    gender: pet.gender && pet.gender !== 'unknown' ? pet.gender : '',
    age: pet.dateOfBirth ? ageText(new Date(pet.dateOfBirth), now) : '',
    allergies: pet.allergies || [],
    microchipped: Boolean(pet.microchipId),
    emergencyContacts: (pet.emergencyContacts || []).filter((c) => c.name || c.phone).map((c) => ({ name: c.name || '', phone: c.phone || '' })),
    targetWeight: { min: pet.targetWeightMinKg ?? null, max: pet.targetWeightMaxKg ?? null },
    vaccines,
    medications: meds,
    weight: latest
      ? {
        latestKg: latest.weightKg,
        latestDate: dayKey(latest.recordedAt),
        previousKg: previous ? previous.weightKg : null,
        changePercent: previous ? Math.round(((latest.weightKg - previous.weightKg) / previous.weightKg) * 1000) / 10 : null,
        count: sortedWeights.length,
      }
      : null,
    upcomingAppointments: upcoming,
    spending: {
      thisMonth: sum(expenses.filter((e) => e.date.startsWith(month))),
      thisYear: sum(expenses.filter((e) => e.date.startsWith(year))),
    },
  };
}

/** Loads and summarises every pet the user owns. Returns null for guests. */
async function loadAssistantContext(userId, todayKey, now = new Date()) {
  if (!userId) return null;
  const [user, pets] = await Promise.all([User.findById(userId).lean(), Pet.find({ owner: userId }).sort({ createdAt: 1 }).lean()]);
  if (!user) return null;

  const petIds = pets.map((p) => p._id);
  const [vaccinations, weights, appointments, medications, expenses] = await Promise.all([
    Vaccination.find({ pet: { $in: petIds } }).lean(),
    WeightRecord.find({ pet: { $in: petIds } }).sort({ recordedAt: -1 }).limit(50 * Math.max(pets.length, 1)).lean(),
    Appointment.find({ owner: userId, pet: { $in: petIds } }).lean(),
    Medication.find({ owner: userId, pet: { $in: petIds } }).lean(),
    Expense.find({ owner: userId, pet: { $in: petIds }, date: { $gte: `${todayKey.slice(0, 4)}-01-01` } }).lean(),
  ]);
  const doses = medications.length
    ? await MedicationDose.find({ medication: { $in: medications.map((m) => m._id) }, date: { $gte: addDays(todayKey, -30) } }).lean()
    : [];

  const forPet = (list, petField = 'pet') => (id) => list.filter((r) => String(r[petField]) === String(id));
  const byPet = {
    vaccinations: forPet(vaccinations), weights: forPet(weights), appointments: forPet(appointments),
    medications: forPet(medications), expenses: forPet(expenses),
  };

  const latestWeights = new Map();
  for (const w of weights) if (!latestWeights.has(String(w.pet))) latestWeights.set(String(w.pet), w);
  const { reminders } = buildReminders({
    pets,
    vaccinations,
    appointments: appointments.filter((a) => a.status === 'scheduled'),
    latestWeightByPet: Object.fromEntries([...latestWeights].map(([id, w]) => [id, w.recordedAt])),
    latestWeightKgByPet: Object.fromEntries([...latestWeights].map(([id, w]) => [id, w.weightKg])),
    medications,
    medicationDoses: doses,
    preferences: user.preferences,
    now,
    todayKey,
  });

  return {
    owner: { firstName: (user.name || '').split(' ')[0], currency: user.preferences?.currency || 'INR' },
    today: todayKey,
    pets: pets.map((pet) => summarizePet({
      pet,
      vaccinations: byPet.vaccinations(pet._id),
      weights: byPet.weights(pet._id),
      appointments: byPet.appointments(pet._id),
      medications: byPet.medications(pet._id),
      doses,
      expenses: byPet.expenses(pet._id),
      todayKey,
      now,
    })),
    reminders: reminders.map((r) => ({ petId: r.petId, petName: r.petName, type: r.type, urgency: r.urgency, title: r.title, message: r.message })),
  };
}

module.exports = { summarizePet, loadAssistantContext };
