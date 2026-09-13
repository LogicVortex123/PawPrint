const { haversineDistanceKm, rankByDistance } = require('../src/services/clinicDistance.service');

describe('haversineDistanceKm', () => {
  test('distance from a point to itself is 0', () => {
    expect(haversineDistanceKm(19.076, 72.8777, 19.076, 72.8777)).toBe(0);
  });

  test('Mumbai to Pune is roughly 120-150km', () => {
    const distance = haversineDistanceKm(19.076, 72.8777, 18.5204, 73.8567);
    expect(distance).toBeGreaterThan(100);
    expect(distance).toBeLessThan(160);
  });
});

describe('rankByDistance', () => {
  test('sorts clinics nearest-first', () => {
    const clinics = [
      { name: 'Far', latitude: 18.5204, longitude: 73.8567 },
      { name: 'Near', latitude: 19.08, longitude: 72.88 },
    ];
    const ranked = rankByDistance(clinics, 19.076, 72.8777);
    expect(ranked[0].name).toBe('Near');
    expect(ranked[0].distanceKm).toBeLessThan(ranked[1].distanceKm);
  });
});
