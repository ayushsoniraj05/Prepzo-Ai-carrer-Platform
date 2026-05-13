import crypto from 'crypto';
import { securityConfig } from '../config/security.config.js';

const ALGORITHM = securityConfig.encryption.algorithm;
const IV_LENGTH = securityConfig.encryption.ivLength;
const TAG_LENGTH = securityConfig.encryption.tagLength;
const SALT_LENGTH = securityConfig.encryption.saltLength;

/**
 * Get encryption key from environment
 */
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  
  // Derive a 32-byte key using PBKDF2
  return crypto.pbkdf2Sync(
    key,
    process.env.ENCRYPTION_SALT || 'prepzo-salt',
    securityConfig.encryption.iterations,
    32,
    'sha256'
  );
};

/**
 * Encrypt sensitive data
 * @param {string} text - Plain text to encrypt
 * @returns {string} Encrypted text in format: iv:tag:ciphertext (base64)
 */
export const encrypt = (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const tag = cipher.getAuthTag();
    
    // Return iv:tag:ciphertext format
    return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
};

/**
 * Decrypt sensitive data
 * @param {string} encryptedText - Encrypted text in format: iv:tag:ciphertext
 * @returns {string} Decrypted plain text
 */
export const decrypt = (encryptedText) => {
  if (!encryptedText || typeof encryptedText !== 'string') {
    return encryptedText;
  }

  // Check if this is encrypted data (contains our format)
  if (!encryptedText.includes(':')) {
    return encryptedText; // Return as-is if not encrypted
  }

  try {
    const key = getEncryptionKey();
    const [ivBase64, tagBase64, ciphertext] = encryptedText.split(':');
    
    if (!ivBase64 || !tagBase64 || !ciphertext) {
      return encryptedText; // Return as-is if format is invalid
    }

    const iv = Buffer.from(ivBase64, 'base64');
    const tag = Buffer.from(tagBase64, 'base64');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    // Return encrypted text as-is if decryption fails
    return encryptedText;
  }
};

/**
 * Hash data (one-way, for passwords etc.)
 * @param {string} text - Text to hash
 * @param {string} salt - Optional salt
 * @returns {string} Hashed text
 */
export const hash = (text, salt = null) => {
  const useSalt = salt || crypto.randomBytes(SALT_LENGTH).toString('hex');
  const hashed = crypto
    .pbkdf2Sync(text, useSalt, securityConfig.encryption.iterations, 64, 'sha512')
    .toString('hex');
  
  return `${useSalt}:${hashed}`;
};

/**
 * Verify hashed data
 * @param {string} text - Plain text to verify
 * @param {string} hashedText - Previously hashed text
 * @returns {boolean} True if match
 */
export const verifyHash = (text, hashedText) => {
  if (!hashedText.includes(':')) {
    return false;
  }

  const [salt] = hashedText.split(':');
  const newHash = hash(text, salt);
  
  return crypto.timingSafeEqual(
    Buffer.from(hashedText),
    Buffer.from(newHash)
  );
};

/**
 * Generate random token
 * @param {number} length - Token length in bytes
 * @returns {string} Random hex token
 */
export const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate secure OTP
 * @param {number} length - OTP length
 * @returns {string} Numeric OTP
 */
export const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i] % 10];
  }
  return otp;
};

/**
 * Mask sensitive data for logging
 * @param {string} text - Text to mask
 * @param {number} visibleChars - Number of visible characters at start and end
 * @returns {string} Masked text
 */
export const mask = (text, visibleChars = 2) => {
  if (!text || typeof text !== 'string' || text.length <= visibleChars * 2) {
    return '***';
  }
  
  const start = text.substring(0, visibleChars);
  const end = text.substring(text.length - visibleChars);
  const middle = '*'.repeat(Math.min(text.length - visibleChars * 2, 6));
  
  return `${start}${middle}${end}`;
};

/**
 * Encrypt object fields
 * @param {Object} obj - Object to encrypt
 * @param {string[]} fields - Fields to encrypt
 * @returns {Object} Object with encrypted fields
 */
export const encryptFields = (obj, fields = securityConfig.encryption.sensitiveFields) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const result = { ...obj };
  
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = encrypt(result[field]);
    }
  }
  
  return result;
};

/**
 * Decrypt object fields
 * @param {Object} obj - Object to decrypt
 * @param {string[]} fields - Fields to decrypt
 * @returns {Object} Object with decrypted fields
 */
export const decryptFields = (obj, fields = securityConfig.encryption.sensitiveFields) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const result = { ...obj };
  
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = decrypt(result[field]);
    }
  }
  
  return result;
};

/**
 * Compare passwords in constant time (prevents timing attacks)
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} True if equal
 */
export const secureCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  
  if (a.length !== b.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

/**
 * Generate HMAC signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {string} HMAC signature
 */
export const generateHMAC = (data, secret = process.env.JWT_SECRET) => {
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
};

/**
 * Verify HMAC signature
 * @param {string} data - Original data
 * @param {string} signature - HMAC signature to verify
 * @param {string} secret - Secret key
 * @returns {boolean} True if valid
 */
export const verifyHMAC = (data, signature, secret = process.env.JWT_SECRET) => {
  const expectedSignature = generateHMAC(data, secret);
  return secureCompare(signature, expectedSignature);
};

export default {
  encrypt,
  decrypt,
  hash,
  verifyHash,
  generateToken,
  generateOTP,
  mask,
  encryptFields,
  decryptFields,
  secureCompare,
  generateHMAC,
  verifyHMAC,
};
