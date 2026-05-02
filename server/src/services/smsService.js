/**
 * SMS Service Layer
 * In production: Connect to Twilio, Vonage, or AWS SNS.
 * In development: Log to console with realistic formatting.
 */

const smsService = {
  /**
   * Sends an OTP SMS to a phone number.
   * @param {string} phone - Recipient phone number.
   * @param {string} code - The 6-digit OTP.
   */
  sendOtp: async (phone, code) => {
    const message = `AirSaathi: Your verification code is ${code}. It will expire in 10 minutes.`;

    if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
      // Real Twilio Integration
      try {
        const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE,
          to: phone.startsWith('+') ? phone : `+91${phone}`
        });
        console.log(`[SMS] Real SMS sent to ${phone}`);
        return true;
      } catch (error) {
        console.error('[SMS] Twilio error:', error.message);
        return false;
      }
    } else {
      // Simulation / Log
      console.log('------------------------------------------');
      console.log(`[SIMULATED SMS] TO: ${phone}`);
      console.log(`[SIMULATED SMS] MSG: ${message}`);
      console.log('------------------------------------------');
      return true;
    }
  }
};

module.exports = smsService;
