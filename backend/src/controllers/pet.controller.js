const Pet = require('../models/Pet.model');
const Vaccination = require('../models/Vaccination.model');
const WeightRecord = require('../models/WeightRecord.model');
const Document = require('../models/Document.model');
const Appointment = require('../models/Appointment.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { findOwnedPetOrFail } = require('../services/petAccess.service');
const { removeUploadedFile } = require('../services/uploadFiles.service');

// GET /pets
const listPets = asyncHandler(async (req, res) => {
  const pets = await Pet.find({ owner: req.userId }).sort({ createdAt: -1 });
  res.json(pets);
});

// GET /pets/:id
const getPet = asyncHandler(async (req, res) => {
  const pet = await findOwnedPetOrFail(req.params.id, req.userId);
  res.json(pet);
});

// POST /pets
// clientLocalId lets the mobile sync queue retry a push safely without creating duplicates
const createPet = asyncHandler(async (req, res) => {
  const { clientLocalId } = req.body;

  if (clientLocalId) {
    const existing = await Pet.findOne({ owner: req.userId, clientLocalId });
    if (existing) return res.status(200).json(existing);
  }

  const pet = await Pet.create({ ...req.body, owner: req.userId });
  res.status(201).json(pet);
});

// PUT /pets/:id
const updatePet = asyncHandler(async (req, res) => {
  await findOwnedPetOrFail(req.params.id, req.userId);
  // owner and photoUrl can't be changed through a plain update — photos go
  // through POST /pets/:id/photo so the old file gets cleaned up
  const { owner, photoUrl, ...changes } = req.body;
  const pet = await Pet.findByIdAndUpdate(req.params.id, changes, { new: true, runValidators: true });
  res.json(pet);
});

// POST /pets/:id/photo — multipart/form-data with a single "photo" image
const uploadPhoto = asyncHandler(async (req, res) => {
  const pet = await findOwnedPetOrFail(req.params.id, req.userId);

  if (!req.file) throw new ApiError(400, 'A photo is required');
  if (!req.file.mimetype.startsWith('image/')) {
    await removeUploadedFile(`/uploads/${req.file.filename}`);
    throw new ApiError(400, 'Pet photos must be an image (JPG, PNG or WebP)');
  }

  const previous = pet.photoUrl;
  pet.photoUrl = `/uploads/${req.file.filename}`;
  await pet.save();
  await removeUploadedFile(previous);

  res.json(pet);
});

// DELETE /pets/:id — also removes every record and file that belongs to the pet
const deletePet = asyncHandler(async (req, res) => {
  const pet = await findOwnedPetOrFail(req.params.id, req.userId);
  const documents = await Document.find({ pet: pet._id });

  await Promise.all([
    Vaccination.deleteMany({ pet: pet._id }),
    WeightRecord.deleteMany({ pet: pet._id }),
    Appointment.deleteMany({ pet: pet._id }),
    Document.deleteMany({ pet: pet._id }),
  ]);
  await Pet.findByIdAndDelete(pet._id);

  await Promise.all([pet.photoUrl, ...documents.map((d) => d.fileUrl)].map(removeUploadedFile));
  res.status(204).send();
});

module.exports = { listPets, getPet, createPet, updatePet, uploadPhoto, deletePet };
