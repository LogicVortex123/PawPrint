const mongoose = require('mongoose');
const { mongoUri, nodeEnv } = require('./env');

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 2000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectOnce() {
  await mongoose.connect(mongoUri, {
    // These keep Atlas TLS happy on Windows/Node.js — tlsAllowInvalidCertificates
    // is only permitted in dev since we don't want to bypass cert checks in prod.
    tls: true,
    tlsAllowInvalidCertificates: nodeEnv !== 'production',
    serverSelectionTimeoutMS: 10000,
    // Atlas + Node's TLS stack occasionally flakes on IPv6 handshakes on Windows
    // ("SSL alert number 80" / tlsv1 alert internal error) — IPv4 is more stable.
    family: 4,
  });

  // mongoose.connect() only confirms topology discovery — the actual query
  // connections in the pool are opened lazily on first use, and that first
  // TLS handshake is where the flake above tends to show up. Force it here so
  // it's caught by the retry loop below instead of surfacing on someone's
  // first live request.
  await mongoose.connection.db.admin().ping();
}

async function connectDB() {
  mongoose.set('strictQuery', true);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await connectOnce();
      console.log('MongoDB connected');
      return;
    } catch (err) {
      const isLastAttempt = attempt === MAX_ATTEMPTS;
      console.error(
        `MongoDB connection attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err.message}`
      );
      if (isLastAttempt) throw err;

      await mongoose.disconnect().catch(() => {});
      await sleep(RETRY_DELAY_MS);
    }
  }
}

module.exports = connectDB;
