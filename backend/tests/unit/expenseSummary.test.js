const { summarizeExpenses, toCsv } = require('../../src/services/expenseSummary.service');
const { weightTargetStatus } = require('../../src/services/reminders.service');
const { stripOperators } = require('../../src/middleware/security.middleware');

const e = (amount, date, category = 'food', pet = 'p1') => ({ _id: `${date}-${amount}`, amount, date, category, pet });

describe('summarizeExpenses', () => {
  test('totals by month, category and pet without floating-point drift', () => {
    const s = summarizeExpenses([e(0.1, '2026-01-05'), e(0.2, '2026-01-06'), e(100, '2026-02-01', 'vet', 'p2'), e(50, '2025-12-31')], { year: 2026, todayKey: '2026-02-10' });
    expect(s.total).toBe(100.3);
    expect(s.byMonth.slice(0, 2)).toEqual([0.3, 100]);
    expect(s.byCategory.map((c) => c.category)).toEqual(['vet', 'food']);
    expect(s.byPet).toEqual({ p1: 0.3, p2: 100 });
    expect(s.thisMonth).toBe(100);
    expect(s.lastMonth).toBe(0.3);
    expect(s.monthlyAverage).toBe(50.15); // 2 months elapsed
    expect(s.largest.amount).toBe(100);
  });

  test('January compares against last December', () => {
    const s = summarizeExpenses([e(40, '2025-12-10'), e(10, '2026-01-02')], { year: 2026, todayKey: '2026-01-20' });
    expect(s).toMatchObject({ thisMonth: 10, lastMonth: 40, total: 10 });
  });

  test('custom "other" names get their own row, case-insensitively', () => {
    const custom = (amount, name) => ({ ...e(amount, '2026-03-01', 'other'), customCategory: name });
    const s = summarizeExpenses([custom(30, 'Daycare'), custom(20, 'daycare '), custom(5, ''), e(10, '2026-03-02', 'food')], { year: 2026, todayKey: '2026-03-10' });
    expect(s.byCategory.map(({ category, label, total }) => ({ category, label, total }))).toEqual([
      { category: 'other', label: 'Daycare', total: 50 },
      { category: 'food', label: 'Food & treats', total: 10 },
      { category: 'other', label: 'Other', total: 5 },
    ]);
  });

  test('past years average over 12 months', () => {
    expect(summarizeExpenses([e(120, '2025-06-01')], { year: 2025, todayKey: '2026-03-01' }).monthlyAverage).toBe(10);
  });
});

test('toCsv quotes special characters and neutralises formulas', () => {
  expect(toCsv([['a,b', 'say "hi"', '=1+1', '-5.00', '@cmd']])).toBe(`"a,b","say ""hi""",'=1+1,-5.00,'@cmd`);
});

test('weightTargetStatus', () => {
  expect(weightTargetStatus(33, 25, 30)).toEqual({ status: 'above', percent: 10 });
  expect(weightTargetStatus(20, 25, 30)).toEqual({ status: 'below', percent: 20 });
  expect(weightTargetStatus(27, 25, 30)).toEqual({ status: 'within', percent: 0 });
  expect(weightTargetStatus(27, null, null)).toBeNull();
  expect(weightTargetStatus(undefined, 25, 30)).toBeNull();
});

test('stripOperators removes Mongo operators at any depth', () => {
  expect(stripOperators({ email: { $gt: '' }, name: 'x', nested: [{ $where: '1', ok: 1 }], 'a.b': 1 }))
    .toEqual({ email: {}, name: 'x', nested: [{ ok: 1 }] });
});
