import { describe, it, expect } from 'vitest';
import { todayKey, addDaysToKey, addMonthsToKey, formatDateKey, isoToDateKey } from './dates';
import { formatMoney, categoryInfo } from './money';
import { mapBackendPet, mapBackendExpense, currentMedicationLabels, medicationLabel, weightTargetStatus } from './adapters';
import { Medication } from '../types';

describe('dates', () => {
  it('builds local YYYY-MM-DD keys', () => {
    expect(todayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('adds days across month and year ends', () => {
    expect(addDaysToKey('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDaysToKey('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('adds months, clamping to the last day of shorter months', () => {
    expect(addMonthsToKey('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonthsToKey('2024-01-31', 1)).toBe('2024-02-29');
    expect(addMonthsToKey('2026-05-15', 12)).toBe('2027-05-15');
  });

  it('formats keys without timezone drift', () => {
    expect(formatDateKey('2026-03-01')).toBe('1 Mar 2026');
    expect(isoToDateKey(new Date(2026, 6, 4, 23, 30).toISOString())).toBe('2026-07-04');
  });
});

describe('money', () => {
  it('formats in the chosen currency', () => {
    expect(formatMoney(150000.5, 'INR')).toBe('₹1,50,000.50');
    expect(formatMoney(12, 'USD')).toBe('$12.00');
    expect(formatMoney(1200, 'JPY')).toBe('¥1,200');
  });

  it('falls back to "Other" for unknown categories', () => {
    // @ts-expect-error — deliberately invalid
    expect(categoryInfo('cars').label).toBe('Other');
  });
});

describe('adapters', () => {
  it('maps a backend pet, including the target weight range', () => {
    const pet = mapBackendPet({
      _id: 'p1', name: 'Bruno', species: 'Dog', gender: 'female', dateOfBirth: '2020-02-10T00:00:00.000Z',
      allergies: ['Chicken', ''], targetWeightMinKg: 25, targetWeightMaxKg: null,
    });
    expect(pet).toMatchObject({ id: 'p1', species: 'dog', gender: 'Female', dob: '2020-02-10', allergies: ['Chicken'], targetWeightMinKg: 25, targetWeightMaxKg: null });
    expect(pet.photo).toBe('/images/dog-portrait.webp');
  });

  it('maps an expense', () => {
    expect(mapBackendExpense({ _id: 'e1', pet: 'p1', category: 'vet', amount: 10, date: '2026-01-01' }))
      .toEqual({ id: 'e1', petId: 'p1', category: 'vet', amount: 10, date: '2026-01-01', description: '', vendor: '', appointmentId: null });
  });

  it('merges tracked and free-text medications without duplicates', () => {
    const tracked = {
      id: 'm1', petId: 'p1', name: 'Apoquel', dosage: '1 tablet',
      schedule: { active: true, frequencyLabel: 'Twice a day' },
    } as unknown as Medication;
    const finished = { ...tracked, id: 'm2', name: 'Amoxicillin', schedule: { active: false, frequencyLabel: 'Once a day' } } as unknown as Medication;
    expect(medicationLabel(tracked)).toBe('Apoquel — 1 tablet, twice a day');
    expect(currentMedicationLabels({ id: 'p1', medications: ['apoquel', 'Fish oil'] }, [tracked, finished]))
      .toEqual(['Apoquel — 1 tablet, twice a day', 'Fish oil']);
  });

  it('classifies a weight against the target range', () => {
    expect(weightTargetStatus(33, 25, 30)).toEqual({ status: 'above', percent: 10 });
    expect(weightTargetStatus(27, 25, null)).toEqual({ status: 'within', percent: 0 });
    expect(weightTargetStatus(27, null, null)).toBeNull();
  });
});
