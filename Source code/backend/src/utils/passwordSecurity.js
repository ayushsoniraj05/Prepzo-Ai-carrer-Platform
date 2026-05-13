import bcrypt from 'bcryptjs';
import { securityConfig, commonPasswords } from '../config/security.config.js';

/**
 * Password Security Utility
 * Implements enterprise-grade password security
 */

/**
 * Validate password strength against 8-parameter rule
 * @param {string} password - Password to validate
 * @param {Object} userInfo - User info for context validation
 * @returns {Object} Validation result
 */
export const validatePasswordStrength = (password, userInfo = {}) => {
  const errors = [];
  const rules = securityConfig.password.rules;

  // Length checks
  if (password.length < securityConfig.password.minLength) {
    errors.push(`Password must be at least ${securityConfig.password.minLength} characters long`);
  }
  if (password.length > securityConfig.password.maxLength) {
    errors.push(`Password must be at most ${securityConfig.password.maxLength} characters long`);
  }

  // Character requirements
  if (rules.minUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (rules.minLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (rules.minNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (rules.minSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  if (rules.noSpaces && /\s/.test(password)) {
    errors.push('Password cannot contain spaces');
  }

  // Common password check
  if (rules.noCommonWords && commonPasswords.includes(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a stronger password');
  }

  // User info check (prevent using email/name in password)
  if (rules.noUserInfo && userInfo) {
    const lowercasePassword = password.toLowerCase();
    
    if (userInfo.email) {
      const emailPart = userInfo.email.split('@')[0].toLowerCase();
      if (emailPart.length >= 3 && lowercasePassword.includes(emailPart)) {
        errors.push('Password cannot contain your email address');
      }
    }
    
    if (userInfo.fullName) {
      const nameParts = userInfo.fullName.toLowerCase().split(/\s+/);
      for (const part of nameParts) {
        if (part.length >= 3 && lowercasePassword.includes(part)) {
          errors.push('Password cannot contain your name');
          break;
        }
      }
    }
  }

  // Sequential characters check
  if (hasSequentialChars(password, 4)) {
    errors.push('Password cannot contain sequential characters (e.g., 1234, abcd)');
  }

  // Repeated characters check
  if (hasRepeatedChars(password, 3)) {
    errors.push('Password cannot contain more than 2 consecutive identical characters');
  }

  return {
    valid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password),
  };
};

/**
 * Check for sequential characters
 */
const hasSequentialChars = (password, minLength) => {
  const sequences = [
    '0123456789',
    'abcdefghijklmnopqrstuvwxyz',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm',
  ];

  const lowercasePassword = password.toLowerCase();

  for (const seq of sequences) {
    for (let i = 0; i <= seq.length - minLength; i++) {
      const forward = seq.substring(i, i + minLength);
      const backward = forward.split('').reverse().join('');
      
      if (lowercasePassword.includes(forward) || lowercasePassword.includes(backward)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Check for repeated characters
 */
const hasRepeatedChars = (password, maxRepeats) => {
  for (let i = 0; i <= password.length - maxRepeats; i++) {
    const char = password[i];
    let count = 1;
    
    for (let j = i + 1; j < password.length; j++) {
      if (password[j] === char) {
        count++;
        if (count > maxRepeats) {
          return true;
        }
      } else {
        break;
      }
    }
  }
  
  return false;
};

/**
 * Calculate password strength score (0-100)
 */
export const calculatePasswordStrength = (password) => {
  let score = 0;

  // Base score from length
  score += Math.min(password.length * 4, 32);

  // Character diversity
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;

  // Bonus for mixing
  const types = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;
  
  score += types * 5;

  // Penalty for common patterns
  if (commonPasswords.includes(password.toLowerCase())) {
    score = Math.max(score - 40, 0);
  }

  return Math.min(score, 100);
};

/**
 * Get password strength label
 */
export const getPasswordStrengthLabel = (score) => {
  if (score < 30) return { label: 'Weak', color: 'red' };
  if (score < 50) return { label: 'Fair', color: 'orange' };
  if (score < 70) return { label: 'Good', color: 'yellow' };
  if (score < 90) return { label: 'Strong', color: 'lime' };
  return { label: 'Very Strong', color: 'green' };
};

/**
 * Hash password with bcrypt
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(securityConfig.password.saltRounds);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {boolean} True if match
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Check if password was previously used
 * @param {string} password - New password
 * @param {string[]} passwordHistory - Array of previous password hashes
 * @returns {boolean} True if password was previously used
 */
export const isPasswordInHistory = async (password, passwordHistory = []) => {
  for (const oldHash of passwordHistory) {
    if (await comparePassword(password, oldHash)) {
      return true;
    }
  }
  return false;
};

/**
 * Calculate lockout delay using exponential backoff
 * @param {number} failedAttempts - Number of failed attempts
 * @returns {number} Delay in milliseconds
 */
export const calculateLockoutDelay = (failedAttempts) => {
  const { baseDelay, maxDelay, multiplier } = securityConfig.password.exponentialBackoff;
  
  const delay = baseDelay * Math.pow(multiplier, failedAttempts - 1);
  return Math.min(delay, maxDelay);
};

/**
 * Check if account should be locked
 * @param {number} failedAttempts - Number of failed attempts
 * @returns {boolean} True if should be locked
 */
export const shouldLockAccount = (failedAttempts) => {
  return failedAttempts >= securityConfig.password.lockoutThreshold;
};

/**
 * Calculate remaining lockout time
 * @param {Date} lockedAt - When account was locked
 * @returns {number} Remaining time in milliseconds (0 if expired)
 */
export const getRemainingLockoutTime = (lockedAt) => {
  if (!lockedAt) return 0;
  
  const lockoutEnd = new Date(lockedAt.getTime() + securityConfig.password.lockoutDuration);
  const remaining = lockoutEnd.getTime() - Date.now();
  
  return Math.max(remaining, 0);
};

/**
 * Generate suggested password
 * @returns {string} Strong random password
 */
export const generateStrongPassword = () => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=';
  const all = lowercase + uppercase + numbers + special;

  let password = '';
  
  // Ensure at least one of each type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill rest with random characters
  for (let i = password.length; i < 16; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

export default {
  validatePasswordStrength,
  calculatePasswordStrength,
  getPasswordStrengthLabel,
  hashPassword,
  comparePassword,
  isPasswordInHistory,
  calculateLockoutDelay,
  shouldLockAccount,
  getRemainingLockoutTime,
  generateStrongPassword,
};
