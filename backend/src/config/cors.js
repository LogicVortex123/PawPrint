const { webOrigins, nodeEnv } = require('./env');

// In production, only requests coming from the listed WEB_ORIGIN(s) are allowed.
// In dev, if WEB_ORIGIN isn't set at all, every origin passes through so you don't
// have to fiddle with env vars just to hit the API from localhost.
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (webOrigins.includes(origin)) return callback(null, true);
    if (nodeEnv !== 'production' && !webOrigins.length) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed`));
  },
  credentials: true,
};

module.exports = corsOptions;
