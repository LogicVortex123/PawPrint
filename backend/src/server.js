const app = require('./app');
const connectDB = require('./config/db');
const { disconnectDB } = require('./config/db');
const { port } = require('./config/env');
const { startEmailReminderCron } = require('./services/emailReminder.service');

async function start() {
  await connectDB();
  startEmailReminderCron();

  const server = app.listen(port, () => {
    console.log(`PawPrint backend running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use — is another copy of the backend running?`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });

  // Finish in-flight requests and close the database cleanly when the host
  // stops or restarts the process (deploys, Ctrl+C)
  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received — shutting down`);
    server.close(async () => {
      await disconnectDB().catch(() => {});
      process.exit(0);
    });
    // Don't hang forever on a stuck connection
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

start().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
