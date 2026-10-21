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
    rating: { type: Number, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
    hours: { type: String, trim: true },
    emergency24_7: { type: Boolean, default: false },
    website: { type: String, trim: true },
    // Real clinics imported from OpenStreetMap carry their OSM id ("node/123")
    osmId: { type: String, unique: true, sparse: true },
    // Sample clinics from the seed script — only shown where no real clinics are known
    demo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Nearby queries filter on a lat/lng box first
clinicSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('Clinic', clinicSchema);
