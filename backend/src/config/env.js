require('dotenv').config();

const required = ['MONGO_URI', 'JWT_SECRET', 'GOOGLE_CLIENT_ID'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  webOrigins: (process.env.WEB_ORIGIN || '').split(',').map((o) => o.trim()).filter(Boolean),
};
