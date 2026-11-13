const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');
const { ensureUploadsDir } = require('../config/uploads');

// TR-010: backs pet photo and medical document uploads. Stores to local disk
// (or UPLOAD_DIR, when a host provides a persistent disk).
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ensureUploadsDir()),
  filename: (req, file, cb) => {
    const unique = crypto.randomUUID();
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new ApiError(400, 'Unsupported file type — use JPG, PNG, WebP or PDF'));
    }
    cb(null, true);
  },
});

module.exports = upload;
