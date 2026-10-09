const Appointment = require('../models/Appointment.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { findOwnedPetOrFail } = require('../services/petAccess.service');
const { sendAppointmentEmail } = require('../services/emailReminder.service');
const { pick } = require('../utils/validate');

// owner is always the signed-in user; pet changes are ownership-checked separately
const APPOINTMENT_FIELDS = ['clinic', 'date', 'reason', 'notes', 'status'];

// Only name/address are stored for a clinic snapshot
function cleanClinic(clinic) {
  if (!clinic || typeof clinic !== 'object') return clinic;
  return pick(clinic, ['name', 'address']);
}

// GET /appointments — all appointments across all of the user's pets
const list = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ owner: req.userId }).sort({ date: 1 });
  res.json(appointments);
});

// POST /appointments
const create = asyncHandler(async (req, res) => {
  const { pet } = req.body;
  const clientLocalId = typeof req.body.clientLocalId === 'string' ? req.body.clientLocalId : undefined;

  if (!pet || typeof pet !== 'string') throw new ApiError(400, 'pet is required');

  // Make sure this pet actually belongs to the logged-in user
  await findOwnedPetOrFail(pet, req.userId);

  if (clientLocalId) {
    const existing = await Appointment.findOne({ owner: req.userId, clientLocalId });
    if (existing) return res.status(200).json(existing);
  }

  const fields = pick(req.body, APPOINTMENT_FIELDS);
  fields.clinic = cleanClinic(fields.clinic);
  const appointment = await Appointment.create({ ...fields, pet, clientLocalId, owner: req.userId });
  res.status(201).json(appointment);
  // After responding — the confirmation email must never slow down or fail the booking
  sendAppointmentEmail(req.userId, appointment, 'booked');
});

// PUT /appointments/:id — also how an appointment is cancelled or completed (status field)
const update = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne({ _id: req.params.id, owner: req.userId });
  if (!appointment) throw new ApiError(404, 'Appointment not found');

  const { pet } = req.body;
  const changes = pick(req.body, APPOINTMENT_FIELDS);
  if (changes.clinic) changes.clinic = cleanClinic(changes.clinic);
  // Moving an appointment to another pet is allowed, but only to one the user owns
  if (pet && String(pet) !== String(appointment.pet)) {
    await findOwnedPetOrFail(pet, req.userId);
    appointment.pet = pet;
  }

  const previousDate = appointment.date.getTime();
  Object.assign(appointment, changes);
  await appointment.save();
  res.json(appointment);
  if (appointment.date.getTime() !== previousDate) sendAppointmentEmail(req.userId, appointment, 'rescheduled');
});

// DELETE /appointments/:id
const remove = asyncHandler(async (req, res) => {
  const result = await Appointment.deleteOne({ _id: req.params.id, owner: req.userId });
  if (result.deletedCount === 0) throw new ApiError(404, 'Appointment not found');
  res.status(204).send();
});

module.exports = { list, create, update, remove };
