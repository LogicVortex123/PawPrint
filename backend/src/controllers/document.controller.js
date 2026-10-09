const Document = require('../models/Document.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { findOwnedPetOrFail } = require('../services/petAccess.service');
const { removeUploadedFile } = require('../services/uploadFiles.service');

// GET /pets/:id/documents
const listForPet = asyncHandler(async (req, res) => {
  await findOwnedPetOrFail(req.params.id, req.userId);
  const documents = await Document.find({ pet: req.params.id }).sort({ createdAt: -1 });
  res.json(documents);
});

// POST /pets/:id/documents — multipart/form-data; file is handled by upload.middleware before we get here.
// multer saves the file before this runs, so any failure below deletes it again.
const createForPet = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'A file is required');
  const uploadedUrl = `/uploads/${req.file.filename}`;

  try {
    await findOwnedPetOrFail(req.params.id, req.userId);

    const { category } = req.body;
    const clientLocalId = typeof req.body.clientLocalId === 'string' ? req.body.clientLocalId : undefined;
    if (!category || typeof category !== 'string') throw new ApiError(400, 'category is required');

    if (clientLocalId) {
      const existing = await Document.findOne({ pet: req.params.id, clientLocalId });
      if (existing) {
        await removeUploadedFile(uploadedUrl);
        return res.status(200).json(existing);
      }
    }

    const document = await Document.create({
      pet: req.params.id,
      category,
      clientLocalId,
      fileUrl: uploadedUrl,
      originalName: req.file.originalname.slice(0, 200),
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    });

    res.status(201).json(document);
  } catch (err) {
    await removeUploadedFile(uploadedUrl);
    throw err;
  }
});

// DELETE /documents/:id — removes the record and the file on disk
const remove = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) throw new ApiError(404, 'Document not found');
  await findOwnedPetOrFail(document.pet, req.userId);

  await document.deleteOne();
  await removeUploadedFile(document.fileUrl);
  res.status(204).send();
});

module.exports = { listForPet, createForPet, remove };
