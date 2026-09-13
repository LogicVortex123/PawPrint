const Document = require('../models/Document.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { findOwnedPetOrFail } = require('../services/petAccess.service');

// GET /pets/:id/documents — TR-010
const listForPet = asyncHandler(async (req, res) => {
  await findOwnedPetOrFail(req.params.id, req.userId);
  const documents = await Document.find({ pet: req.params.id }).sort({ createdAt: -1 });
  res.json(documents);
});

// POST /pets/:id/documents — TR-010. multipart/form-data, file handled by
// upload.middleware.js (multer) before this runs; TR-009 dedupe via clientLocalId.
const createForPet = asyncHandler(async (req, res) => {
  await findOwnedPetOrFail(req.params.id, req.userId);
  const { category, clientLocalId } = req.body;

  if (!req.file) throw new ApiError(400, 'A file is required');
  if (!category) throw new ApiError(400, 'category is required');

  if (clientLocalId) {
    const existing = await Document.findOne({ pet: req.params.id, clientLocalId });
    if (existing) return res.status(200).json(existing);
  }

  const document = await Document.create({
    pet: req.params.id,
    category,
    clientLocalId,
    fileUrl: `/uploads/${req.file.filename}`,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
  });

  res.status(201).json(document);
});

module.exports = { listForPet, createForPet };
