const mongoose = require('mongoose');
const { mongoUri, nodeEnv } = require('./env');

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 2000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Atlas (mongodb+srv://) always uses TLS; a local mongod usually doesn't, so
// TLS options are only applied when the connection string calls for them.
function connectionOptions(uri) {
  const usesTls = uri.startsWith('mongodb+srv://') || /[?&](tls|ssl)=true/i.test(uri);
  return {
    serverSelectionTimeoutMS: 10000,
    // Atlas + Node's TLS stack occasionally flakes on IPv6 handshakes on Windows
    // ("SSL alert number 80" / tlsv1 alert internal error) — IPv4 is more stable.
    family: 4,
    ...(usesTls && {
      tls: true,
      // Only allowed in dev — certificate checks are never bypassed in production
      tlsAllowInvalidCertificates: nodeEnv !== 'production',
    }),
  };
}

async function connectOnce(uri) {
  await mongoose.connect(uri, connectionOptions(uri));

  // mongoose.connect() only confirms topology discovery — the actual query
  // connections in the pool are opened lazily on first use, and that first
  // TLS handshake is where the flake above tends to show up. Force it here so
  // it's caught by the retry loop below instead of surfacing on someone's
  // first live request.
  await mongoose.connection.db.admin().ping();
}

async function connectDB(uri = mongoUri) {
  mongoose.set('strictQuery', true);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await connectOnce(uri);
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

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
