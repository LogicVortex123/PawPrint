const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config/env');

async function start() {
  await connectDB();
  app.listen(port, () => {
    console.log(`PawPrint backend running on port ${port}`);
  });
}

start().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
