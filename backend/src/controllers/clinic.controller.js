const Clinic = require('../models/Clinic.model');
const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { listClinics, boundingBox, NEARBY_KM } = require('../services/clinicList.service');
const { ensureAreaImported } = require('../services/osmClinics.service');

const FILTERS = ['all', 'favorites', 'emergency'];

// GET /clinics/nearby?lat=&lng=&page=&limit=&filter=
// With lat/lng: ranked by distance, within ~60 km (real clinics for the area are
// imported from OpenStreetMap in the background the first time it's searched).
// Without (location denied): saved clinics first, then A–Z.
// With `page`: one page — { clinics, page, limit, total, hasMore, counts, syncing }.
// Without `page` (older clients): the whole list as an array, as before.
const nearby = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  const hasLocation = lat !== undefined && lng !== undefined;
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (hasLocation && (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180)) {
    throw new ApiError(400, 'lat and lng must be valid coordinates');
  }

  const paged = req.query.page !== undefined;
  const page = paged ? Math.floor(Number(req.query.page)) : 1;
  const limit = req.query.limit !== undefined ? Math.floor(Number(req.query.limit)) : (paged ? 12 : 100);
  const filter = req.query.filter ?? 'all';
  if (!Number.isFinite(page) || page < 1 || page > 1000) throw new ApiError(400, 'page must be a whole number from 1');
  if (!Number.isFinite(limit) || limit < 1 || limit > 100) throw new ApiError(400, 'limit must be between 1 and 100');
  if (!FILTERS.includes(filter)) throw new ApiError(400, `filter must be one of: ${FILTERS.join(', ')}`);

  const user = await User.findById(req.userId).select('favoriteClinics').lean();
  const favoriteIds = new Set((user?.favoriteClinics || []).map(String));

  let candidates;
  let syncing = false;
  if (hasLocation) {
    [candidates, syncing] = await Promise.all([
      Clinic.find({ $or: [boundingBox(latitude, longitude, NEARBY_KM), { _id: { $in: [...favoriteIds] } }] }).lean(),
      ensureAreaImported(latitude, longitude),
    ]);
    // Nothing known nearby yet: rank everything, so the closest few still show
    if (!candidates.some((c) => !favoriteIds.has(String(c._id)))) candidates = await Clinic.find().limit(2000).lean();
  } else {
    candidates = await Clinic.find().limit(2000).lean();
  }

  const result = listClinics({
    clinics: candidates, favoriteIds, filter, page, limit,
    ...(hasLocation ? { lat: latitude, lng: longitude } : {}),
  });

  if (!paged) return res.json(result.clinics);
  res.json({ ...result, syncing });
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
