import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  tokenFamily: {
    type: String,
    required: true,
    index: true,
  },
  isRevoked: {
    type: Boolean,
    default: false,
  },
  revokedAt: {
    type: Date,
    default: null,
  },
  revokedReason: {
    type: String,
    enum: ['logout', 'token_rotation', 'security_breach', 'admin_action', 'expired', 'manual'],
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
  deviceInfo: {
    browser: String,
    os: String,
    device: String,
  },
  lastUsedAt: {
    type: Date,
    default: Date.now,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for cleanup of expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for finding tokens by family (for rotation invalidation)
refreshTokenSchema.index({ tokenFamily: 1, isRevoked: 1 });

// Check if token is valid
refreshTokenSchema.methods.isValid = function() {
  return !this.isRevoked && this.expiresAt > new Date();
};

// Revoke this token
refreshTokenSchema.methods.revoke = async function(reason = 'manual') {
  this.isRevoked = true;
  this.revokedAt = new Date();
  this.revokedReason = reason;
  await this.save();
};

// Static method to revoke all tokens in a family
refreshTokenSchema.statics.revokeTokenFamily = async function(tokenFamily, reason = 'token_rotation') {
  return this.updateMany(
    { tokenFamily, isRevoked: false },
    { 
      isRevoked: true, 
      revokedAt: new Date(),
      revokedReason: reason,
    }
  );
};

// Static method to revoke all user tokens
refreshTokenSchema.statics.revokeAllUserTokens = async function(userId, reason = 'logout') {
  return this.updateMany(
    { userId, isRevoked: false },
    { 
      isRevoked: true, 
      revokedAt: new Date(),
      revokedReason: reason,
    }
  );
};

// Static method to clean up expired tokens
refreshTokenSchema.statics.cleanupExpiredTokens = async function() {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isRevoked: true, revokedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    ],
  });
  return result.deletedCount;
};

// Static method to get active sessions for a user
refreshTokenSchema.statics.getActiveSessions = async function(userId) {
  return this.find({
    userId,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  }).select('createdAt lastUsedAt deviceInfo createdByIp userAgent');
};

// Update last used timestamp
refreshTokenSchema.methods.markAsUsed = async function() {
  this.lastUsedAt = new Date();
  this.usageCount += 1;
  await this.save();
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;
