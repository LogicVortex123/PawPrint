const mongoose = require('mongoose');

// TR-008: appointment CRUD. clinic is a free-form snapshot (name/address) rather
// than a hard ref, so a booking still reads correctly if the clinic list changes.
const appointmentSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true, index: true },
    clinic: {
      name: { type: String, required: true, trim: true },
      address: { type: String, trim: true },
    },
    date: { type: Date, required: true },
    reason: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
    clientLocalId: { type: String, index: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
