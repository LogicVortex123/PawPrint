const User = require('../models/User.model');
const Pet = require('../models/Pet.model');
const Vaccination = require('../models/Vaccination.model');
const WeightRecord = require('../models/WeightRecord.model');
const Appointment = require('../models/Appointment.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { findOwnedPetOrFail } = require('../services/petAccess.service');
const { buildReminders } = require('../services/reminders.service');

// GET /reminders?pet=<id> — Smart Reminders for all of the user's pets (or one),
// filtered and timed by their Account Settings reminder preferences
const list = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(404, 'User not found');

  const pets = req.query.pet
    ? [await findOwnedPetOrFail(req.query.pet, req.userId)]
    : await Pet.find({ owner: req.userId });
  const petIds = pets.map((p) => p._id);

  const [vaccinations, appointments, latestWeights] = await Promise.all([
    Vaccination.find({ pet: { $in: petIds } }),
    Appointment.find({ owner: req.userId, pet: { $in: petIds }, status: 'scheduled' }),
    // Only the newest weigh-in per pet matters for the "time for a weigh-in" nudge
    WeightRecord.aggregate([
      { $match: { pet: { $in: petIds } } },
      { $group: { _id: '$pet', recordedAt: { $max: '$recordedAt' } } },
    ]),
  ]);

  const latestWeightByPet = Object.fromEntries(latestWeights.map((w) => [String(w._id), w.recordedAt]));
  const { leadDays, reminders } = buildReminders({
    pets,
    vaccinations,
    appointments,
    latestWeightByPet,
    preferences: user.preferences,
  });

  const counts = { urgent: 0, upcoming: 0, info: 0 };
  for (const r of reminders) counts[r.urgency] += 1;

  res.json({ leadDays, counts, reminders });
});

module.exports = { list };
