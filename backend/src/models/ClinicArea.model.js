const mongoose = require('mongoose');

// One row per ~11 km map cell whose vets have been imported from OpenStreetMap,
// so each area is fetched at most once a week instead of on every visit
const clinicAreaSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // "12.9,77.6"
    syncedAt: { type: Date },
    failedAt: { type: Date },
    clinicCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClinicArea', clinicAreaSchema);
