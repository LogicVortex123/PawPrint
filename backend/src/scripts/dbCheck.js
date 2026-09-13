const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Task A checklist: "confirm a real read/write works (not just a ping)".
// Writes a real document, reads it back, then cleans up after itself.
const CheckModel = mongoose.model('DbCheck', new mongoose.Schema({ note: String, at: Date }));

async function run() {
  await connectDB();

  const written = await CheckModel.create({ note: 'PawPrint backend DB check', at: new Date() });
  console.log('WRITE ok, _id:', written._id.toString());

  const read = await CheckModel.findById(written._id);
  console.log('READ  ok, note:', read.note, '| at:', read.at.toISOString());

  await CheckModel.deleteOne({ _id: written._id });
  console.log('CLEANUP ok — test document removed');

  await mongoose.disconnect();
  console.log('\nReal read/write against MongoDB confirmed.');
}

run().catch((err) => {
  console.error('DB check failed:', err.message);
  process.exit(1);
});
