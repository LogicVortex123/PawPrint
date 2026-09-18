const mongoose = require('mongoose');

// TR-005: Pet Profile CRUD. allergies/medications/emergencyContacts back the
// README's Emergency Mode screen (one-tap read of the fields already on the pet).
const petSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    species: { type: String, required: true, trim: true },
    breed: { type: String, trim: true },
    gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    dateOfBirth: { type: Date },
    photoUrl: { type: String },
    microchipId: { type: String, trim: true },
    allergies: [{ type: String, trim: true }],
    medications: [{ type: String, trim: true }],
    emergencyContacts: [
      {
        name: { type: String, trim: true },
        phone: { type: String, trim: true },
      },
    ],
    // TR-009: lets the mobile sync queue retry a push without creating duplicates.
    clientLocalId: { type: String, index: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pet', petSchema);
