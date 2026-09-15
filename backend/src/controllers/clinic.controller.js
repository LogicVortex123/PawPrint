const Clinic = require('../models/Clinic.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { rankByDistance } = require('../services/clinicDistance.service');

// GET /clinics/nearby?lat=..&lng=..
// If the client couldn't get location (permission denied), it omits lat/lng and
// we just return the unranked full list as a fallback for manual browsing.
const nearby = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  const clinics = await Clinic.find();

  if (lat === undefined || lng === undefined) {
    return res.json(clinics);
  }

  const latitude = Number(lat);
  const longitude = Number(lng);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new ApiError(400, 'lat and lng must be valid numbers');
  }

  res.json(rankByDistance(clinics, latitude, longitude));
});

module.exports = { nearby };
