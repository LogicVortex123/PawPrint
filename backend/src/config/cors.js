const { webOrigins, nodeEnv } = require('./env');

// TR-016: only the approved web app origin(s) may call the API from a browser.
// Native mobile requests carry no Origin header and are unaffected by CORS.
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (webOrigins.includes(origin)) return callback(null, true);
    if (nodeEnv !== 'production' && !webOrigins.length) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
};

module.exports = corsOptions;
