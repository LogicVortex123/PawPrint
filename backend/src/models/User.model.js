const mongoose = require('mongoose');
const { CURRENCIES } = require('../services/expenseSummary.service');

// TR-003 / TR-003b: supports both email/password and Google Sign-In accounts.
// passwordHash is absent for accounts created purely via Google.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true },
    authProvider: { type: String, enum: ['local', 'google'], required: true },
    // Account Settings: which reminders the user wants to see, and how early
    preferences: {
      reminders: {
        vaccination: { type: Boolean, default: true },
        appointment: { type: Boolean, default: true },
        weight: { type: Boolean, default: true },
        medication: { type: Boolean, default: true },
      },
      reminderLeadDays: { type: Number, default: 14, min: 1, max: 60 },
      // Email reminder opt-in — false by default so existing users aren't surprised
      emailReminders: { type: Boolean, default: false },
      // Shown on expenses and spending totals
      currency: { type: String, enum: CURRENCIES, default: 'INR' },
    },
    // Clinics starred in Nearby Clinics — kept on the account so they follow
    // the user to any browser or the mobile app
    favoriteClinics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' }],
    // Forgot-password flow: only a SHA-256 hash of the emailed token is stored,
    // so a database leak can't be used to reset anyone's password
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    resetPasswordRequestedAt: { type: Date, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

