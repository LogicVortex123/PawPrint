// One owner must never be able to read or change another owner's records,
// and no request may set fields it shouldn't (owner, pet, _id...).

const { startTestApp, stopTestApp, createUser } = require('./helpers');

let alice;
let bob;
let pet;

beforeAll(async () => {
  await startTestApp();
  alice = await createUser('Alice');
  bob = await createUser('Bob');
  pet = (await alice.post('/pets', { name: 'Bruno', species: 'dog' })).body;
});
afterAll(stopTestApp);

test("another user can't see, edit or delete a pet", async () => {
  expect((await bob.get(`/pets/${pet._id}`)).status).toBe(404);
  expect((await bob.put(`/pets/${pet._id}`, { name: 'Stolen' })).status).toBe(404);
  expect((await bob.del(`/pets/${pet._id}`)).status).toBe(404);
  expect((await bob.get('/pets')).body).toHaveLength(0);
});

test("another user can't touch nested records", async () => {
  const vax = (await alice.post(`/pets/${pet._id}/vaccinations`, { vaccineName: 'Rabies', administrationDate: '2026-01-01', nextDueDate: '2027-01-01' })).body;
  const med = (await alice.post(`/pets/${pet._id}/medications`, { name: 'Apoquel', frequency: 'once_daily', startDate: '2026-01-01' })).body;
  const exp = (await alice.post(`/pets/${pet._id}/expenses`, { amount: 100, date: '2026-01-02' })).body;
  const share = (await alice.post(`/pets/${pet._id}/shares`, { days: 1 })).body;

  expect((await bob.get(`/pets/${pet._id}/vaccinations`)).status).toBe(404);
  expect((await bob.put(`/vaccinations/${vax._id}`, { vaccineName: 'X' })).status).toBe(404);
  expect((await bob.post(`/medications/${med._id}/doses`, { date: '2026-01-02', slot: 0 })).status).toBe(404);
  expect((await bob.put(`/expenses/${exp._id}`, { amount: 1 })).status).toBe(404);
  expect((await bob.del(`/shares/${share.id}`)).status).toBe(404);
  expect((await bob.post(`/pets/${pet._id}/expenses`, { amount: 1, date: '2026-01-01' })).status).toBe(404);
  expect((await bob.get('/expenses')).body).toHaveLength(0);
});

test('pet ownership cannot be changed through an update (mass assignment)', async () => {
  const res = await alice.put(`/pets/${pet._id}`, { name: 'Bruno II', owner: bob.user.id, $set: { owner: bob.user.id } });
  expect(res.status).toBe(200);
  expect(res.body.name).toBe('Bruno II');
  expect(res.body.owner).toBe(alice.user.id);
  expect((await bob.get(`/pets/${pet._id}`)).status).toBe(404);
});

test('a record cannot be moved to someone else\'s pet', async () => {
  const bobsPet = (await bob.post('/pets', { name: 'Milo', species: 'cat' })).body;
  const apt = (await alice.post('/appointments', { pet: pet._id, clinic: { name: 'Vet' }, date: '2030-01-01T10:00:00Z' })).body;
  expect((await alice.put(`/appointments/${apt._id}`, { pet: bobsPet._id })).status).toBe(404);
  expect((await alice.post('/appointments', { pet: bobsPet._id, clinic: { name: 'Vet' }, date: '2030-01-01T10:00:00Z' })).status).toBe(404);
});

test('validation errors come back as 400s, not crashes', async () => {
  expect((await alice.post(`/pets/${pet._id}/vaccinations`, { vaccineName: 'Rabies', administrationDate: '2026-05-01', nextDueDate: '2026-01-01' })).status).toBe(400);
  expect((await alice.post(`/pets/${pet._id}/weights`, { weightKg: -3 })).status).toBe(400);
  expect((await alice.put(`/pets/${pet._id}`, { targetWeightMinKg: 30, targetWeightMaxKg: 20 })).status).toBe(400);
  expect((await alice.get('/pets/not-an-id')).status).toBe(400);
  expect((await alice.post('/pets', { species: 'dog' })).status).toBe(400);
});

test('deleting a pet removes all its records', async () => {
  const temp = (await alice.post('/pets', { name: 'Temp', species: 'dog' })).body;
  await alice.post(`/pets/${temp._id}/expenses`, { amount: 10, date: '2026-01-01' });
  await alice.post(`/pets/${temp._id}/medications`, { name: 'X', frequency: 'once_daily', startDate: '2026-01-01' });
  expect((await alice.del(`/pets/${temp._id}`)).status).toBe(204);

  const all = (await alice.get('/expenses')).body;
  expect(all.some((e) => e.pet === temp._id)).toBe(false);
  const meds = (await alice.get('/medications')).body;
  expect(meds.some((m) => m.pet === temp._id)).toBe(false);
});
