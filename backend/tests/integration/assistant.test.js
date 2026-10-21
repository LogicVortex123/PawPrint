const { startTestApp, stopTestApp, createUser, request } = require('./helpers');

// Parses the newline-delimited JSON stream into { text, done }
const readChat = (res) => {
  const events = res.text.trim().split('\n').map((line) => JSON.parse(line));
  return { text: events.filter((e) => e.type === 'text').map((e) => e.text).join(''), done: events.find((e) => e.type === 'done') };
};

let owner;
let pet;

beforeAll(async () => {
  delete process.env.ANTHROPIC_API_KEY; // always the built-in replies in tests
  await startTestApp();
  owner = await createUser('Riya Sharma');
  pet = (await owner.post('/pets', { name: 'Bruno', species: 'dog', allergies: ['Chicken'] })).body;
  await owner.post(`/pets/${pet._id}/vaccinations`, { vaccineName: 'Rabies', administrationDate: '2025-01-01', nextDueDate: '2025-12-31' });
});
afterAll(stopTestApp);

describe('assistant', () => {
  test('status says which engine answers', async () => {
    const res = await owner.get('/assistant/status');
    expect(res.body).toMatchObject({ mode: 'built-in', signedIn: true });
    expect(res.body.suggestions.length).toBeGreaterThan(0);
  });

  test('answers from the signed-in owner\'s records', async () => {
    const res = await owner.post('/assistant/chat', { messages: [{ role: 'user', content: 'Is Bruno due any vaccines?' }], petId: pet._id });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/ndjson/);
    const { text, done } = readChat(res);
    expect(text).toMatch(/Rabies.*overdue/);
    expect(done).toMatchObject({ source: 'built-in', actions: [{ to: `/dashboard?tab=vaccinations&pet=${pet._id}` }] });
  });

  test('never reveals another owner\'s pets', async () => {
    const other = await createUser('Someone Else');
    const { text } = readChat(await other.post('/assistant/chat', { messages: [{ role: 'user', content: 'Tell me about Bruno\'s vaccines' }], petId: pet._id }));
    expect(text).not.toMatch(/Rabies/);
    expect(text).toMatch(/Add your first pet/);
  });

  test('works for guests and with an expired token', async () => {
    const guest = readChat(await request().post('/assistant/chat').send({ messages: [{ role: 'user', content: 'hello' }] }));
    expect(guest.text).toMatch(/PawPal/);
    const stale = await request().post('/assistant/chat').set('Authorization', 'Bearer not-a-token').send({ messages: [{ role: 'user', content: 'hi' }] });
    expect(stale.status).toBe(200);
  });

  test('rejects empty, malformed and oversized messages', async () => {
    expect((await owner.post('/assistant/chat', { messages: [] })).status).toBe(400);
    expect((await owner.post('/assistant/chat', { messages: [{ role: 'system', content: 'x' }] })).status).toBe(400);
    expect((await owner.post('/assistant/chat', { messages: [{ role: 'user', content: 'hi' }, { role: 'assistant', content: 'hello' }] })).status).toBe(400);
    expect((await owner.post('/assistant/chat', { messages: [{ role: 'user', content: 'x'.repeat(2001) }] })).status).toBe(400);
  });
});
