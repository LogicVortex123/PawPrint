const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');

const corsOptions = require('./config/cors');
const { isProduction, isTest, trustProxy } = require('./config/env');
const routes = require('./routes');
const notFound = require('./middleware/notFound.middleware');
const errorMiddleware = require('./middleware/error.middleware');
const { securityHeaders, sanitizeInput, apiLimiter } = require('./middleware/security.middleware');
const { version } = require('../package.json');

const app = express();

if (trustProxy) app.set('trust proxy', trustProxy);
app.disable('x-powered-by');

if (!isTest) app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(securityHeaders);
app.use(cors(corsOptions));
// 1 MB is plenty for JSON — files go through multipart uploads, not JSON
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeInput);

// Serve uploaded pet photos and documents from disk. File names are random
// UUIDs, and nosniff stops a browser from treating an upload as another type.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  maxAge: '7d',
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
}));

// Liveness + readiness for uptime monitors and hosting health checks
app.get('/health', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({
    status: dbUp ? 'ok' : 'degraded',
    database: dbUp ? 'connected' : 'disconnected',
    version,
    uptimeSeconds: Math.round(process.uptime()),
  });
});

app.use('/', apiLimiter, routes);

app.use(notFound);
app.use(errorMiddleware);

module.exports = app;
