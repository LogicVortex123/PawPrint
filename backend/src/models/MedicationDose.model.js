const mongoose = require('mongoose');

// One dose marked as given. `date` is the owner's calendar day ('YYYY-MM-DD')
// and `slot` which dose of that day (0 = first, e.g. morning; 1 = evening...).
const medicationDoseSchema = new mongoose.Schema(
  {
    medication: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true },
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true, index: true },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    slot: { type: Number, required: true, min: 0, max: 23 },
    givenAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Marking the same dose twice (double click, two tabs) is a no-op, not a duplicate
medicationDoseSchema.index({ medication: 1, date: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model('MedicationDose', medicationDoseSchema);
