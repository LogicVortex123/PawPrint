const mongoose = require('mongoose');

// TR-007: percentage-change trend vs the previous entry is computed on read
// (services/weightTrend.service.js), not stored, so it can't go stale on edits.
const weightRecordSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true, index: true },
    weightKg: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [0.01, 'Weight must be more than 0 kg'],
      max: [500, 'Weight must be 500 kg or less'],
    },
    recordedAt: { type: Date, required: true, default: Date.now },
    clientLocalId: { type: String, index: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WeightRecord', weightRecordSchema);
