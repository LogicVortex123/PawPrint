const Pet = require('../models/Pet.model');
const ApiError = require('../utils/ApiError');

// Shared ownership check: vaccinations, weights, documents and appointments
// all nest under a pet, and every one of those routes must confirm the
// authenticated user actually owns that pet before reading/writing its data.
async function findOwnedPetOrFail(petId, ownerId) {
  const pet = await Pet.findOne({ _id: petId, owner: ownerId });
  if (!pet) throw new ApiError(404, 'Pet not found');
  return pet;
}

module.exports = { findOwnedPetOrFail };
