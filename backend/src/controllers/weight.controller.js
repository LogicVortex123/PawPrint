const WeightRecord = require('../models/WeightRecord.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { findOwnedPetOrFail } = require('../services/petAccess.service');
const { withTrend } = require('../services/weightTrend.service');

// GET /pets/:id/weights — TR-007, chronological with trend
const listForPet = asyncHandler(async (req, res) => {
  await findOwnedPetOrFail(req.params.id, req.userId);
  const records = await WeightRecord.find({ pet: req.params.id }).sort({ recordedAt: 1 });
  res.json(withTrend(records));
});

// POST /pets/:id/weights — TR-007, TR-009 dedupe via clientLocalId
const createForPet = asyncHandler(async (req, res) => {
  await findOwnedPetOrFail(req.params.id, req.userId);
  const { clientLocalId } = req.body;

  if (clientLocalId) {
    const existing = await WeightRecord.findOne({ pet: req.params.id, clientLocalId });
    if (existing) return res.status(200).json(existing);
  }

  const record = await WeightRecord.create({ ...req.body, pet: req.params.id });
  res.status(201).json(record);
});

// Loads a weight record and confirms its pet belongs to the current user
async function findOwnedRecordOrFail(id, userId) {
  const record = await WeightRecord.findById(id);
  if (!record) throw new ApiError(404, 'Weight record not found');
  await findOwnedPetOrFail(record.pet, userId);
  return record;
}

// PUT /weights/:id — trends are computed on read, so clients refetch the list after editing
const update = asyncHandler(async (req, res) => {
  const record = await findOwnedRecordOrFail(req.params.id, req.userId);
  const { weightKg, recordedAt } = req.body;
  if (weightKg !== undefined) record.weightKg = weightKg;
  if (recordedAt !== undefined) record.recordedAt = recordedAt;
  await record.save();
  res.json(record);
});

// DELETE /weights/:id
const remove = asyncHandler(async (req, res) => {
  const record = await findOwnedRecordOrFail(req.params.id, req.userId);
  await record.deleteOne();
  res.status(204).send();
});

module.exports = { listForPet, createForPet, update, remove };
