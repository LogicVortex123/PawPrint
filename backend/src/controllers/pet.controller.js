const Pet = require('../models/Pet.model');
const Vaccination = require('../models/Vaccination.model');
const WeightRecord = require('../models/WeightRecord.model');
const Document = require('../models/Document.model');
const Appointment = require('../models/Appointment.model');
const Medication = require('../models/Medication.model');
const MedicationDose = require('../models/MedicationDose.model');
const ShareLink = require('../models/ShareLink.model');
const Expense = require('../models/Expense.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { findOwnedPetOrFail } = require('../services/petAccess.service');
const { removeUploadedFile } = require('../services/uploadFiles.service');
const { pick, requireString } = require('../utils/validate');

// Everything an owner may set on a pet. owner and photoUrl are deliberately
// absent: ownership never changes, and photos go through POST /pets/:id/photo.
const PET_FIELDS = [
  'name', 'species', 'breed', 'gender', 'dateOfBirth', 'microchipId',
  'allergies', 'medications', 'emergencyContacts', 'targetWeightMinKg', 'targetWeightMaxKg',
];

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
  const clientLocalId = typeof req.body.clientLocalId === 'string' ? req.body.clientLocalId : undefined;

  if (clientLocalId) {
    const existing = await Pet.findOne({ owner: req.userId, clientLocalId });
    if (existing) return res.status(200).json(existing);
  }

  const fields = pick(req.body, PET_FIELDS);
  fields.name = requireString(fields.name, 'Pet name', { max: 60 });
  fields.species = requireString(fields.species ?? 'other', 'Species', { max: 30 });

  const pet = await Pet.create({ ...fields, clientLocalId, owner: req.userId });
  res.status(201).json(pet);
});

// PUT /pets/:id
const updatePet = asyncHandler(async (req, res) => {
  const pet = await findOwnedPetOrFail(req.params.id, req.userId);
  const changes = pick(req.body, PET_FIELDS);
  if (changes.name !== undefined) changes.name = requireString(changes.name, 'Pet name', { max: 60 });

  // Clearing a target weight sends null — unset it rather than storing null
  for (const key of ['targetWeightMinKg', 'targetWeightMaxKg']) {
    if (req.body[key] === null || req.body[key] === '') {
      pet[key] = undefined;
      delete changes[key];
    }
  }

  // Assign + save (instead of findByIdAndUpdate) so the schema's cross-field
  // checks, like min <= max target weight, run on every edit
  Object.assign(pet, changes);
  await pet.save();
  res.json(pet);
});

// POST /pets/:id/photo — multipart/form-data with a single "photo" image
const uploadPhoto = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'A photo is required');
  // multer has already saved the file — throw it away if this request isn't allowed
  let pet;
  try {
    pet = await findOwnedPetOrFail(req.params.id, req.userId);
    if (!req.file.mimetype.startsWith('image/')) throw new ApiError(400, 'Pet photos must be an image (JPG, PNG or WebP)');
  } catch (err) {
    await removeUploadedFile(`/uploads/${req.file.filename}`);
    throw err;
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
    Medication.deleteMany({ pet: pet._id }),
    MedicationDose.deleteMany({ pet: pet._id }),
    ShareLink.deleteMany({ pet: pet._id }),
    Expense.deleteMany({ pet: pet._id }),
  ]);
  await Pet.findByIdAndDelete(pet._id);

  await Promise.all([pet.photoUrl, ...documents.map((d) => d.fileUrl)].map(removeUploadedFile));
  res.status(204).send();
});

module.exports = { listPets, getPet, createPet, updatePet, uploadPhoto, deletePet };
