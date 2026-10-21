// Turns the candidate clinics for a request into one page of results. Pure.
const { haversineDistanceKm } = require('./clinicDistance.service');

const NEARBY_KM = 60; // "Nearby" means within an hour or so
const FALLBACK_COUNT = 15; // nothing that close: still show the closest few, with distances

/**
 * @param {object} args
 * @param {object[]} args.clinics — candidate Clinic documents (lean)
 * @param {Set<string>} args.favoriteIds
 * @param {number} [args.lat]
 * @param {number} [args.lng]
 * @param {'all'|'favorites'|'emergency'} [args.filter]
 * @param {number} [args.page] — 1-based
 * @param {number} [args.limit]
 */
function listClinics({ clinics, favoriteIds, lat, lng, filter = 'all', page = 1, limit = 12 }) {
  const located = Number.isFinite(lat) && Number.isFinite(lng);
  let list = clinics.map((c) => ({
    ...c,
    isFavorite: favoriteIds.has(String(c._id)),
    ...(located ? { distanceKm: Number(haversineDistanceKm(lat, lng, c.latitude, c.longitude).toFixed(2)) } : {}),
  }));

  // Sample clinics only fill in where no real ones are known (a saved one always stays)
  if (list.some((c) => !c.demo)) list = list.filter((c) => !c.demo || c.isFavorite);

  if (located) {
    list.sort((a, b) => a.distanceKm - b.distanceKm);
    const near = list.filter((c) => c.distanceKm <= NEARBY_KM || c.isFavorite);
    list = near.some((c) => !c.isFavorite) ? near : list.slice(0, Math.max(FALLBACK_COUNT, near.length));
  } else {
    list.sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite) || a.name.localeCompare(b.name));
  }

  const counts = {
    all: list.length,
    favorites: list.filter((c) => c.isFavorite).length,
    emergency: list.filter((c) => c.emergency24_7).length,
  };
  const matching = filter === 'favorites' ? list.filter((c) => c.isFavorite) : filter === 'emergency' ? list.filter((c) => c.emergency24_7) : list;
  const start = (page - 1) * limit;

  return {
    clinics: matching.slice(start, start + limit),
    page,
    limit,
    total: matching.length,
    hasMore: start + limit < matching.length,
    counts,
  };
}

/** Lat/lng box around a point, roughly `km` in each direction, for the database query */
function boundingBox(lat, lng, km) {
  const dLat = km / 111;
  const dLng = km / (111 * Math.max(Math.cos((lat * Math.PI) / 180), 0.05));
  return { latitude: { $gte: lat - dLat, $lte: lat + dLat }, longitude: { $gte: lng - dLng, $lte: lng + dLng } };
}

module.exports = { listClinics, boundingBox, NEARBY_KM };
