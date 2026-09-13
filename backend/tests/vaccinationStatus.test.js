const { deriveVaccinationStatus } = require('../src/services/vaccinationStatus.service');

describe('deriveVaccinationStatus', () => {
  const now = new Date('2026-01-01T00:00:00Z');

  test('returns Overdue when due date is in the past', () => {
    expect(deriveVaccinationStatus('2025-12-01', now)).toBe('Overdue');
  });

  test('returns Upcoming when due within 30 days', () => {
    expect(deriveVaccinationStatus('2026-01-15', now)).toBe('Upcoming');
  });

  test('returns Completed when due date is far in the future', () => {
    expect(deriveVaccinationStatus('2026-06-01', now)).toBe('Completed');
  });
});
