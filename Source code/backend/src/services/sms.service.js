import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

let client = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

/**
 * Send OTP via SMS (Twilio)
 * @param {string} phone - Recipient phone number (E.164 format)
 * @param {string} otp - One-time password
 */
export const sendSMS = async (phone, otp) => {
  if (!client) {
    console.warn('[SMS] Twilio client not configured. Check environment variables.');
    return false;
  }

  try {
    const message = await client.messages.create({
      body: `Your Prepzo AI login code is: ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    console.log(`[SMS] OTP sent successfully to ${phone}. SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('[SMS] Error sending OTP:', error);
    return false;
  }
};

export default {
  sendSMS,
};
