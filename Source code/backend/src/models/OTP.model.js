import mongoose from 'mongoose';
import crypto from 'crypto';

const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Can be null for registration verification
    index: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['email_verification', 'password_reset', 'two_factor', 'login_verification', 'signup_verification'],
    required: true,
    index: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  maxAttempts: {
    type: Number,
    default: 3,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  usedAt: {
    type: Date,
    default: null,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdByIp: {
    type: String,
    default: '',
  },
  userAgent: {
    type: String,
    default: '',
  },
  metadata: {
    type: Map,
    of: String,
    default: {},
  },
}, {
  timestamps: true,
});

// TTL index - auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for verification
otpSchema.index({ email: 1, type: 1, isUsed: 1 });

// Generate OTP
otpSchema.statics.generateOTP = function(length = 6) {
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i] % 10];
  }
  return otp;
};

// Hash OTP for secure storage
otpSchema.statics.hashOTP = function(otp) {
  return crypto
    .createHash('sha256')
    .update(otp + process.env.OTP_SALT)
    .digest('hex');
};

// Create new OTP
otpSchema.statics.createOTP = async function(options) {
  const {
    email,
    userId = null,
    type,
    expiryMinutes = 5,
    ip = '',
    userAgent = '',
    metadata = {},
  } = options;

  // Invalidate any existing OTPs for this email and type
  await this.updateMany(
    { email, type, isUsed: false },
    { isUsed: true, usedAt: new Date() }
  );

  // Generate new OTP
  const otp = this.generateOTP(6);
  const otpHash = this.hashOTP(otp);

  // Create OTP document
  const otpDoc = await this.create({
    userId,
    email,
    otp: otp.substring(0, 2) + '****', // Store partial OTP for reference
    otpHash,
    type,
    expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
    createdByIp: ip,
    userAgent,
    metadata,
  });

  return {
    otp, // Return plain OTP for sending via email
    otpId: otpDoc._id,
    expiresAt: otpDoc.expiresAt,
  };
};

// Verify OTP
otpSchema.statics.verifyOTP = async function(email, otp, type) {
  const otpHash = this.hashOTP(otp);

  const otpDoc = await this.findOne({
    email,
    type,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!otpDoc) {
    return {
      valid: false,
      reason: 'OTP not found or expired',
    };
  }

  // Increment attempts
  otpDoc.attempts += 1;
  await otpDoc.save();

  // Check max attempts
  if (otpDoc.attempts > otpDoc.maxAttempts) {
    otpDoc.isUsed = true;
    otpDoc.usedAt = new Date();
    await otpDoc.save();
    return {
      valid: false,
      reason: 'Maximum verification attempts exceeded',
    };
  }

  // Verify hash
  if (otpDoc.otpHash !== otpHash) {
    return {
      valid: false,
      reason: 'Invalid OTP',
      attemptsRemaining: otpDoc.maxAttempts - otpDoc.attempts,
    };
  }

  // Mark as used
  otpDoc.isUsed = true;
  otpDoc.usedAt = new Date();
  await otpDoc.save();

  return {
    valid: true,
    userId: otpDoc.userId,
    email: otpDoc.email,
    metadata: otpDoc.metadata,
  };
};

// Check if can resend OTP (cooldown period)
otpSchema.statics.canResendOTP = async function(email, type, cooldownMs = 60000) {
  const lastOTP = await this.findOne({
    email,
    type,
  }).sort({ createdAt: -1 });

  if (!lastOTP) {
    return { canResend: true };
  }

  const timeSinceLastOTP = Date.now() - lastOTP.createdAt.getTime();
  
  if (timeSinceLastOTP < cooldownMs) {
    return {
      canResend: false,
      waitTime: Math.ceil((cooldownMs - timeSinceLastOTP) / 1000),
    };
  }

  return { canResend: true };
};

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
