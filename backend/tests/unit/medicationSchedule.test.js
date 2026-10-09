const { dosesDueOn, summarizeMedication, addDays, isDateKey } = require('../../src/services/medicationSchedule.service');

const med = (overrides = {}) => ({ _id: 'm1', name: 'Apoquel', frequency: 'once_daily', startDate: '2026-01-01', ...overrides });
const dose = (date, slot = 0) => ({ medication: 'm1', date, slot });

describe('isDateKey / addDays', () => {
  test('validates YYYY-MM-DD and crosses month ends', () => {
    expect(isDateKey('2026-02-28')).toBe(true);
    expect(isDateKey('2026-2-28')).toBe(false);
    expect(isDateKey(undefined)).toBe(false);
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('dosesDueOn', () => {
  test('daily frequencies give 1, 2 or 3 slots inside the course only', () => {
    expect(dosesDueOn(med(), '2026-01-05')).toBe(1);
    expect(dosesDueOn(med({ frequency: 'twice_daily' }), '2026-01-05')).toBe(2);
    expect(dosesDueOn(med({ frequency: 'three_times_daily' }), '2026-01-05')).toBe(3);
    expect(dosesDueOn(med(), '2025-12-31')).toBe(0);
    expect(dosesDueOn(med({ endDate: '2026-01-10' }), '2026-01-10')).toBe(1);
    expect(dosesDueOn(med({ endDate: '2026-01-10' }), '2026-01-11')).toBe(0);
  });

  test('every other day and weekly count from the start date', () => {
    const eod = med({ frequency: 'every_other_day' });
    expect(['2026-01-01', '2026-01-02', '2026-01-03'].map((d) => dosesDueOn(eod, d))).toEqual([1, 0, 1]);
    const weekly = med({ frequency: 'weekly' });
    expect(dosesDueOn(weekly, '2026-01-08')).toBe(1);
    expect(dosesDueOn(weekly, '2026-01-09')).toBe(0);
  });

  test('monthly on the 31st falls back to the last day of shorter months', () => {
    const monthly = med({ frequency: 'monthly', startDate: '2026-01-31' });
    expect(dosesDueOn(monthly, '2026-02-28')).toBe(1);
    expect(dosesDueOn(monthly, '2026-02-27')).toBe(0);
    expect(dosesDueOn(monthly, '2026-03-31')).toBe(1);
  });

  test('as-needed is never scheduled', () => {
    expect(dosesDueOn(med({ frequency: 'as_needed' }), '2026-01-05')).toBe(0);
  });
});

describe('summarizeMedication', () => {
  test("today's progress, yesterday's misses and adherence", () => {
    const twice = med({ frequency: 'twice_daily', startDate: '2026-01-01' });
    // Jan 3–9: every dose given except the evening of Jan 9 (yesterday)
    const doses = [];
    for (let d = 3; d <= 9; d++) {
      const key = `2026-01-${String(d).padStart(2, '0')}`;
      doses.push(dose(key, 0));
      if (d !== 9) doses.push(dose(key, 1));
    }
    doses.push(dose('2026-01-10', 0));

    const s = summarizeMedication(twice, doses, '2026-01-10');
    expect(s).toMatchObject({ active: true, dueToday: 2, givenToday: [0], remainingToday: 1, missedYesterday: 1 });
    expect(s.adherence7).toBe(Math.round((13 / 14) * 100));
    expect(s.streak).toBe(0); // yesterday broke it, today isn't complete
  });

  test('streak counts complete days back from yesterday, plus today once done', () => {
    const doses = ['2026-01-07', '2026-01-08', '2026-01-09', '2026-01-10'].map((d) => dose(d));
    expect(summarizeMedication(med(), doses, '2026-01-10').streak).toBe(4);
    expect(summarizeMedication(med(), doses.slice(0, 3), '2026-01-10').streak).toBe(3);
  });

  test('ending soon and finished courses', () => {
    expect(summarizeMedication(med({ endDate: '2026-01-12' }), [], '2026-01-10').endsInDays).toBe(2);
    expect(summarizeMedication(med({ endDate: '2026-01-09' }), [], '2026-01-10').active).toBe(false);
    expect(summarizeMedication(med(), [], '2026-01-10').adherence7).toBe(0);
    expect(summarizeMedication(med({ startDate: '2026-01-10' }), [], '2026-01-10').adherence7).toBeNull();
  });
});
