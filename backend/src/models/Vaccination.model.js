const mongoose = require('mongoose');

// TR-006: status is NOT stored here — it's derived on every read
// (see services/vaccinationStatus.service.js) by comparing nextDueDate to now.
const vaccinationSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true, index: true },
    vaccineName: { type: String, required: true, trim: true },
    administrationDate: { type: Date, required: true },
    nextDueDate: { type: Date, required: true },
    veterinarian: { type: String, trim: true },
    notes: { type: String, trim: true },
    clientLocalId: { type: String, index: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vaccination', vaccinationSchema);
