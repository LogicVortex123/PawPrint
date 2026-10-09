const mongoose = require('mongoose');
const { startTestApp, stopTestApp, createUser, request } = require('./helpers');

let owner;
let pet;

beforeAll(async () => {
  await startTestApp();
  owner = await createUser('Asha Rao');
  pet = (await owner.post('/pets', { name: 'Bruno', species: 'dog', allergies: ['Chicken'] })).body;
});
afterAll(stopTestApp);

describe('expenses', () => {
  test('create, list, summarise and export', async () => {
    const add = (body) => owner.post(`/pets/${pet._id}/expenses?date=2026-03-15`, body);
    expect((await add({ amount: 1500.5, date: '2026-03-02', category: 'vet', description: 'Checkup' })).status).toBe(201);
    expect((await add({ amount: 0.1, date: '2026-03-03', category: 'food' })).status).toBe(201);
    expect((await add({ amount: 0.2, date: '2026-02-20', category: 'food', description: '=HYPERLINK("x")' })).status).toBe(201);
    expect((await add({ amount: 999, date: '2025-12-31', category: 'grooming' })).status).toBe(201);

    const summary = (await owner.get('/expenses/summary?year=2026&date=2026-03-15')).body;
    expect(summary).toMatchObject({ year: 2026, currency: 'INR', total: 1500.8, count: 3, thisMonth: 1500.6, lastMonth: 0.2 });
    expect(summary.byMonth[2]).toBe(1500.6);
    expect(summary.byCategory[0]).toMatchObject({ category: 'vet', total: 1500.5 });
    expect(summary.monthlyAverage).toBe(500.27);

    const list = (await owner.get('/expenses?year=2026')).body;
    expect(list.map((e) => e.date)).toEqual(['2026-03-03', '2026-03-02', '2026-02-20']);

    const csv = await owner.get('/expenses/export.csv?year=2026');
    expect(csv.headers['content-type']).toMatch(/text\/csv/);
    expect(csv.text).toContain('Date,Pet,Category,Description,Where,Amount (INR)');
    expect(csv.text).toContain('2026-03-02,Bruno,Vet visits,Checkup,,1500.50');
    // Spreadsheet formulas are neutralised
    expect(csv.text).toContain(`"'=HYPERLINK(""x"")"`);
  });

  test('rejects bad amounts, dates and categories', async () => {
    const bad = [{ amount: -1, date: '2026-01-01' }, { amount: 10, date: '01/02/2026' }, { amount: 'abc', date: '2026-01-01' }, { amount: 5, date: '2026-01-01', category: 'cars' }];
    for (const body of bad) expect((await owner.post(`/pets/${pet._id}/expenses`, body)).status).toBe(400);
  });

  test('can be linked to the owner\'s own appointment only', async () => {
    const apt = (await owner.post('/appointments', { pet: pet._id, clinic: { name: 'Green Valley' }, date: '2026-03-01T10:00:00Z' })).body;
    const linked = await owner.post(`/pets/${pet._id}/expenses`, { amount: 800, date: '2026-03-01', category: 'vet', appointment: apt._id });
    expect(linked.status).toBe(201);
    expect(linked.body.appointment).toBe(apt._id);

    const other = await createUser();
    const otherPet = (await other.post('/pets', { name: 'Milo', species: 'cat' })).body;
    const res = await other.post(`/pets/${otherPet._id}/expenses`, { amount: 1, date: '2026-03-01', appointment: apt._id });
    expect(res.status).toBe(404);
  });
});

describe('clinics', () => {
  let clinicId;
  beforeAll(async () => {
    const Clinic = require('../../src/models/Clinic.model');
    const [a] = await Clinic.create([
      { name: 'Zeta Vets', latitude: 12.97, longitude: 77.59, emergency24_7: true },
      { name: 'Alpha Animal Care', latitude: 13.5, longitude: 77.9 },
    ]);
    clinicId = String(a._id);
  });

  test('favourites are saved on the account and shown first', async () => {
    expect((await owner.put(`/clinics/${clinicId}/favorite`)).body.favoriteClinicIds).toEqual([clinicId]);
    // Adding twice keeps one copy
    expect((await owner.put(`/clinics/${clinicId}/favorite`)).body.favoriteClinicIds).toEqual([clinicId]);

    const nearby = (await owner.get('/clinics/nearby')).body;
    expect(nearby[0]).toMatchObject({ name: 'Zeta Vets', isFavorite: true });
    expect((await owner.get('/clinics/favorites')).body.map((c) => c.name)).toEqual(['Zeta Vets']);
    expect((await owner.get('/auth/me')).body.favoriteClinicIds).toEqual([clinicId]);

    expect((await owner.del(`/clinics/${clinicId}/favorite`)).body.favoriteClinicIds).toEqual([]);
    expect((await owner.put(`/clinics/${new mongoose.Types.ObjectId()}/favorite`)).status).toBe(404);
  });

  test('ranks by distance and validates coordinates', async () => {
    const ranked = (await owner.get('/clinics/nearby?lat=12.97&lng=77.59')).body;
    expect(ranked[0].name).toBe('Zeta Vets');
    expect(ranked[0].distanceKm).toBe(0);
    expect((await owner.get('/clinics/nearby?lat=200&lng=0')).status).toBe(400);
  });
});

describe('vaccine catalogue and weight targets', () => {
  test('catalogue suggests vaccines per species', async () => {
    const res = await owner.get('/vaccinations/catalog?species=cat');
    expect(res.status).toBe(200);
    expect(res.body.vaccines.some((v) => v.name.startsWith('FVRCP'))).toBe(true);
    expect(res.body.disclaimer).toMatch(/vet/);
  });

  test('a weight outside the target range creates a reminder', async () => {
    await owner.put(`/pets/${pet._id}`, { targetWeightMinKg: 25, targetWeightMaxKg: 30 });
    await owner.post(`/pets/${pet._id}/weights`, { weightKg: 33 });
    const { reminders } = (await owner.get('/reminders')).body;
    const r = reminders.find((x) => x.id === `weight-target-${pet._id}`);
    expect(r).toMatchObject({ title: 'Bruno is above the target weight' });
    expect(r.message).toMatch(/33 kg vs target 25–30 kg \(10% over\)/);

    // Clearing the target removes it
    await owner.put(`/pets/${pet._id}`, { targetWeightMinKg: null, targetWeightMaxKg: null });
    const after = (await owner.get('/reminders')).body.reminders;
    expect(after.some((x) => x.id.startsWith('weight-target'))).toBe(false);
  });
});

describe('share links', () => {
  test('public view works without login, then stops after revoking', async () => {
    const link = (await owner.post(`/pets/${pet._id}/shares`, { days: 7, label: 'Dr. Mehta' })).body;
    const view = await request().get(`/shares/public/${link.token}`);
    expect(view.status).toBe(200);
    expect(view.body).toMatchObject({ sharedBy: 'Asha', pet: { name: 'Bruno', allergies: ['Chicken'] } });
    expect(JSON.stringify(view.body)).not.toContain(owner.email);

    await owner.del(`/shares/${link.id}`);
    expect((await request().get(`/shares/public/${link.token}`)).status).toBe(404);
  });
});

describe('platform', () => {
  test('health check reports the database', async () => {
    const res = await request().get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', database: 'connected' });
  });

  test('security headers are set and x-powered-by is hidden', async () => {
    const res = await request().get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  test('malformed JSON and unknown routes get clean errors', async () => {
    const bad = await request().post('/auth/login').set('Content-Type', 'application/json').send('{"email": ');
    expect(bad.status).toBe(400);
    expect(bad.body.error.message).toMatch(/not valid JSON/);
    expect((await request().get('/nope')).status).toBe(404);
  });
});
