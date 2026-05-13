import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null, // Can be null for anonymous actions
  },
  userEmail: {
    type: String,
    default: '',
  },
  userRole: {
    type: String,
    default: '',
  },

  // Action Information
  action: {
    type: String,
    required: true,
    index: true,
    enum: [
      // Authentication Actions
      'login_success', 'login_failed', 'logout', 'register',
      'password_change', 'password_reset_request', 'password_reset_complete',
      'email_verification_sent', 'email_verified',
      'two_factor_enabled', 'two_factor_disabled', 'two_factor_verified',
      'token_refresh', 'token_revoked', 'session_expired',
      
      // Account Actions
      'account_locked', 'account_unlocked', 'account_deleted',
      'profile_updated', 'role_changed', 'email_changed',
      
      // Security Actions
      'suspicious_activity', 'brute_force_detected', 'ip_blocked',
      'rate_limit_exceeded', 'csrf_violation', 'xss_attempt',
      'injection_attempt', 'unauthorized_access',
      
      // Data Actions
      'data_export', 'data_access', 'data_modified', 'data_deleted',
      'file_uploaded', 'file_downloaded', 'file_deleted',
      
      // Test/Assessment Actions
      'test_started', 'test_completed', 'test_terminated',
      'proctoring_violation', 'proctoring_consent_given',
      
      // Admin Actions
      'admin_user_view', 'admin_user_edit', 'admin_user_delete',
      'admin_config_change', 'admin_report_generated',
      
      // AI Actions
      'ai_api_request', 'ai_api_response', 'ai_api_error',
      'ai_recommendation_generated', 'ai_mentor_query',
      
      // System Actions
      'system_error', 'api_error', 'validation_error',
    ],
  },
  category: {
    type: String,
    required: true,
    enum: ['authentication', 'authorization', 'security', 'data', 'admin', 'system', 'test', 'ai'],
    index: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
    index: true,
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'warning', 'info'],
    default: 'info',
  },
  description: {
    type: String,
    default: '',
  },

  // Request Information
  ipAddress: {
    type: String,
    default: '',
    index: true,
  },
  userAgent: {
    type: String,
    default: '',
  },
  method: {
    type: String,
    default: '',
  },
  endpoint: {
    type: String,
    default: '',
  },
  requestId: {
    type: String,
    default: '',
  },

  // Device Information
  deviceInfo: {
    browser: String,
    browserVersion: String,
    os: String,
    osVersion: String,
    device: String,
    isMobile: Boolean,
  },

  // Geolocation (optional)
  geoLocation: {
    country: String,
    region: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },

  // Additional Context
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
  },
  resourceType: {
    type: String,
    default: '',
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },

  // Error Information (if applicable)
  error: {
    code: String,
    message: String,
    stack: String,
  },

  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound indexes for common queries
auditLogSchema.index({ userId: 1, action: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, action: 1, timestamp: -1 });
auditLogSchema.index({ category: 1, severity: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, status: 1, timestamp: -1 });

// TTL index for log retention (90 days default)
auditLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);

// Static method to create audit log
auditLogSchema.statics.log = async function(options) {
  const {
    userId = null,
    userEmail = '',
    userRole = '',
    action,
    category,
    severity = 'low',
    status = 'info',
    description = '',
    ipAddress = '',
    userAgent = '',
    method = '',
    endpoint = '',
    requestId = '',
    deviceInfo = {},
    geoLocation = {},
    metadata = {},
    changes = {},
    resourceType = '',
    resourceId = null,
    error = null,
  } = options;

  // Sanitize metadata - remove sensitive fields
  const sensitiveFields = [
    'password', 'oldPassword', 'newPassword', 'confirmPassword',
    'token', 'refreshToken', 'accessToken', 'otp', 'secret',
    'creditCard', 'ssn', 'apiKey',
  ];

  const sanitizedMetadata = { ...metadata };
  sensitiveFields.forEach(field => {
    if (sanitizedMetadata[field]) {
      sanitizedMetadata[field] = '[REDACTED]';
    }
  });

  try {
    const log = await this.create({
      userId,
      userEmail,
      userRole,
      action,
      category,
      severity,
      status,
      description,
      ipAddress,
      userAgent,
      method,
      endpoint,
      requestId,
      deviceInfo,
      geoLocation,
      metadata: sanitizedMetadata,
      changes,
      resourceType,
      resourceId,
      error: error ? {
        code: error.code || '',
        message: error.message || '',
        stack: process.env.NODE_ENV !== 'production' ? error.stack : '',
      } : undefined,
      timestamp: new Date(),
    });

    return log;
  } catch (err) {
    console.error('Audit log creation failed:', err);
    return null;
  }
};

// Get user activity summary
auditLogSchema.statics.getUserActivity = async function(userId, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        lastOccurrence: { $max: '$timestamp' },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Get suspicious activity by IP
auditLogSchema.statics.getSuspiciousActivityByIP = async function(ipAddress, hoursBack = 24) {
  const startDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const suspiciousActions = [
    'login_failed', 'brute_force_detected', 'rate_limit_exceeded',
    'csrf_violation', 'xss_attempt', 'injection_attempt', 'unauthorized_access',
  ];

  return this.find({
    ipAddress,
    action: { $in: suspiciousActions },
    timestamp: { $gte: startDate },
  }).sort({ timestamp: -1 });
};

// Get failed login attempts
auditLogSchema.statics.getFailedLogins = async function(options = {}) {
  const { userId, ipAddress, email, hoursBack = 24 } = options;
  const startDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const query = {
    action: 'login_failed',
    timestamp: { $gte: startDate },
  };

  if (userId) query.userId = userId;
  if (ipAddress) query.ipAddress = ipAddress;
  if (email) query.userEmail = email;

  return this.find(query).sort({ timestamp: -1 });
};

// Check if alert threshold exceeded
auditLogSchema.statics.checkAlertThreshold = async function(action, threshold, hoursBack = 1, identifier = null) {
  const startDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const query = {
    action,
    timestamp: { $gte: startDate },
  };

  if (identifier) {
    if (identifier.userId) query.userId = identifier.userId;
    if (identifier.ipAddress) query.ipAddress = identifier.ipAddress;
    if (identifier.email) query.userEmail = identifier.email;
  }

  const count = await this.countDocuments(query);
  return count >= threshold;
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
