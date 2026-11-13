const fs = require('fs');
const path = require('path');

// Local dev uses backend/uploads. On Render, set UPLOAD_DIR to a persistent
// disk (the free tier's filesystem is wiped on every deploy).
function getUploadsDir() {
  const configured = process.env.UPLOAD_DIR && process.env.UPLOAD_DIR.trim();
  return path.resolve(configured || path.join(__dirname, '..', '..', 'uploads'));
}

function ensureUploadsDir() {
  const dir = getUploadsDir();
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

module.exports = { getUploadsDir, ensureUploadsDir };
