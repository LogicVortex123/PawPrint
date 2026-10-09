const mongoose = require('mongoose');
const { FREQUENCIES } = require('../services/medicationSchedule.service');

// A course of medication for one pet. Start/end dates are plain 'YYYY-MM-DD'
// calendar days (not timestamps) so a dose schedule never shifts by timezone.
const dateKey = {
  type: String,
  match: [/^\d{4}-\d{2}-\d{2}$/, 'Dates must be in YYYY-MM-DD format'],
};

const medicationSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: [true, 'Medication name is required'], trim: true, maxlength: 100 },
    dosage: { type: String, trim: true, maxlength: 60 }, // e.g. "1 tablet", "5 mg", "0.5 ml"
    frequency: { type: String, enum: Object.keys(FREQUENCIES), required: true, default: 'once_daily' },
    startDate: { ...dateKey, required: [true, 'Start date is required'] },
    endDate: dateKey, // empty = ongoing
    instructions: { type: String, trim: true, maxlength: 300 }, // e.g. "With food"
    prescribedBy: { type: String, trim: true, maxlength: 100 },
  },
  { timestamps: true }
);

medicationSchema.pre('validate', function checkDates(next) {
  if (this.endDate && this.startDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date cannot be before the start date');
  }
  next();
});

module.exports = mongoose.model('Medication', medicationSchema);
