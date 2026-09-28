const fs = require('fs/promises');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

// Removes a file previously saved by upload.middleware, given the public
// "/uploads/<name>" URL stored on the record. Missing files are ignored so a
// delete never fails just because the disk copy is already gone.
async function removeUploadedFile(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;
  // basename() blocks any "../" in a stored URL from escaping the uploads folder
  const filePath = path.join(UPLOADS_DIR, path.basename(fileUrl));
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('Could not remove upload:', filePath, err.message);
  }
}

module.exports = { removeUploadedFile };
