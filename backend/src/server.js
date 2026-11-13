const app = require('./app');
const connectDB = require('./config/db');
const { disconnectDB } = require('./config/db');
const { port } = require('./config/env');
const { ensureUploadsDir } = require('./config/uploads');
const { startEmailReminderCron } = require('./services/emailReminder.service');

async function start() {
  await connectDB();
  const uploadsDir = ensureUploadsDir();
  startEmailReminderCron();

  // Render's proxy reaches the process on all interfaces, on the PORT it assigns.
  const host = '0.0.0.0';
  const server = app.listen(port, host, () => {
    console.log(`PawPrint backend running on http://${host}:${port}`);
    console.log(`Uploads directory: ${uploadsDir}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use — another copy of the backend is probably still running (check your other terminals).`);
      console.error(process.platform === 'win32'
        ? `  To stop it in PowerShell: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${port} -State Listen).OwningProcess`
        : `  To stop it: kill $(lsof -t -i:${port})`);
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
