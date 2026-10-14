const { OAuth2Client } = require('google-auth-library');
const { googleClientId } = require('../config/env');
const ApiError = require('../utils/ApiError');

const client = new OAuth2Client(googleClientId);

// TR-003b / TRD Security 9: the client-supplied Google ID token is never
// trusted directly — signature, audience, and issuer are verified server-side.
async function verifyGoogleToken(idToken) {
  let ticket;
  try {
    ticket = await client.verifyIdToken({ idToken, audience: googleClientId });
  } catch (err) {
    throw new ApiError(401, "Google sign-in didn't work. Please try again.");
  }

  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw new ApiError(401, "We couldn't get an email address from your Google account.");
  }

  return { googleId: payload.sub, email: payload.email, name: payload.name || payload.email };
}

module.exports = { verifyGoogleToken };
