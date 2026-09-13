const mongoose = require('mongoose');

// TR-010: mobile captures via Expo Image Picker and uploads when back online;
// web uploads directly from the file system. Same schema either way.
const documentSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true, index: true },
    category: {
      type: String,
      enum: ['Prescription', 'Medical Report', 'Insurance', 'Adoption'],
      required: true,
    },
    fileUrl: { type: String, required: true },
    originalName: { type: String },
    mimeType: { type: String },
    clientLocalId: { type: String, index: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
