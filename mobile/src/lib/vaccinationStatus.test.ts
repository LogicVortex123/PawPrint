import assert from 'node:assert/strict';
import test from 'node:test';
import { deriveVaccinationStatus } from './vaccinationStatus.ts';

const now = new Date('2026-11-17T12:00:00');

test('a due date in the past is overdue', () => {
  assert.equal(deriveVaccinationStatus('2026-11-01', now), 'Overdue');
});

test('a due date within 30 days is upcoming', () => {
  assert.equal(deriveVaccinationStatus('2026-12-01', now), 'Upcoming');
});

test('a due date further out is completed', () => {
  assert.equal(deriveVaccinationStatus('2027-03-01', now), 'Completed');
});
