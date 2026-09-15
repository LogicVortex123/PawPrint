const Pet = require('../models/Pet.model');
const asyncHandler = require('../utils/asyncHandler');
const { findOwnedPetOrFail } = require('../services/petAccess.service');

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
  const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(pet);
});

// DELETE /pets/:id
const deletePet = asyncHandler(async (req, res) => {
  await findOwnedPetOrFail(req.params.id, req.userId);
  await Pet.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

module.exports = { listPets, getPet, createPet, updatePet, deletePet };
