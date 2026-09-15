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

// PUT /appointments/:id
const update = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne({ _id: req.params.id, owner: req.userId });
  if (!appointment) throw new ApiError(404, 'Appointment not found');

  Object.assign(appointment, req.body);
  await appointment.save();
  res.json(appointment);
});

module.exports = { list, create, update };
