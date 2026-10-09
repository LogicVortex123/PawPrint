const Clinic = require('../models/Clinic.model');
const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { rankByDistance } = require('../services/clinicDistance.service');

// GET /clinics/nearby?lat=..&lng=..
// If the client couldn't get location (permission denied), it omits lat/lng and
// we just return the unranked full list as a fallback for manual browsing.
const nearby = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  const [found, user] = await Promise.all([Clinic.find().lean(), User.findById(req.userId).select('favoriteClinics').lean()]);
  const favorites = new Set((user?.favoriteClinics || []).map(String));
  const clinics = found.map((c) => ({ ...c, isFavorite: favorites.has(String(c._id)) }));

  if (lat === undefined || lng === undefined) {
    // No location: saved clinics first, then alphabetical
    return res.json(clinics.sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite) || a.name.localeCompare(b.name)));
  }

  const latitude = Number(lat);
  const longitude = Number(lng);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new ApiError(400, 'lat and lng must be valid coordinates');
  }

  res.json(rankByDistance(clinics, latitude, longitude));
});

// GET /clinics/favorites — the user's saved clinics
const favorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).populate('favoriteClinics').lean();
  res.json((user?.favoriteClinics || []).filter(Boolean).map((c) => ({ ...c, isFavorite: true })));
});

// PUT /clinics/:id/favorite and DELETE /clinics/:id/favorite
const setFavorite = (favorite) => asyncHandler(async (req, res) => {
  if (!(await Clinic.exists({ _id: req.params.id }))) throw new ApiError(404, 'Clinic not found');
  const update = favorite ? { $addToSet: { favoriteClinics: req.params.id } } : { $pull: { favoriteClinics: req.params.id } };
  const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('favoriteClinics').lean();
  res.json({ favoriteClinicIds: user.favoriteClinics.map(String) });
});

module.exports = { nearby, favorites, addFavorite: setFavorite(true), removeFavorite: setFavorite(false) };
