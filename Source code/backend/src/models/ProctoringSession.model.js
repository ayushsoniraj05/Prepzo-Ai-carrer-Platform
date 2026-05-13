/**
 * Proctoring Session Model
 * Secure storage for proctoring data with auto-delete after retention period
 */

import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.js';

const RETENTION_DAYS = 30; // Auto-delete after 30 days

const ViolationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'tab_switch',
      'fullscreen_exit',
      'keyboard_shortcut',
      'right_click',
      'copy_paste',
      'no_face',
      'multiple_faces',
      'camera_covered',
      'camera_inactive',
      'background_noise',
      'screen_share_stopped',
      'suspicious_behavior',
      'device_change',
      'network_issue',
    ],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['warning', 'critical'],
    default: 'warning',
  },
  screenshot: {
    type: String, // Encrypted base64 screenshot
    select: false, // Don't include by default
  },
});

const ProctoringSessionSchema = new mongoose.Schema({
  // Reference to test session
  testSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestSession',
    required: true,
    index: true,
  },
  
  // Reference to user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  // Consent tracking
  consent: {
    given: {
      type: Boolean,
      default: false,
    },
    timestamp: Date,
    ipAddress: String,
    userAgent: String,
  },
  
  // Session timing
  startTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endTime: Date,
  duration: Number, // in seconds
  
  // Proctoring status
  status: {
    type: String,
    enum: ['active', 'completed', 'terminated', 'paused'],
    default: 'active',
    index: true,
  },
  
  // Termination reason
  terminationReason: String,
  
  // Device information (encrypted)
  deviceInfo: {
    encrypted: {
      type: String,
      select: false,
    },
    browser: String,
    os: String,
    screenResolution: String,
  },
  
  // Network information
  networkInfo: {
    ipAddress: String,
    ipChanges: [{
      oldIp: String,
      newIp: String,
      timestamp: Date,
    }],
  },
  
  // Violations
  violations: [ViolationSchema],
  warningCount: {
    type: Number,
    default: 0,
  },
  
  // Integrity flags
  integrityFlags: {
    fullscreenMaintained: {
      type: Boolean,
      default: true,
    },
    cameraActive: {
      type: Boolean,
      default: true,
    },
    microphoneActive: {
      type: Boolean,
      default: true,
    },
    screenShareActive: {
      type: Boolean,
      default: true,
    },
    noTabSwitches: {
      type: Boolean,
      default: true,
    },
  },
  
  // Recording references (encrypted paths)
  recordings: {
    webcam: {
      type: String,
      select: false,
    },
    screen: {
      type: String,
      select: false,
    },
    audio: {
      type: String,
      select: false,
    },
  },
  
  // Auto-delete timestamp
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + RETENTION_DAYS * 24 * 60 * 60 * 1000),
    index: { expireAfterSeconds: 0 }, // TTL index
  },
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
ProctoringSessionSchema.index({ user: 1, status: 1 });
ProctoringSessionSchema.index({ createdAt: 1 });

// Pre-save middleware to encrypt sensitive data
ProctoringSessionSchema.pre('save', async function(next) {
  // Encrypt device info if modified
  if (this.isModified('deviceInfo.encrypted') && this.deviceInfo?.encrypted) {
    try {
      this.deviceInfo.encrypted = encrypt(this.deviceInfo.encrypted);
    } catch (error) {
      console.error('Failed to encrypt device info:', error);
    }
  }
  
  // Encrypt recording paths if modified
  if (this.isModified('recordings')) {
    try {
      if (this.recordings?.webcam) {
        this.recordings.webcam = encrypt(this.recordings.webcam);
      }
      if (this.recordings?.screen) {
        this.recordings.screen = encrypt(this.recordings.screen);
      }
      if (this.recordings?.audio) {
        this.recordings.audio = encrypt(this.recordings.audio);
      }
    } catch (error) {
      console.error('Failed to encrypt recordings:', error);
    }
  }
  
  // Calculate duration on completion
  if (this.isModified('endTime') && this.endTime && this.startTime) {
    this.duration = Math.floor((this.endTime.getTime() - this.startTime.getTime()) / 1000);
  }
  
  next();
});

// Static method to create a new proctoring session with consent
ProctoringSessionSchema.statics.createWithConsent = async function(data) {
  const session = new this({
    ...data,
    consent: {
      given: true,
      timestamp: new Date(),
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  });
  
  return session.save();
};

// Static method to add violation
ProctoringSessionSchema.statics.addViolation = async function(sessionId, violation) {
  const session = await this.findById(sessionId);
  if (!session) {
    throw new Error('Proctoring session not found');
  }
  
  session.violations.push(violation);
  session.warningCount = session.violations.length;
  
  // Update integrity flags based on violation type
  switch (violation.type) {
    case 'tab_switch':
      session.integrityFlags.noTabSwitches = false;
      break;
    case 'fullscreen_exit':
      session.integrityFlags.fullscreenMaintained = false;
      break;
    case 'camera_covered':
    case 'camera_inactive':
    case 'no_face':
      session.integrityFlags.cameraActive = false;
      break;
    case 'screen_share_stopped':
      session.integrityFlags.screenShareActive = false;
      break;
  }
  
  return session.save();
};

// Static method to terminate session
ProctoringSessionSchema.statics.terminateSession = async function(sessionId, reason) {
  return this.findByIdAndUpdate(
    sessionId,
    {
      status: 'terminated',
      terminationReason: reason,
      endTime: new Date(),
    },
    { new: true }
  );
};

// Static method to complete session
ProctoringSessionSchema.statics.completeSession = async function(sessionId) {
  return this.findByIdAndUpdate(
    sessionId,
    {
      status: 'completed',
      endTime: new Date(),
    },
    { new: true }
  );
};

// Static method to get sessions by user (for admin review)
ProctoringSessionSchema.statics.getUserSessions = async function(userId, options = {}) {
  const { limit = 10, page = 1, status } = options;
  
  const query = { user: userId };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('testSession', 'testType score completedAt');
};

// Static method to get high-violation sessions (for admin review)
ProctoringSessionSchema.statics.getHighViolationSessions = async function(threshold = 3) {
  return this.find({ warningCount: { $gte: threshold } })
    .sort({ warningCount: -1, createdAt: -1 })
    .limit(50)
    .populate('user', 'email fullName')
    .populate('testSession', 'testType score');
};

// Instance method to get decrypted recording paths
ProctoringSessionSchema.methods.getDecryptedRecordings = function() {
  const recordings = {};
  
  try {
    if (this.recordings?.webcam) {
      recordings.webcam = decrypt(this.recordings.webcam);
    }
    if (this.recordings?.screen) {
      recordings.screen = decrypt(this.recordings.screen);
    }
    if (this.recordings?.audio) {
      recordings.audio = decrypt(this.recordings.audio);
    }
  } catch (error) {
    console.error('Failed to decrypt recordings:', error);
  }
  
  return recordings;
};

// Instance method to calculate integrity score
ProctoringSessionSchema.methods.calculateIntegrityScore = function() {
  let score = 100;
  
  // Deduct points for violations
  this.violations.forEach(violation => {
    if (violation.severity === 'critical') {
      score -= 15;
    } else {
      score -= 5;
    }
  });
  
  // Deduct points for integrity flag issues
  if (!this.integrityFlags.fullscreenMaintained) score -= 10;
  if (!this.integrityFlags.cameraActive) score -= 15;
  if (!this.integrityFlags.microphoneActive) score -= 5;
  if (!this.integrityFlags.screenShareActive) score -= 10;
  if (!this.integrityFlags.noTabSwitches) score -= 10;
  
  return Math.max(0, score);
};

// Instance method to get session summary
ProctoringSessionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    status: this.status,
    startTime: this.startTime,
    endTime: this.endTime,
    duration: this.duration,
    violationCount: this.violations.length,
    warningCount: this.warningCount,
    integrityScore: this.calculateIntegrityScore(),
    integrityFlags: this.integrityFlags,
    terminationReason: this.terminationReason,
  };
};

// Create indexes for efficient cleanup
ProctoringSessionSchema.statics.cleanupExpiredSessions = async function() {
  const expiredDate = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  
  // Find sessions to delete
  const sessionsToDelete = await this.find({ 
    createdAt: { $lt: expiredDate },
    status: { $in: ['completed', 'terminated'] }
  });
  
  // Delete associated recordings (would need file system cleanup)
  // This is handled by the TTL index automatically for mongoose docs
  
  return this.deleteMany({
    createdAt: { $lt: expiredDate },
    status: { $in: ['completed', 'terminated'] }
  });
};

const ProctoringSession = mongoose.model('ProctoringSession', ProctoringSessionSchema);

export default ProctoringSession;
