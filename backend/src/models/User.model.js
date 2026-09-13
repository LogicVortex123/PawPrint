const mongoose = require('mongoose');

// TR-003 / TR-003b: supports both email/password and Google Sign-In accounts.
// passwordHash is absent for accounts created purely via Google.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true },
    authProvider: { type: String, enum: ['local', 'google'], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
