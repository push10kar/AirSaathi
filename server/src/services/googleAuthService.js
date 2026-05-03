const axios = require('axios');

/**
 * Verify a Google ID token received from the client (expo-auth-session).
 * Returns the verified user payload or throws an error.
 *
 * We use Google's tokeninfo endpoint — no SDK needed.
 * The client sends an idToken, we verify it server-side.
 */
const verifyGoogleIdToken = async (idToken) => {
  try {
    const response = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );

    const payload = response.data;

    // Verify this token was issued for OUR app
    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      throw new Error('Token was not issued for this application');
    }

    // Verify the token is not expired
    const now = Math.floor(Date.now() / 1000);
    if (parseInt(payload.exp) < now) {
      throw new Error('Google token has expired');
    }

    return {
      googleId: payload.sub,          // Unique Google user ID
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified === 'true',
    };
  } catch (err) {
    if (err.response?.status === 400) {
      throw new Error('Invalid Google token');
    }
    throw err;
  }
};

module.exports = { verifyGoogleIdToken };
