const Vaccination = require('../models/Vaccination.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { findOwnedPetOrFail } = require('../services/petAccess.service');
const { withStatus } = require('../services/vaccinationStatus.service');
const { pick } = require('../utils/validate');
const { VACCINE_CATALOG } = require('../data/vaccineCatalog');

const VACCINATION_FIELDS = ['vaccineName', 'administrationDate', 'nextDueDate', 'veterinarian', 'clinic', 'batchNumber', 'notes'];

// GET /pets/:id/vaccinations
const listForPet = asyncHandler(async (req, res) => {
  await findOwnedPetOrFail(req.params.id, req.userId);
  const vaccinations = await Vaccination.find({ pet: req.params.id }).sort({ nextDueDate: 1 });
  res.json(vaccinations.map(withStatus));
});

// POST /pets/:id/vaccinations
const createForPet = asyncHandler(async (req, res) => {
  await findOwnedPetOrFail(req.params.id, req.userId);
  const clientLocalId = typeof req.body.clientLocalId === 'string' ? req.body.clientLocalId : undefined;

  if (clientLocalId) {
    const existing = await Vaccination.findOne({ pet: req.params.id, clientLocalId });
    if (existing) return res.status(200).json(withStatus(existing));
  }

  const vaccination = await Vaccination.create({ ...pick(req.body, VACCINATION_FIELDS), clientLocalId, pet: req.params.id });
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

  // Only record fields — the pet a record belongs to can't be reassigned through an edit
  Object.assign(vaccination, pick(req.body, VACCINATION_FIELDS));
  await vaccination.save();
  res.json(withStatus(vaccination));
});

// DELETE /vaccinations/:id
const remove = asyncHandler(async (req, res) => {
  const vaccination = await findOwnedVaccinationOrFail(req.params.id, req.userId);
  await vaccination.deleteOne();
  res.status(204).send();
});

// GET /vaccinations/catalog?species=dog — common vaccines with a typical booster
// interval, so the web/mobile forms can suggest names and pre-fill the next due date
const catalog = (req, res) => {
  const species = ['dog', 'cat'].includes(req.query.species) ? req.query.species : 'other';
  res.json({
    species,
    disclaimer: 'Typical schedules only — your vet will recommend what your pet needs.',
    vaccines: VACCINE_CATALOG[species],
  });
};

module.exports = { listForPet, createForPet, update, remove, catalog };
