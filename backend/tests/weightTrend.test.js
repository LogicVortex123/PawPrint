const { withTrend } = require('../src/services/weightTrend.service');

describe('withTrend', () => {
  test('first entry has no trend', () => {
    const result = withTrend([{ weightKg: 10 }]);
    expect(result[0].trendPercent).toBeNull();
  });

  test('computes percentage change vs previous entry', () => {
    const result = withTrend([{ weightKg: 10 }, { weightKg: 12 }]);
    expect(result[1].trendPercent).toBe(20);
  });

  test('computes negative trend for weight loss', () => {
    const result = withTrend([{ weightKg: 10 }, { weightKg: 9 }]);
    expect(result[1].trendPercent).toBe(-10);
  });
});
