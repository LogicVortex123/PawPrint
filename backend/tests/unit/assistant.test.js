const { detectIntent, replyLocally, actionsFor } = require('../../src/services/assistantLocal.service');
const { summarizePet } = require('../../src/services/assistantContext.service');

const now = new Date('2026-05-10T09:00:00Z');
const day = (offset) => new Date(now.getTime() + offset * 86_400_000);

const bruno = summarizePet({
  pet: { _id: 'p1', name: 'Bruno', species: 'dog', breed: 'Beagle', gender: 'male', allergies: ['Chicken'], microchipId: '123', targetWeightMinKg: 9, targetWeightMaxKg: 11 },
  vaccinations: [
    { vaccineName: 'Rabies', administrationDate: day(-400), nextDueDate: day(-35) },
    { vaccineName: 'Rabies', administrationDate: day(-5), nextDueDate: day(360) }, // newer dose replaces the overdue one
    { vaccineName: 'DHPP', administrationDate: day(-350), nextDueDate: day(-3) },
  ],
  weights: [{ weightKg: 10, recordedAt: day(-30) }, { weightKg: 12, recordedAt: day(-1) }],
  appointments: [{ status: 'scheduled', date: day(2), clinic: { name: 'Happy Paws' }, reason: 'Check-up' }, { status: 'cancelled', date: day(1), clinic: { name: 'X' } }],
  medications: [{ _id: 'm1', name: 'Apoquel', dosage: '5 mg', frequency: 'twice_daily', startDate: '2026-05-01' }],
  doses: [{ medication: 'm1', date: '2026-05-10', slot: 0 }],
  expenses: [{ amount: 1500, date: '2026-05-02' }, { amount: 500, date: '2026-04-02' }],
  todayKey: '2026-05-10',
  now,
});
const context = { owner: { firstName: 'Riya', currency: 'INR' }, today: '2026-05-10', pets: [bruno], reminders: [{ petId: 'p1', petName: 'Bruno', urgency: 'urgent', title: 'DHPP is overdue' }] };

describe('summarizePet', () => {
  test('keeps only the newest dose of each vaccine and works out status', () => {
    expect(bruno.vaccines.map((v) => [v.name, v.status])).toEqual([['DHPP', 'overdue'], ['Rabies', 'up to date']]);
  });
  test('summarises doses, weight, visits and spending', () => {
    expect(bruno.medications[0]).toMatchObject({ name: 'Apoquel', dueToday: 2, givenToday: 1, remainingToday: 1 });
    expect(bruno.weight).toMatchObject({ latestKg: 12, previousKg: 10, changePercent: 20 });
    expect(bruno.upcomingAppointments).toHaveLength(1);
    expect(bruno.spending).toEqual({ thisMonth: 1500, thisYear: 2000 });
  });
});

describe('detectIntent', () => {
  test.each([
    ['my dog ate chocolate!', 'emergency'],
    ['she is having a seizure', 'emergency'],
    ['When is the next booster?', 'vaccines'],
    ['have the doses been given', 'medications'],
    ['how is his weight', 'weight'],
    ['how is bruno doing', 'summary'],
    ['how much did we spend', 'expenses'],
    ['he keeps vomiting', 'symptoms'],
    ['how do I upload a medical document', 'appHelp'],
    ['what happened earlier this year', 'unknown'],
    ['hello', 'greeting'],
  ])('%s → %s', (q, intent) => expect(detectIntent(q)).toBe(intent));
});

describe('replyLocally', () => {
  test('answers from the records', () => {
    expect(replyLocally('when is the next vaccine due?', context, 'p1').text).toMatch(/DHPP — 3 days overdue/);
    expect(replyLocally('doses today?', context, 'p1').text).toMatch(/1 of 2 doses still to give/);
    expect(replyLocally('weight?', context, 'p1').text).toMatch(/12 kg[\s\S]*Above his healthy range/);
    expect(replyLocally('how much did I spend', context, 'p1').text).toMatch(/₹1,500/);
    expect(replyLocally('what needs attention', context, 'p1').text).toMatch(/DHPP is overdue/);
  });

  test('puts emergencies first and never answers them from records', () => {
    expect(replyLocally('bruno ate rat poison', context, 'p1').text).toMatch(/^\*\*This could be an emergency/);
  });

  test('guests get general help and an invitation to sign in', () => {
    expect(replyLocally('when is the vaccine due', null).text).toMatch(/Sign in/);
    expect(replyLocally('what foods are toxic', null).text).toMatch(/chocolate/);
    expect(actionsFor('greeting', null, false).map((a) => a.to)).toEqual(['/signup', '/login']);
  });

  test('links to the right dashboard section', () => {
    expect(actionsFor('vaccines', 'p1', true)).toEqual([{ label: 'Open vaccinations', to: '/dashboard?tab=vaccinations&pet=p1' }]);
    expect(actionsFor('emergency', 'p1', true)[0].to).toBe('/emergency?pet=p1');
  });
});
