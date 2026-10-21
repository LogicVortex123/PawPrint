const { toClinic, areaKey } = require('../../src/services/osmClinics.service');
const { listClinics } = require('../../src/services/clinicList.service');

describe('toClinic (OpenStreetMap → Clinic)', () => {
  test('reads name, address, phone, hours and position', () => {
    expect(toClinic({
      type: 'node', id: 42, lat: 12.9, lon: 77.6,
      tags: { name: 'Pet Zone', 'addr:housenumber': '437', 'addr:street': '8th Main', 'addr:city': 'Bengaluru', phone: '080 4121 7299;080 1111', opening_hours: '24/7' },
    })).toEqual({
      osmId: 'node/42', name: 'Pet Zone', address: '437 8th Main, Bengaluru', phone: '080 4121 7299', website: '',
      hours: 'Open 24/7', emergency24_7: true, latitude: 12.9, longitude: 77.6,
    });
  });

  test('uses the centre of buildings and skips unnamed places', () => {
    expect(toClinic({ type: 'way', id: 7, center: { lat: 1, lon: 2 }, tags: { name: 'Big Vet' } })).toMatchObject({ osmId: 'way/7', latitude: 1, longitude: 2 });
    expect(toClinic({ type: 'node', id: 8, lat: 1, lon: 2, tags: {} })).toBeNull();
  });

  test('groups nearby searches into the same ~11 km area', () => {
    expect(areaKey(12.9716, 77.5946)).toBe('13.0,77.6');
    expect(areaKey(12.96, 77.61)).toBe(areaKey(12.97, 77.58));
  });
});

describe('listClinics', () => {
  const clinic = (id, lat, extra = {}) => ({ _id: id, name: id, latitude: lat, longitude: 0, ...extra });

  test('falls back to the closest few when nothing is nearby', () => {
    const far = Array.from({ length: 20 }, (_, i) => clinic(`far${i}`, 5 + i));
    const res = listClinics({ clinics: far, favoriteIds: new Set(), lat: 0, lng: 0, limit: 50 });
    expect(res.total).toBe(15);
    expect(res.clinics[0]._id).toBe('far0');
  });

  test('keeps a saved sample clinic even when real ones exist', () => {
    const res = listClinics({ clinics: [clinic('real', 0.01), clinic('demo', 0.02, { demo: true }), clinic('saved', 0.03, { demo: true })], favoriteIds: new Set(['saved']), lat: 0, lng: 0 });
    expect(res.clinics.map((c) => c._id)).toEqual(['real', 'saved']);
  });
});
