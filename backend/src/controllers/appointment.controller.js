const Appointment = require('../models/Appointment.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { findOwnedPetOrFail } = require('../services/petAccess.service');

// GET /appointments — all appointments across all of the user's pets
const list = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ owner: req.userId }).sort({ date: 1 });
  res.json(appointments);
});

// POST /appointments
const create = asyncHandler(async (req, res) => {
  const { pet, clientLocalId } = req.body;

  if (!pet) throw new ApiError(400, 'pet is required');

  // Make sure this pet actually belongs to the logged-in user
  await findOwnedPetOrFail(pet, req.userId);

  if (clientLocalId) {
    const existing = await Appointment.findOne({ owner: req.userId, clientLocalId });
    if (existing) return res.status(200).json(existing);
  }

  const appointment = await Appointment.create({ ...req.body, owner: req.userId });
  res.status(201).json(appointment);
});

// PUT /appointments/:id — also how an appointment is cancelled or completed (status field)
const update = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne({ _id: req.params.id, owner: req.userId });
  if (!appointment) throw new ApiError(404, 'Appointment not found');

  const { owner, pet, ...changes } = req.body;
  // Moving an appointment to another pet is allowed, but only to one the user owns
  if (pet && String(pet) !== String(appointment.pet)) {
    await findOwnedPetOrFail(pet, req.userId);
    appointment.pet = pet;
  }

  Object.assign(appointment, changes);
  await appointment.save();
  res.json(appointment);
});

// DELETE /appointments/:id
const remove = asyncHandler(async (req, res) => {
  const result = await Appointment.deleteOne({ _id: req.params.id, owner: req.userId });
  if (result.deletedCount === 0) throw new ApiError(404, 'Appointment not found');
  res.status(204).send();
});

module.exports = { list, create, update, remove };
