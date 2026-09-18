const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Clinic = require('../models/Clinic.model');

// Real GET /clinics/nearby has no data source until clinics exist in the DB —
// this seeds a small, plausible set (Mumbai-area coordinates) so the Nearby
// Clinics feature has something real to rank instead of an empty list.
const CLINICS = [
  { name: 'Meadowview Animal Hospital', address: '412 Evergreen Way, Bandra West', phone: '+91 98765 43210', latitude: 19.0596, longitude: 72.8295, rating: 4.9, reviewsCount: 214, hours: 'Mon-Sat: 8AM – 7PM', emergency24_7: false },
  { name: 'Green Valley Veterinary Care', address: '890 Oak Ridge Boulevard, Andheri East', phone: '+91 98765 11122', latitude: 19.1136, longitude: 72.8697, rating: 4.8, reviewsCount: 156, hours: 'Mon-Fri: 8:30AM – 6PM', emergency24_7: false },
  { name: 'Willow Bark 24/7 Pet Emergency', address: '1540 Riverview Pkwy, Powai', phone: '+91 98765 99887', latitude: 19.1176, longitude: 72.9060, rating: 4.7, reviewsCount: 328, hours: 'Open 24/7 / 365 Days', emergency24_7: true },
  { name: 'Compassionate Paws Wellness', address: '772 Cedar Lane, Juhu', phone: '+91 98765 55443', latitude: 19.1075, longitude: 72.8263, rating: 4.9, reviewsCount: 98, hours: 'Tue-Sat: 9AM – 5:30PM', emergency24_7: false },
  { name: 'Harbor City Vet Clinic', address: '55 Marine Drive, Nariman Point', phone: '+91 98765 22334', latitude: 18.9432, longitude: 72.8232, rating: 4.6, reviewsCount: 87, hours: 'Mon-Sun: 9AM – 9PM', emergency24_7: true },
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
