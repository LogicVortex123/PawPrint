const mongoose = require('mongoose');

// TR-006: status is NOT stored here — it's derived on every read
// (see services/vaccinationStatus.service.js) by comparing nextDueDate to now.
const vaccinationSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true, index: true },
    vaccineName: { type: String, required: [true, 'Vaccine name is required'], trim: true, maxlength: 100 },
    administrationDate: { type: Date, required: true },
    nextDueDate: { type: Date, required: true },
    veterinarian: { type: String, trim: true, maxlength: 100 },
    clinic: { type: String, trim: true, maxlength: 120 },
    batchNumber: { type: String, trim: true, maxlength: 60 },
    notes: { type: String, trim: true, maxlength: 500 },
    clientLocalId: { type: String, index: true, sparse: true },
  },
  { timestamps: true }
);

vaccinationSchema.pre('validate', function checkDates(next) {
  if (this.administrationDate && this.nextDueDate && this.nextDueDate < this.administrationDate) {
    this.invalidate('nextDueDate', 'The next due date cannot be before the date it was given');
  }
  next();
});

module.exports = mongoose.model('Vaccination', vaccinationSchema);
