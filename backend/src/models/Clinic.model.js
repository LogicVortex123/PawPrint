const mongoose = require('mongoose');

// TR-008 / TR-011: backs GET /clinics/nearby. Plain lat/lng (not GeoJSON) because
// ranking is done with an explicit Haversine calculation, per the TRD's decision
// to avoid a Mongo $geoNear dependency for a single simple query.
const clinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Clinic', clinicSchema);
