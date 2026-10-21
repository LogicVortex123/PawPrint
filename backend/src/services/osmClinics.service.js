// Real veterinary clinics from OpenStreetMap (via the Overpass API), saved into
// the Clinic collection so they can be ranked, paged and starred like any other.
//
// Overpass can take 20–40 s to answer, so imports run in the background: the
// first visitor to an area gets the clinics already known straight away, plus a
// "syncing" flag, and everyone after that gets the full local list instantly.
// Each ~11 km cell is refreshed at most once a week.

const Clinic = require('../models/Clinic.model');
const ClinicArea = require('../models/ClinicArea.model');
const { clinicImport } = require('../config/env');

const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];
const RADIUS_M = 25_000;
const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;
const RETRY_AFTER_FAILURE_MS = 10 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 60_000;

const inFlight = new Map(); // cell key -> Promise

/** ~11 km grid cell a coordinate falls in, e.g. "12.9,77.6" */
const areaKey = (lat, lng) => `${lat.toFixed(1)},${lng.toFixed(1)}`;

/** Pure: one Overpass element → Clinic fields, or null when it isn't usable (no name or position). */
function toClinic(element) {
  const tags = element.tags || {};
  const name = (tags.name || tags['name:en'] || '').trim();
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;
  if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
  const address = [tags['addr:full'] || street, tags['addr:suburb'] || tags['addr:neighbourhood'], tags['addr:city']]
    .filter(Boolean)
    .filter((part, i, all) => all.indexOf(part) === i)
    .join(', ');
  const hours = (tags.opening_hours || '').trim();

  return {
    osmId: `${element.type}/${element.id}`,
    name: name.slice(0, 120),
    address: address.slice(0, 200),
    phone: (tags.phone || tags['contact:phone'] || '').split(';')[0].trim().slice(0, 40),
    website: (tags.website || tags['contact:website'] || '').trim().slice(0, 300),
    hours: hours === '24/7' ? 'Open 24/7' : hours.slice(0, 120),
    emergency24_7: hours === '24/7' || tags.emergency === 'yes',
    latitude,
    longitude,
  };
}

const BUSY = new Set([429, 502, 503, 504]); // Overpass is overloaded or rate-limiting us
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function queryOverpass(lat, lng) {
  const query = `[out:json][timeout:50];nwr["amenity"="veterinary"](around:${RADIUS_M},${lat},${lng});out center tags 400;`;
  let lastError;
  // Each mirror gets a few tries; a busy server usually frees up within seconds
  for (let attempt = 0; attempt < 3; attempt++) {
    for (const url of MIRRORS) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
            // Overpass asks every client to identify itself
            'User-Agent': 'PawPrint/1.0 (pet health records app)',
          },
          body: `data=${encodeURIComponent(query)}`,
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (!res.ok) {
          lastError = new Error(`Overpass ${res.status} from ${new URL(url).host}`);
          if (BUSY.has(res.status)) continue;
          throw lastError;
        }
        const data = await res.json();
        return data.elements || [];
      } catch (err) {
        lastError = err;
      }
    }
    await wait(5000 * (attempt + 1));
  }
  throw lastError;
}

async function importArea(key, lat, lng) {
  try {
    const clinics = (await queryOverpass(lat, lng)).map(toClinic).filter(Boolean);
    if (clinics.length) {
      await Clinic.bulkWrite(clinics.map((c) => ({
        updateOne: { filter: { osmId: c.osmId }, update: { $set: c, $setOnInsert: { demo: false } }, upsert: true },
      })), { ordered: false });
    }
    await ClinicArea.updateOne({ key }, { $set: { syncedAt: new Date(), clinicCount: clinics.length }, $unset: { failedAt: 1 } }, { upsert: true });
    console.log(`[clinics] Imported ${clinics.length} clinics from OpenStreetMap for area ${key}`);
  } catch (err) {
    console.error(`[clinics] OpenStreetMap import failed for area ${key}:`, err.message);
    await ClinicArea.updateOne({ key }, { $set: { failedAt: new Date() } }, { upsert: true }).catch(() => {});
  }
}

/**
 * Starts a background import for the area around (lat, lng) if it's due.
 * Returns true while an area's first import is running (a weekly refresh of an
 * area that already has its clinics runs quietly).
 */
async function ensureAreaImported(lat, lng) {
  if (!clinicImport) return false;
  const key = areaKey(lat, lng);
  if (inFlight.has(key)) return inFlight.get(key).firstImport;

  const area = await ClinicArea.findOne({ key }).lean();
  const now = Date.now();
  if (area?.syncedAt && now - area.syncedAt.getTime() < REFRESH_MS) return false;
  if (area?.failedAt && now - area.failedAt.getTime() < RETRY_AFTER_FAILURE_MS) return false;

  const job = importArea(key, Number(lat.toFixed(3)), Number(lng.toFixed(3))).finally(() => inFlight.delete(key));
  job.firstImport = !area?.syncedAt;
  inFlight.set(key, job);
  return job.firstImport;
}

module.exports = { toClinic, areaKey, ensureAreaImported };
