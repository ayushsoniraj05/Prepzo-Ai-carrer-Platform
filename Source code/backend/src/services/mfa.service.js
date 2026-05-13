import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { securityConfig } from '../config/security.config.js';

/**
 * Generate MFA secret for a user
 * @param {string} email - User's email
 * @returns {Object} Secret and OTP auth URL
 */
export const generateMFASecret = (email) => {
  const secret = speakeasy.generateSecret({
    name: `Prepzo:${email}`,
    issuer: 'Prepzo',
  });

  return {
    base32: secret.base32,
    otpauthUrl: secret.otpauth_url,
  };
};

/**
 * Generate QR code data URL from OTP auth URL
 * @param {string} otpauthUrl - OTP auth URL
 * @returns {Promise<string>} QR code data URL
 */
export const generateQRCode = async (otpauthUrl) => {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Verify MFA token
 * @param {string} secret - User's base32 secret
 * @param {string} token - Token from user's app
 * @returns {boolean} True if valid
 */
export const verifyMFAToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1, // Allow 1 step before/after for time drift
  });
};

/**
 * Generate backup codes
 * @param {number} count - Number of codes to generate
 * @returns {string[]} Backup codes
 */
export const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
  }
  return codes;
};

export default {
  generateMFASecret,
  generateQRCode,
  verifyMFAToken,
  generateBackupCodes,
};
