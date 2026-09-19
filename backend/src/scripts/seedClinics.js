const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Clinic = require('../models/Clinic.model');

// Real GET /clinics/nearby has no data source until clinics exist in the DB —
// this seeds a small, plausible set (Bangalore-area coordinates, matching
// where this app is actually being tested from) so the Nearby Clinics feature
// has something real to rank instead of an empty list or another city's data.
const CLINICS = [
  { name: 'Meadowview Animal Hospital', address: '100 Feet Road, Indiranagar', phone: '+91 98765 43210', latitude: 12.9716, longitude: 77.6412, rating: 4.9, reviewsCount: 214, hours: 'Mon-Sat: 8AM – 7PM', emergency24_7: false },
  { name: 'Green Valley Veterinary Care', address: '80 Feet Road, Koramangala', phone: '+91 98765 11122', latitude: 12.9352, longitude: 77.6245, rating: 4.8, reviewsCount: 156, hours: 'Mon-Fri: 8:30AM – 6PM', emergency24_7: false },
  { name: 'Willow Bark 24/7 Pet Emergency', address: 'ITPL Main Road, Whitefield', phone: '+91 98765 99887', latitude: 12.9698, longitude: 77.7500, rating: 4.7, reviewsCount: 328, hours: 'Open 24/7 / 365 Days', emergency24_7: true },
  { name: 'Compassionate Paws Wellness', address: '11th Main, Jayanagar 4th Block', phone: '+91 98765 55443', latitude: 12.9250, longitude: 77.5938, rating: 4.9, reviewsCount: 98, hours: 'Tue-Sat: 9AM – 5:30PM', emergency24_7: false },
  { name: 'Harbor City Vet Clinic', address: 'Residency Road, MG Road', phone: '+91 98765 22334', latitude: 12.9756, longitude: 77.6068, rating: 4.6, reviewsCount: 87, hours: 'Mon-Sun: 9AM – 9PM', emergency24_7: true },
];

async function run() {
  await connectDB();

  for (const clinic of CLINICS) {
    await Clinic.updateOne({ name: clinic.name }, { $set: clinic }, { upsert: true });
  }

  const count = await Clinic.countDocuments();
  console.log(`Seeded ${CLINICS.length} clinics. Total clinics in DB: ${count}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
