const Vaccination = require('../models/Vaccination.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { findOwnedPetOrFail } = require('../services/petAccess.service');
const { withStatus } = require('../services/vaccinationStatus.service');

// GET /pets/:id/vaccinations
const listForPet = asyncHandler(async (req, res) => {
  await findOwnedPetOrFail(req.params.id, req.userId);
  const vaccinations = await Vaccination.find({ pet: req.params.id }).sort({ nextDueDate: 1 });
  res.json(vaccinations.map(withStatus));
});

// POST /pets/:id/vaccinations
const createForPet = asyncHandler(async (req, res) => {
  await findOwnedPetOrFail(req.params.id, req.userId);
  const { clientLocalId } = req.body;

  if (clientLocalId) {
    const existing = await Vaccination.findOne({ pet: req.params.id, clientLocalId });
    if (existing) return res.status(200).json(withStatus(existing));
  }

  const vaccination = await Vaccination.create({ ...req.body, pet: req.params.id });
  res.status(201).json(withStatus(vaccination));
});

// Loads a vaccination and confirms its pet belongs to the current user
async function findOwnedVaccinationOrFail(id, userId) {
  const vaccination = await Vaccination.findById(id);
  if (!vaccination) throw new ApiError(404, 'Vaccination not found');
  await findOwnedPetOrFail(vaccination.pet, userId);
  return vaccination;
}

// PUT /vaccinations/:id — top-level route, not nested under /pets
const update = asyncHandler(async (req, res) => {
  const vaccination = await findOwnedVaccinationOrFail(req.params.id, req.userId);

  // The pet a record belongs to can't be reassigned through an edit
  const { pet, ...changes } = req.body;
  Object.assign(vaccination, changes);
  await vaccination.save();
  res.json(withStatus(vaccination));
});

// DELETE /vaccinations/:id
const remove = asyncHandler(async (req, res) => {
  const vaccination = await findOwnedVaccinationOrFail(req.params.id, req.userId);
  await vaccination.deleteOne();
  res.status(204).send();
});

module.exports = { listForPet, createForPet, update, remove };
