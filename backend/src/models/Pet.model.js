const mongoose = require('mongoose');

// TR-005: Pet Profile CRUD. allergies/medications/emergencyContacts back the
// README's Emergency Mode screen (one-tap read of the fields already on the pet).
const petSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: [true, 'Pet name is required'], trim: true, maxlength: 60 },
    species: { type: String, required: true, trim: true, maxlength: 30 },
    breed: { type: String, trim: true, maxlength: 80 },
    gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    dateOfBirth: { type: Date },
    photoUrl: { type: String },
    microchipId: { type: String, trim: true, maxlength: 40 },
    allergies: [{ type: String, trim: true, maxlength: 100 }],
    medications: [{ type: String, trim: true, maxlength: 120 }],
    // Healthy weight range agreed with the vet — drives the weight chart band
    // and the "outside target range" reminder
    targetWeightMinKg: { type: Number, min: 0, max: 500 },
    targetWeightMaxKg: { type: Number, min: 0, max: 500 },
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

petSchema.pre('validate', function checkTargetRange(next) {
  if (this.targetWeightMinKg != null && this.targetWeightMaxKg != null && this.targetWeightMinKg > this.targetWeightMaxKg) {
    this.invalidate('targetWeightMaxKg', 'The target weight maximum must be at least the minimum');
  }
  for (const field of ['allergies', 'medications', 'emergencyContacts']) {
    if (this[field]?.length > 30) this.invalidate(field, `Too many ${field} — 30 at most`);
  }
  next();
});

module.exports = mongoose.model('Pet', petSchema);
