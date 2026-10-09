// Mock the mailer so password-reset links can be read from the "sent" email
jest.mock('../../src/services/email.service', () => ({
  sendMail: jest.fn(async () => ({ delivered: false, simulated: true })),
  isConfigured: () => false,
}));

const request = require('supertest');
const { startTestApp, stopTestApp, createUser } = require('./helpers');
const { sendMail } = require('../../src/services/email.service');

let app;
beforeAll(async () => { app = await startTestApp(); });
afterAll(stopTestApp);

describe('registration and login', () => {
  test('rejects invalid input with clear 400s', async () => {
    const cases = [
      [{ name: 'A', email: 'not-an-email', password: 'password123' }, /valid email/],
      [{ name: 'A', email: 'a@example.com', password: 'short' }, /at least 8/],
      [{ name: '', email: 'a@example.com', password: 'password123' }, /Name is required/],
      [{ name: 'A', email: { $gt: '' }, password: 'password123' }, /valid email/],
    ];
    for (const [body, message] of cases) {
      const res = await request(app).post('/auth/register').send(body);
      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(message);
    }
  });

  test('duplicate emails are refused, case-insensitively', async () => {
    const owner = await createUser();
    const res = await request(app).post('/auth/register').send({ name: 'B', email: owner.email.toUpperCase(), password: 'password123' });
    expect(res.status).toBe(409);
  });

  test('login works and never reveals the password hash', async () => {
    const owner = await createUser();
    const res = await request(app).post('/auth/login').send({ email: owner.email, password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|\$2b\$/);

    const wrong = await request(app).post('/auth/login').send({ email: owner.email, password: 'wrong-password' });
    expect(wrong.status).toBe(401);
  });

  test('NoSQL operator injection in login is blocked', async () => {
    await createUser();
    const res = await request(app).post('/auth/login').send({ email: { $gt: '' }, password: { $gt: '' } });
    expect(res.status).toBe(400);
  });

  test('protected routes need a valid token', async () => {
    expect((await request(app).get('/auth/me')).status).toBe(401);
    expect((await request(app).get('/auth/me').set('Authorization', 'Bearer nonsense')).status).toBe(401);
  });
});

describe('account settings', () => {
  test('preferences save, including currency and medication reminders', async () => {
    const owner = await createUser();
    const res = await owner.put('/auth/me', { preferences: { currency: 'USD', reminders: { medication: false } } });
    expect(res.status).toBe(200);
    expect(res.body.preferences.currency).toBe('USD');
    expect(res.body.preferences.reminders.medication).toBe(false);

    const bad = await owner.put('/auth/me', { preferences: { currency: 'XYZ' } });
    expect(bad.status).toBe(400);
  });

  test('data export includes records but no secrets', async () => {
    const owner = await createUser();
    const pet = (await owner.post('/pets', { name: 'Bruno', species: 'dog' })).body;
    await owner.post(`/pets/${pet._id}/shares`, { days: 7 });
    await owner.post(`/pets/${pet._id}/expenses`, { amount: 500, date: '2026-01-05', category: 'food' });

    const res = await owner.get('/auth/export');
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toMatch(/attachment; filename="pawprint-data-/);
    expect(res.body.pets).toHaveLength(1);
    expect(res.body.expenses[0].amount).toBe(500);
    expect(res.body.shareLinks).toHaveLength(1);
    const raw = JSON.stringify(res.body);
    expect(raw).not.toMatch(/passwordHash|resetPassword|"token"/);
  });
});

describe('forgot / reset password', () => {
  test('full flow: email link resets the password once', async () => {
    const owner = await createUser();
    sendMail.mockClear();

    const forgot = await request(app).post('/auth/forgot-password').send({ email: owner.email });
    expect(forgot.status).toBe(200);
    expect(sendMail).toHaveBeenCalledTimes(1);
    const token = sendMail.mock.calls[0][0].text.match(/token=([a-f0-9]{64})/)[1];

    const reset = await request(app).post('/auth/reset-password').send({ token, password: 'brandNewPass1' });
    expect(reset.status).toBe(200);
    expect(reset.body.token).toBeTruthy();

    expect((await request(app).post('/auth/reset-password').send({ token, password: 'anotherPass1' })).status).toBe(400);
    expect((await request(app).post('/auth/login').send({ email: owner.email, password: 'password123' })).status).toBe(401);
    expect((await request(app).post('/auth/login').send({ email: owner.email, password: 'brandNewPass1' })).status).toBe(200);
  });

  test('unknown emails get the same reply and no email is sent', async () => {
    sendMail.mockClear();
    const res = await request(app).post('/auth/forgot-password').send({ email: 'nobody@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/If an account exists/);
    expect(sendMail).not.toHaveBeenCalled();
  });
});
