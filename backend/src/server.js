const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config/env');

async function start() {
  await connectDB();
  app.listen(port, () => console.log(`PawPrint backend listening on port ${port}`));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
