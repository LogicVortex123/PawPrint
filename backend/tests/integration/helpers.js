// Spins up the real Express app against a throwaway in-memory MongoDB, so
// integration tests exercise routes, middleware, validation and the database
// together without touching the real (Atlas) database.

const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

let mongod;
let app;
let mongoose;

async function startTestApp() {
  mongod = await MongoMemoryServer.create();
  // Must be set before anything reads config/env.js
  process.env.NODE_ENV = 'test';
  process.env.MONGO_URI = mongod.getUri();
  process.env.JWT_SECRET = 'integration-test-secret-0123456789-abcdefghij';

  mongoose = require('mongoose');
  const connectDB = require('../../src/config/db');
  const log = console.log;
  console.log = () => {}; // keep "MongoDB connected" out of the test output
  try {
    await connectDB(mongod.getUri());
  } finally {
    console.log = log;
  }
  app = require('../../src/app');
  return app;
}

async function stopTestApp() {
  await mongoose?.disconnect();
  await mongod?.stop();
}

async function clearDatabase() {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
}

let counter = 0;
// Registers a fresh user and returns helpers bound to their token
async function createUser(name = 'Test Owner') {
  counter += 1;
  const email = `user${counter}-${Date.now()}@example.com`;
  const res = await request(app).post('/auth/register').send({ name, email, password: 'password123' });
  if (res.status !== 201) throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
  const auth = { Authorization: `Bearer ${res.body.token}` };
  return {
    email,
    token: res.body.token,
    user: res.body.user,
    get: (url) => request(app).get(url).set(auth),
    post: (url, body) => request(app).post(url).set(auth).send(body),
    put: (url, body) => request(app).put(url).set(auth).send(body),
    del: (url, body) => request(app).delete(url).set(auth).send(body),
  };
}

module.exports = { startTestApp, stopTestApp, clearDatabase, createUser, request: (...args) => request(app, ...args) };
