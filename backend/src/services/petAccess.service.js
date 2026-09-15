const Pet = require('../models/Pet.model');
const ApiError = require('../utils/ApiError');

// Every nested resource (vaccinations, weights, documents, appointments) goes
// through this before touching any data — confirms the pet exists and belongs
// to the user making the request.
async function findOwnedPetOrFail(petId, ownerId) {
  const pet = await Pet.findOne({ _id: petId, owner: ownerId });
  if (!pet) throw new ApiError(404, 'Pet not found');
  return pet;
}

module.exports = { findOwnedPetOrFail };
