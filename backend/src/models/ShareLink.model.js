const mongoose = require('mongoose');

// A read-only link to one pet's health summary, for a vet, sitter or boarding
// facility who has no PawPrint account. The token is the only credential, so
// it's long and random; links expire and the owner can revoke them any time.
const shareLinkSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, trim: true, maxlength: 60 }, // e.g. "Dr. Mehta", "Boarding"
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    viewCount: { type: Number, default: 0 },
    lastViewedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShareLink', shareLinkSchema);
