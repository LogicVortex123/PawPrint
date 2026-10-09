// Smart Reminders: builds one prioritised list of what needs doing for a user's
// pets, from their real records and their Account Settings preferences. Pure
// function (no DB access) so the rules are easy to unit-test and identical for
// the web dashboard, the navbar bell and any future mobile/email delivery.

const { summarizeMedication, localDateKey } = require('./medicationSchedule.service');

const DAY_MS = 24 * 60 * 60 * 1000;
const WEIGHT_STALE_DAYS = 30;
// A medication course ending this soon gets a "talk to your vet about a refill" nudge
const MEDICATION_ENDING_DAYS = 3;
// A still-"scheduled" visit this recently in the past gets a "did it happen?" nudge
const PAST_APPOINTMENT_NUDGE_DAYS = 14;
const URGENCY_ORDER = { urgent: 0, upcoming: 1, info: 2 };

const DEFAULT_PREFERENCES = {
  reminders: { vaccination: true, appointment: true, weight: true, medication: true },
  reminderLeadDays: 14,
};

// Whole calendar days from `now` to `date` (negative = in the past), compared
// at UTC midnight so the time of day never shifts a due date by one
function daysBetween(now, date) {
  const startOfDay = (d) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.round((startOfDay(new Date(date)) - startOfDay(now)) / DAY_MS);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function whenLabel(days) {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

// Boosters create a new record for the same vaccine — only the latest dose
// decides whether that vaccine is due, otherwise old doses read as "overdue"
function latestDosePerVaccine(vaccinations) {
  const latest = new Map();
  for (const v of vaccinations) {
    const key = `${v.pet}:${v.vaccineName.trim().toLowerCase()}`;
    const existing = latest.get(key);
    if (!existing || new Date(v.administrationDate) > new Date(existing.administrationDate)) latest.set(key, v);
  }
  return [...latest.values()];
}

// Where a weight sits relative to an optional min/max target range.
// null when there's no weight or no target; percent is how far outside the range.
function weightTargetStatus(kg, min, max) {
  if (typeof kg !== 'number' || (min == null && max == null)) return null;
  if (min != null && kg < min) return { status: 'below', percent: Math.round(((min - kg) / min) * 100) };
  if (max != null && kg > max) return { status: 'above', percent: Math.round(((kg - max) / max) * 100) };
  return { status: 'within', percent: 0 };
}

// todayKey: the owner's calendar day ('YYYY-MM-DD') for medication doses — the
// browser sends it; defaults to the server's local day (e.g. for the daily email)
function buildReminders({
  pets, vaccinations = [], appointments = [], latestWeightByPet = {}, latestWeightKgByPet = {}, medications = [], medicationDoses = [],
  preferences, now = new Date(), todayKey = localDateKey(now),
}) {
  const prefs = {
    reminders: { ...DEFAULT_PREFERENCES.reminders, ...(preferences?.reminders || {}) },
    reminderLeadDays: preferences?.reminderLeadDays ?? DEFAULT_PREFERENCES.reminderLeadDays,
  };
  const leadDays = prefs.reminderLeadDays;
  const petName = new Map(pets.map((p) => [String(p._id), p.name]));
  const reminders = [];

  const add = (reminder) => reminders.push({ ...reminder, petId: String(reminder.petId), petName: petName.get(String(reminder.petId)) });

  if (prefs.reminders.vaccination) {
    for (const v of latestDosePerVaccine(vaccinations)) {
      if (!petName.has(String(v.pet))) continue;
      const days = daysBetween(now, v.nextDueDate);
      const base = { id: `vaccination-${v._id}`, type: 'vaccination', petId: v.pet, dueDate: v.nextDueDate, daysUntil: days };

      if (days < 0) {
        add({ ...base, urgency: 'urgent', title: `${v.vaccineName} is overdue`, message: `Was due on ${formatDate(v.nextDueDate)}. Book a vet visit soon.` });
      } else if (days <= leadDays) {
        add({
          ...base,
          urgency: days <= 3 ? 'urgent' : 'upcoming',
          title: `${v.vaccineName} due ${whenLabel(days)}`,
          message: `Next dose due on ${formatDate(v.nextDueDate)}${v.clinic ? ` at ${v.clinic}` : ''}.`,
        });
      }
    }
  }

  if (prefs.reminders.appointment) {
    for (const a of appointments) {
      if (a.status !== 'scheduled' || !petName.has(String(a.pet))) continue;
      const days = daysBetween(now, a.date);
      const title = a.reason || 'Vet appointment';
      // bookedAt lets the browser skip alert times that had already passed when the visit was booked or moved
      const base = { id: `appointment-${a._id}`, type: 'appointment', petId: a.pet, dueDate: a.date, daysUntil: days, bookedAt: a.updatedAt || a.createdAt || null };
      // A visit earlier today whose time has gone by is past, not "today"
      const alreadyStarted = new Date(a.date).getTime() < now.getTime();

      if (days >= 0 && days <= leadDays && !alreadyStarted) {
        add({ ...base, urgency: days <= 1 ? 'urgent' : 'upcoming', title: `${title} ${whenLabel(days)}`, message: `At ${a.clinic?.name || 'the clinic'} on ${formatDate(a.date)}.` });
      } else if ((days < 0 || alreadyStarted) && days >= -PAST_APPOINTMENT_NUDGE_DAYS) {
        add({ ...base, urgency: 'info', title: `Did the ${title.toLowerCase()} happen?`, message: `It was on ${formatDate(a.date)}. Mark it completed or cancelled to keep records tidy.` });
      }
    }
  }

  if (prefs.reminders.weight) {
    for (const pet of pets) {
      const last = latestWeightByPet[String(pet._id)];
      const base = { type: 'weight', petId: pet._id, dueDate: null, daysUntil: null };
      if (!last) {
        add({ ...base, id: `weight-first-${pet._id}`, urgency: 'info', title: 'Log a first weigh-in', message: `Start tracking ${pet.name}'s weight to see trends over time.` });
      } else {
        const since = -daysBetween(now, last);
        if (since >= WEIGHT_STALE_DAYS) {
          add({ ...base, id: `weight-stale-${pet._id}`, urgency: 'info', title: 'Time for a weigh-in', message: `${pet.name}'s last weight was logged ${since} days ago.` });
        }
      }

      // Outside the healthy range set on the pet's profile
      const kg = latestWeightKgByPet[String(pet._id)];
      const status = weightTargetStatus(kg, pet.targetWeightMinKg, pet.targetWeightMaxKg);
      if (status && status.status !== 'within') {
        const range = `${pet.targetWeightMinKg ?? '?'}–${pet.targetWeightMaxKg ?? '?'} kg`;
        add({
          ...base,
          id: `weight-target-${pet._id}`,
          urgency: 'info',
          title: `${pet.name} is ${status.status} the target weight`,
          message: `Latest ${kg} kg vs target ${range} (${status.percent}% ${status.status === 'above' ? 'over' : 'under'}). Worth discussing diet and exercise with your vet.`,
        });
      }
    }
  }

  if (prefs.reminders.medication) {
    for (const med of medications) {
      if (!petName.has(String(med.pet))) continue;
      const doses = medicationDoses.filter((d) => String(d.medication) === String(med._id));
      const schedule = summarizeMedication(med, doses, todayKey);
      if (!schedule.active) continue;
      const label = `${med.name}${med.dosage ? ` (${med.dosage})` : ''}`;
      const base = { type: 'medication', petId: med.pet, dueDate: todayKey, daysUntil: 0 };

      if (schedule.remainingToday > 0) {
        const doseWord = schedule.dueToday === 1 ? 'dose' : 'doses';
        add({
          ...base,
          id: `medication-${med._id}-${todayKey}`,
          urgency: 'upcoming',
          title: `Give ${label} today`,
          message: schedule.dueToday === 1
            ? `${schedule.frequencyLabel}.${med.instructions ? ` ${med.instructions}.` : ''} Tick it off once given.`
            : `${schedule.remainingToday} of ${schedule.dueToday} ${doseWord} left today.${med.instructions ? ` ${med.instructions}.` : ''}`,
        });
      }
      if (schedule.missedYesterday > 0) {
        add({
          ...base,
          id: `medication-missed-${med._id}-${todayKey}`,
          urgency: 'info',
          daysUntil: -1,
          title: `${med.name}: ${schedule.missedYesterday} dose${schedule.missedYesterday > 1 ? 's' : ''} not ticked off yesterday`,
          message: "If it was given, log it in Medications. If it was missed, don't double up — check with your vet.",
        });
      }
      if (schedule.endsInDays !== null && schedule.endsInDays >= 0 && schedule.endsInDays <= MEDICATION_ENDING_DAYS) {
        add({
          ...base,
          id: `medication-ending-${med._id}`,
          urgency: 'info',
          daysUntil: schedule.endsInDays,
          title: `${med.name} course ends ${whenLabel(schedule.endsInDays)}`,
          message: 'Check with your vet whether it needs a refill or a follow-up.',
        });
      }
    }
  }

  // Most urgent first, then soonest; undated nudges last within their group
  const dayKey = (r) => (r.daysUntil === null ? Number.MAX_SAFE_INTEGER : r.daysUntil);
  reminders.sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency] || dayKey(a) - dayKey(b));

  return { leadDays, reminders };
}

module.exports = { buildReminders, daysBetween, latestDosePerVaccine, weightTargetStatus };
