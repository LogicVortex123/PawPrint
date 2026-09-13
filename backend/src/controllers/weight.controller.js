const WeightRecord = require('../models/WeightRecord.model');
const asyncHandler = require('../utils/asyncHandler');
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

module.exports = { listForPet, createForPet };
