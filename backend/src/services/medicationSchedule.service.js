// Medication schedules: which doses are due on a given day, how many were
// given, and adherence over recent days. Pure functions (no DB access) shared by
// the medications API, Smart Reminders and the daily email.
//
// Days are 'YYYY-MM-DD' keys in the owner's local calendar. The browser sends
// its own "today" so a dose given at 1 AM counts for the right day, whatever
// timezone the server runs in.

const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const HISTORY_GRID_DAYS = 14;

// perDay: dose slots on a due day. everyNDays: due every N days from the start date.
// monthly: due on the start date's day of the month. as_needed: never scheduled.
const FREQUENCIES = {
  once_daily: { perDay: 1, label: 'Once a day' },
  twice_daily: { perDay: 2, label: 'Twice a day' },
  three_times_daily: { perDay: 3, label: 'Three times a day' },
  every_other_day: { perDay: 1, everyNDays: 2, label: 'Every other day' },
  weekly: { perDay: 1, everyNDays: 7, label: 'Once a week' },
  monthly: { perDay: 1, monthly: true, label: 'Once a month' },
  as_needed: { perDay: 0, label: 'As needed' },
};

const isDateKey = (value) => typeof value === 'string' && DATE_KEY_RE.test(value) && !Number.isNaN(keyToUtc(value));

function keyToUtc(key) {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function utcToKey(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

// Server-local calendar day, for when no client date is available (daily email)
function localDateKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const addDays = (key, days) => utcToKey(keyToUtc(key) + days * DAY_MS);
const daysBetweenKeys = (fromKey, toKey) => Math.round((keyToUtc(toKey) - keyToUtc(fromKey)) / DAY_MS);

function daysInMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

// Number of dose slots due on `dayKey` (0 when nothing is due)
function dosesDueOn(med, dayKey) {
  const freq = FREQUENCIES[med.frequency];
  if (!freq || freq.perDay === 0 || !med.startDate) return 0;
  if (dayKey < med.startDate) return 0;
  if (med.endDate && dayKey > med.endDate) return 0;

  if (freq.everyNDays) {
    return daysBetweenKeys(med.startDate, dayKey) % freq.everyNDays === 0 ? freq.perDay : 0;
  }
  if (freq.monthly) {
    // A course started on the 31st is due on the last day of shorter months
    const [y, m, d] = dayKey.split('-').map(Number);
    const startDay = Number(med.startDate.slice(8, 10));
    return d === Math.min(startDay, daysInMonth(y, m - 1)) ? freq.perDay : 0;
  }
  return freq.perDay;
}

function givenSlotsOn(doses, dayKey) {
  return [...new Set(doses.filter((d) => d.date === dayKey).map((d) => d.slot))].sort((a, b) => a - b);
}

// Share of scheduled doses given over the `days` days before today (today is
// still in progress, so it doesn't count against the owner). null = nothing was due.
function adherence(med, doses, todayKey, days) {
  let expected = 0;
  let given = 0;
  for (let i = 1; i <= days; i++) {
    const key = addDays(todayKey, -i);
    const due = dosesDueOn(med, key);
    if (!due) continue;
    expected += due;
    given += Math.min(givenSlotsOn(doses, key).filter((slot) => slot < due).length, due);
  }
  return expected ? Math.round((given / expected) * 100) : null;
}

// Consecutive due days, counting back from yesterday (plus today if already
// complete), where every scheduled dose was given
function streak(med, doses, todayKey) {
  let count = 0;
  const todayDue = dosesDueOn(med, todayKey);
  if (todayDue && givenSlotsOn(doses, todayKey).filter((s) => s < todayDue).length >= todayDue) count++;

  for (let i = 1; i <= 366; i++) {
    const key = addDays(todayKey, -i);
    if (key < med.startDate) break;
    const due = dosesDueOn(med, key);
    if (!due) continue;
    if (givenSlotsOn(doses, key).filter((s) => s < due).length >= due) count++;
    else break;
  }
  return count;
}

function isActiveOn(med, dayKey) {
  if (med.startDate && dayKey < med.startDate) return false;
  if (med.endDate && dayKey > med.endDate) return false;
  return true;
}

/**
 * Everything the UI and reminders need about one medication, as of `todayKey`.
 * @param {object} med — { frequency, startDate, endDate, ... }
 * @param {{ date: string, slot: number }[]} doses — this medication's dose log
 */
function summarizeMedication(med, doses, todayKey) {
  const dueToday = dosesDueOn(med, todayKey);
  const givenToday = givenSlotsOn(doses, todayKey).filter((slot) => slot < dueToday || med.frequency === 'as_needed');
  const yesterday = addDays(todayKey, -1);
  const dueYesterday = dosesDueOn(med, yesterday);
  const givenYesterday = givenSlotsOn(doses, yesterday).filter((slot) => slot < dueYesterday).length;

  return {
    active: isActiveOn(med, todayKey),
    frequencyLabel: FREQUENCIES[med.frequency]?.label || med.frequency,
    dueToday,
    givenToday,
    remainingToday: Math.max(dueToday - givenToday.length, 0),
    missedYesterday: Math.max(dueYesterday - givenYesterday, 0),
    endsInDays: med.endDate ? daysBetweenKeys(todayKey, med.endDate) : null,
    adherence7: adherence(med, doses, todayKey, 7),
    adherence30: adherence(med, doses, todayKey, 30),
    streak: streak(med, doses, todayKey),
    // Oldest first, ending today — drives the 14-day dose grid
    history: Array.from({ length: HISTORY_GRID_DAYS }, (_, i) => {
      const date = addDays(todayKey, i - (HISTORY_GRID_DAYS - 1));
      const due = dosesDueOn(med, date);
      return { date, due, given: Math.min(givenSlotsOn(doses, date).filter((slot) => slot < due).length, due) };
    }),
  };
}

module.exports = {
  FREQUENCIES,
  isDateKey,
  localDateKey,
  addDays,
  daysBetweenKeys,
  dosesDueOn,
  summarizeMedication,
};
