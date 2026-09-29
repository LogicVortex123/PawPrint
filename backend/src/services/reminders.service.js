// Smart Reminders: builds one prioritised list of what needs doing for a user's
// pets, from their real records and their Account Settings preferences. Pure
// function (no DB access) so the rules are easy to unit-test and identical for
// the web dashboard, the navbar bell and any future mobile/email delivery.

const DAY_MS = 24 * 60 * 60 * 1000;
const WEIGHT_STALE_DAYS = 30;
// A still-"scheduled" visit this recently in the past gets a "did it happen?" nudge
const PAST_APPOINTMENT_NUDGE_DAYS = 14;
const URGENCY_ORDER = { urgent: 0, upcoming: 1, info: 2 };

const DEFAULT_PREFERENCES = {
  reminders: { vaccination: true, appointment: true, weight: true },
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

function buildReminders({ pets, vaccinations = [], appointments = [], latestWeightByPet = {}, preferences, now = new Date() }) {
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
      const base = { id: `appointment-${a._id}`, type: 'appointment', petId: a.pet, dueDate: a.date, daysUntil: days };

      if (days >= 0 && days <= leadDays) {
        add({ ...base, urgency: days <= 1 ? 'urgent' : 'upcoming', title: `${title} ${whenLabel(days)}`, message: `At ${a.clinic?.name || 'the clinic'} on ${formatDate(a.date)}.` });
      } else if (days < 0 && days >= -PAST_APPOINTMENT_NUDGE_DAYS) {
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
    }
  }

  // Most urgent first, then soonest; undated nudges last within their group
  const dayKey = (r) => (r.daysUntil === null ? Number.MAX_SAFE_INTEGER : r.daysUntil);
  reminders.sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency] || dayKey(a) - dayKey(b));

  return { leadDays, reminders };
}

module.exports = { buildReminders, daysBetween, latestDosePerVaccine };
