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

// PUT /vaccinations/:id — top-level route, not nested under /pets
const update = asyncHandler(async (req, res) => {
  const vaccination = await Vaccination.findById(req.params.id);
  if (!vaccination) throw new ApiError(404, 'Vaccination not found');

  // Double-check the pet belongs to the current user before allowing edits
  await findOwnedPetOrFail(vaccination.pet, req.userId);

  Object.assign(vaccination, req.body);
  await vaccination.save();
  res.json(withStatus(vaccination));
});

module.exports = { listForPet, createForPet, update };
