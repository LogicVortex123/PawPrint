const mongoose = require('mongoose');
const { mongoUri, nodeEnv } = require('./env');

async function connectDB() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri, {
    // These keep Atlas TLS happy on Windows/Node.js — tlsAllowInvalidCertificates
    // is only permitted in dev since we don't want to bypass cert checks in prod.
    tls: true,
    tlsAllowInvalidCertificates: nodeEnv !== 'production',
    serverSelectionTimeoutMS: 10000,
  });

  console.log('MongoDB connected');
}

module.exports = connectDB;
