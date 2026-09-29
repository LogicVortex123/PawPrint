const { buildReminders, daysBetween } = require('../src/services/reminders.service');

const now = new Date('2026-01-10T15:00:00Z');
const pet = { _id: 'p1', name: 'Bruno' };
const allOn = { reminders: { vaccination: true, appointment: true, weight: true }, reminderLeadDays: 14 };
const freshWeight = { p1: '2026-01-05' };

describe('daysBetween', () => {
  test('counts calendar days, ignoring the time of day', () => {
    expect(daysBetween(now, '2026-01-10T00:00:00Z')).toBe(0);
    expect(daysBetween(now, '2026-01-11T23:00:00Z')).toBe(1);
    expect(daysBetween(now, '2026-01-08')).toBe(-2);
  });
});

describe('buildReminders', () => {
  test('flags an overdue vaccine as urgent', () => {
    const { reminders } = buildReminders({
      pets: [pet], preferences: allOn, now, latestWeightByPet: freshWeight,
      vaccinations: [{ _id: 'v1', pet: 'p1', vaccineName: 'Rabies', administrationDate: '2025-01-01', nextDueDate: '2026-01-01' }],
    });
    expect(reminders).toHaveLength(1);
    expect(reminders[0]).toMatchObject({ type: 'vaccination', urgency: 'urgent', title: 'Rabies is overdue', petName: 'Bruno' });
  });

  test('ignores an old dose once a newer booster exists', () => {
    const { reminders } = buildReminders({
      pets: [pet], preferences: allOn, now, latestWeightByPet: freshWeight,
      vaccinations: [
        { _id: 'old', pet: 'p1', vaccineName: 'Rabies', administrationDate: '2025-01-01', nextDueDate: '2026-01-01' },
        { _id: 'new', pet: 'p1', vaccineName: 'rabies ', administrationDate: '2026-01-02', nextDueDate: '2027-01-02' },
      ],
    });
    expect(reminders).toHaveLength(0);
  });

  test('only shows vaccines due within the lead time', () => {
    const vaccinations = [{ _id: 'v1', pet: 'p1', vaccineName: 'DHPP', administrationDate: '2025-02-01', nextDueDate: '2026-01-30' }];
    expect(buildReminders({ pets: [pet], vaccinations, preferences: allOn, now, latestWeightByPet: freshWeight }).reminders).toHaveLength(0);

    const { reminders } = buildReminders({ pets: [pet], vaccinations, preferences: { ...allOn, reminderLeadDays: 30 }, now, latestWeightByPet: freshWeight });
    expect(reminders[0]).toMatchObject({ urgency: 'upcoming', daysUntil: 20 });
  });

  test('upcoming appointment tomorrow is urgent; a missed one gets a nudge', () => {
    const { reminders } = buildReminders({
      pets: [pet], preferences: allOn, now, latestWeightByPet: freshWeight,
      appointments: [
        { _id: 'a1', pet: 'p1', status: 'scheduled', reason: 'Checkup', clinic: { name: 'Green Valley' }, date: '2026-01-11T10:00:00Z' },
        { _id: 'a2', pet: 'p1', status: 'scheduled', reason: 'Dental', clinic: { name: 'Green Valley' }, date: '2026-01-05T10:00:00Z' },
        { _id: 'a3', pet: 'p1', status: 'completed', reason: 'Old', clinic: { name: 'X' }, date: '2026-01-12T10:00:00Z' },
      ],
    });
    expect(reminders.map((r) => [r.id, r.urgency])).toEqual([
      ['appointment-a1', 'urgent'],
      ['appointment-a2', 'info'],
    ]);
  });

  test('nudges a weigh-in when none is logged or the last is 30+ days old', () => {
    const first = buildReminders({ pets: [pet], preferences: allOn, now });
    expect(first.reminders[0].id).toBe('weight-first-p1');

    const stale = buildReminders({ pets: [pet], preferences: allOn, now, latestWeightByPet: { p1: '2025-12-01' } });
    expect(stale.reminders[0]).toMatchObject({ id: 'weight-stale-p1', message: "Bruno's last weight was logged 40 days ago." });
  });

  test('respects turned-off reminder types', () => {
    const { reminders } = buildReminders({
      pets: [pet], now,
      preferences: { reminders: { vaccination: false, appointment: true, weight: false }, reminderLeadDays: 14 },
      vaccinations: [{ _id: 'v1', pet: 'p1', vaccineName: 'Rabies', administrationDate: '2025-01-01', nextDueDate: '2026-01-01' }],
    });
    expect(reminders).toHaveLength(0);
  });

  test('sorts urgent first, then upcoming, then suggestions', () => {
    const { reminders } = buildReminders({
      pets: [pet], preferences: allOn, now,
      vaccinations: [
        { _id: 'soon', pet: 'p1', vaccineName: 'Lepto', administrationDate: '2025-01-20', nextDueDate: '2026-01-20' },
        { _id: 'late', pet: 'p1', vaccineName: 'Rabies', administrationDate: '2025-01-01', nextDueDate: '2026-01-01' },
      ],
    });
    expect(reminders.map((r) => r.urgency)).toEqual(['urgent', 'upcoming', 'info']);
  });
});
