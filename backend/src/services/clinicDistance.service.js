// TR-008 / TR-011: ranks clinics via the Haversine formula using the device's
// coordinates, per the TRD's explicit technology decision (not Mongo $geoNear).
const EARTH_RADIUS_KM = 6371;

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function rankByDistance(clinics, latitude, longitude) {
  return clinics
    .map((clinic) => {
      const obj = clinic.toObject ? clinic.toObject() : clinic;
      return {
        ...obj,
        distanceKm: Number(
          haversineDistanceKm(latitude, longitude, obj.latitude, obj.longitude).toFixed(2)
        ),
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

module.exports = { haversineDistanceKm, rankByDistance };
