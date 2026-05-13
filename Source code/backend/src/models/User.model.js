import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { encrypt, decrypt } from '../utils/encryption.js';

const userSchema = new mongoose.Schema({
  // Basic Information (from signup)
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: 2,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple nulls
  },
  avatar: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    required: false, // Make optional for OAuth users
    trim: true,
  },
  dateOfBirth: {
    type: String,
    required: false, // Make optional for OAuth users
  },
  gender: {
    type: String,
    required: false, // Make optional for OAuth users
    enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other', 'male', 'female', 'non-binary', 'prefer not to say', 'other'],
    set: function(val) {
      if (val && typeof val === 'string') {
        return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
      }
      return val;
    }
  },
  password: {
    type: String,
    required: false, // Make optional for OAuth users
    minlength: 8,
    select: false,
  },

  // Education Information
  collegeName: {
    type: String,
    required: false,
    trim: true,
  },
  degree: {
    type: String,
    required: false,
  },
  fieldOfStudy: {
    type: String,
    required: false,
  },
  yearOfStudy: {
    type: String,
    required: false,
  },
  cgpa: {
    type: String,
    default: '',
  },

  // Career Information
  targetRole: {
    type: String,
    required: false,
  },
  knownTechnologies: {
    type: [String],
    default: [],
  },
  skillRatings: {
    type: Map,
    of: Number, // Maps skill name to rating (1-10)
    default: {},
  },

  // Career Goals (from onboarding)
  placementTimeline: {
    type: String,
    default: '',
  },
  expectedCtc: {
    type: String,
    default: '',
  },
  preferredCompanies: {
    type: [String],
    default: [],
  },

  // Social Links
  linkedin: {
    type: String,
    default: '',
  },
  github: {
    type: String,
    default: '',
  },
  resumeUrl: {
    type: String,
    default: '',
  },
  resumeText: {
    type: String,
    default: '',
  },
  resumeOriginalName: {
    type: String,
    default: '',
  },
  resumeUploadedAt: {
    type: Date,
    default: null,
  },

  // Platform Data
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
  isOnboarded: {
    type: Boolean,
    default: false,
  },
  isAssessmentComplete: {
    type: Boolean,
    default: false,
  },
  isFieldTestComplete: {
    type: Boolean,
    default: false,
  },
  isSkillTestComplete: {
    type: Boolean,
    default: false,
  },
  lastAssessmentAt: {
    type: Date,
    default: null,
  },
  fieldAssessmentResults: {
    score: Number,
    sections: [{
      name: String,
      score: Number,
      correct: Number,
      total: Number
    }],
    completedAt: Date
  },
  skillAssessmentResults: {
    score: Number,
    sections: [{
      name: String,
      score: Number,
      correct: Number,
      total: Number
    }],
    completedAt: Date
  },


  // Assessment Scores
  placementReadinessScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  atsScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  atsHistory: [{
    score: { type: Number, min: 0, max: 100 },
    targetRole: { type: String },
    analyzedAt: { type: Date, default: Date.now },
    source: { type: String, enum: ['analyze', 'reanalyze'], default: 'analyze' }
  }],

  // ========== RESUME ANALYSIS (AI-GENERATED) ==========
  resumeAnalysis: {
    // Overall ATS Score
    overallScore: { type: Number, default: 0, min: 0, max: 100 },
    
    // Section-wise Analysis
    sections: [{
      name: { type: String },
      score: { type: Number, min: 0, max: 100 },
      feedback: [{ type: String }],
      icon: { type: String }
    }],
    
    // Keywords Analysis
    keywords: [{ type: String }],
    missingKeywords: [{ type: String }],
    keywordMatchScore: { type: Number, default: 0 },
    
    // AI-Generated Suggestions
    suggestions: [{ type: String }],
    
    // Improved Lines (AI-generated better versions)
    improvedLines: [{
      original: { type: String },
      improved: { type: String },
      reason: { type: String }
    }],
    
    // Professional Summary Suggestion
    suggestedSummary: { type: String },
    
    // Role-Based Analysis
    jobMatch: {
      targetRole: { type: String },
      matchPercentage: { type: Number, default: 0 },
      requiredSkillsMatch: [{
        skill: { type: String },
        found: { type: Boolean },
        importance: { type: String, enum: ['required', 'preferred', 'nice-to-have'] }
      }]
    },
    
    // Skill Gaps with Recommendations
    skillGapsDetailed: [{
      skill: { type: String },
      importance: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
      description: { type: String },
      certifications: [{
        name: { type: String },
        provider: { type: String },
        url: { type: String },
        duration: { type: String },
        difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
        skills: [{ type: String }],
        price: { type: String },
        rating: { type: Number }
      }]
    }],
    
    // Format Analysis
    formatAnalysis: [{
      category: { type: String },
      status: { type: String, enum: ['good', 'warning', 'error'] },
      message: { type: String },
      tip: { type: String }
    }],
    
    // Improvement Plan (Prioritized)
    improvementPlan: [{
      priority: { type: Number },
      action: { type: String },
      impact: { type: String, enum: ['high', 'medium', 'low'] },
      timeToComplete: { type: String },
      details: { type: String }
    }],
    
    // Industry Comparison
    industryComparison: [{
      metric: { type: String },
      yourScore: { type: Number },
      average: { type: Number },
      topPerformers: { type: Number }
    }],
    
    // Strengths & Weaknesses Summary
    strengthsSummary: [{ type: String }],
    weaknessesSummary: [{ type: String }],
    
    // Extracted Data from Resume
    extractedData: {
      skills: [{ type: String }],
      experience: [{ 
        title: { type: String },
        company: { type: String },
        duration: { type: String },
        highlights: [{ type: String }]
      }],
      education: [{
        degree: { type: String },
        institution: { type: String },
        year: { type: String },
        gpa: { type: String }
      }],
      projects: [{
        name: { type: String },
        description: { type: String },
        technologies: [{ type: String }],
        highlights: [{ type: String }]
      }],
      certifications: [{ type: String }],
      achievements: [{ type: String }]
    },
    
    // Analysis Metadata
    analyzedAt: { type: Date },
    analyzerVersion: { type: String, default: '1.0' },
    targetRoleUsed: { type: String },

    // Role + JD Context
    roleContext: {
      targetRole: { type: String },
      jobDescriptionUsed: { type: String },
      demoJobId: { type: String, default: null },
      analyzedAgainst: { type: String }
    },

    // Advanced ATS report fields
    keywordAnalysis: {
      jdKeywords: [{ type: String }],
      matchedKeywords: [{ type: String }],
      missingKeywords: [{ type: String }],
      keywordMatchRate: { type: Number, default: 0 },
      industryKeywordDensity: { type: Number, default: 0 }
    },
    parsedResume: {
      name: { type: String },
      education: [{ type: mongoose.Schema.Types.Mixed }],
      technicalSkills: [{ type: String }],
      projects: [{ type: mongoose.Schema.Types.Mixed }],
      workExperience: [{ type: mongoose.Schema.Types.Mixed }],
      certifications: [{ type: String }],
      technologiesUsed: [{ type: String }],
      achievements: [{ type: String }]
    },
    skillGapAnalysis: {
      currentSkills: [{ type: String }],
      missingSkills: [{ type: String }],
      recommendations: [{ type: String }]
    },
    atsBreakdown: {
      factors: [{
        id: { type: String },
        label: { type: String },
        weight: { type: Number },
        score: { type: Number }
      }],
      weightedScore: { type: Number, default: 0 },
      baselineAIATS: { type: Number, default: 0 }
    },
    projectQualityEvaluation: {
      projectCount: { type: Number, default: 0 },
      score: { type: Number, default: 0 },
      notes: { type: String }
    },
    aiRecommendations: {
      skillsToLearn: [{ type: String }],
      projectsToBuild: [{ type: String }],
      certificationsToPursue: [{ type: String }],
      technologiesToAdd: [{ type: String }],
      coursesToTake: [{ type: String }],
      industryTools: [{ type: String }]
    },
    resumeRewrite: {
      beforeAfterPairs: [{
        original: { type: String },
        improved: { type: String },
        reason: { type: String }
      }],
      summaryRewrite: { type: String }
    },
    recruiterSimulation: {
      strengths: [{ type: String }],
      concerns: [{ type: String }],
      recommendation: { type: String }
    },
    linkedinOptimization: {
      optimizedHeadline: { type: String },
      summarySuggestions: [{ type: String }],
      skillHighlights: [{ type: String }],
      networkingStrategies: [{ type: String }],
      portfolioLinksSuggestions: [{ type: String }]
    },
    resumeRanking: {
      percentile: { type: Number, default: 0 },
      tier: { type: String },
      rankingFactors: {
        atsScore: { type: Number, default: 0 },
        skillRelevance: { type: Number, default: 0 },
        projectQuality: { type: Number, default: 0 },
        experienceRelevance: { type: Number, default: 0 }
      }
    },
    interviewSuccess: {
      probability: { type: Number, default: 0 },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      communicationReadiness: { type: Number, default: 0 },
      recommendations: [{ type: String }]
    },
    scoreSimulation: {
      currentScore: { type: Number, default: 0 },
      expectedScoreAfterImprovements: { type: Number, default: 0 },
      topActions: [{ type: String }]
    },
    careerRoadmap: {
      milestones: [{
        week: { type: String },
        goal: { type: String },
        output: { type: String }
      }]
    },
    mentorContextPrompts: [{ type: String }]
  },

  // Skills Analysis
  skillGaps: {
    type: [String],
    default: [],
  },
  strengths: {
    type: [String],
    default: [],
  },
  weaknesses: {
    type: [String],
    default: [],
  },

  // ========== SECURITY FIELDS ==========
  
  // Email Verification
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerifiedAt: {
    type: Date,
    default: null,
  },

  // Two-Factor Authentication
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: {
    type: String,
    select: false,
    default: null,
  },
  twoFactorBackupCodes: {
    type: [String],
    select: false,
    default: [],
  },
  twoFactorTempSecret: {
    type: String,
    select: false,
    default: null,
  },

  // Account Security
  isAccountLocked: {
    type: Boolean,
    default: false,
  },
  accountLockedAt: {
    type: Date,
    default: null,
  },
  accountLockReason: {
    type: String,
    enum: ['failed_attempts', 'security_breach', 'admin_action', 'suspicious_activity', null],
    default: null,
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lastFailedLoginAt: {
    type: Date,
    default: null,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
  lastLoginIp: {
    type: String,
    default: '',
  },

  // Password Security
  passwordHistory: {
    type: [String],
    select: false,
    default: [],
  },
  passwordChangedAt: {
    type: Date,
    default: null,
  },
  mustChangePassword: {
    type: Boolean,
    default: false,
  },

  // Session Management
  activeSessions: {
    type: Number,
    default: 0,
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
  },

  // Security Preferences
  securityPreferences: {
    loginNotifications: { type: Boolean, default: true },
    suspiciousActivityAlerts: { type: Boolean, default: true },
    twoFactorForSensitiveOps: { type: Boolean, default: false },
  },

  // Account Status
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'pending_verification', 'deactivated'],
    default: 'pending_verification',
  },
  suspendedAt: {
    type: Date,
    default: null,
  },
  suspendedReason: {
    type: String,
    default: null,
  },

  // Extended Role
  role: {
    type: String,
    enum: ['student', 'admin', 'superadmin'],
    default: 'student',
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  // Save old password to history before changing
  if (this.password && !this.isNew) {
    const currentPasswordHash = this.password;
    // Keep only last 5 passwords in history
    if (!this.passwordHistory) {
      this.passwordHistory = [];
    }
    this.passwordHistory.unshift(currentPasswordHash);
    if (this.passwordHistory.length > 5) {
      this.passwordHistory = this.passwordHistory.slice(0, 5);
    }
  }
  
  // Hash password with 12 salt rounds (enterprise grade)
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = new Date();
  
  next();
});

// Encrypt sensitive fields before saving
userSchema.pre('save', function(next) {
  if (this.isModified('phone')) {
    this.phone = encrypt(this.phone);
  }
  if (this.isModified('dateOfBirth')) {
    this.dateOfBirth = encrypt(this.dateOfBirth);
  }
  next();
});

// Decrypt sensitive fields after loading
userSchema.post('init', function(doc) {
  if (doc.phone) {
    doc.phone = decrypt(doc.phone);
  }
  if (doc.dateOfBirth) {
    doc.dateOfBirth = decrypt(doc.dateOfBirth);
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if password was used before
userSchema.methods.isPasswordInHistory = async function(newPassword) {
  if (!this.passwordHistory || this.passwordHistory.length === 0) {
    return false;
  }
  
  for (const oldHash of this.passwordHistory) {
    if (await bcrypt.compare(newPassword, oldHash)) {
      return true;
    }
  }
  return false;
};

// Record failed login attempt
userSchema.methods.recordFailedLogin = async function() {
  this.failedLoginAttempts += 1;
  this.lastFailedLoginAt = new Date();
  
  // Lock account after 5 failed attempts
  if (this.failedLoginAttempts >= 5) {
    this.isAccountLocked = true;
    this.accountLockedAt = new Date();
    this.accountLockReason = 'failed_attempts';
  }
  
  await this.save();
  return this.failedLoginAttempts;
};

// Record successful login
userSchema.methods.recordSuccessfulLogin = async function(ip = '') {
  this.failedLoginAttempts = 0;
  this.lastFailedLoginAt = null;
  this.lastLoginAt = new Date();
  this.lastLoginIp = ip;
  this.lastActivityAt = new Date();
  
  // Unlock account if it was locked due to failed attempts
  if (this.isAccountLocked && this.accountLockReason === 'failed_attempts') {
    // Check if lockout period has passed (15 minutes)
    const lockoutDuration = 15 * 60 * 1000;
    const timeSinceLock = Date.now() - this.accountLockedAt.getTime();
    
    if (timeSinceLock >= lockoutDuration) {
      this.isAccountLocked = false;
      this.accountLockedAt = null;
      this.accountLockReason = null;
    }
  }
  
  await this.save();
};

// Check if account is currently locked
userSchema.methods.isLocked = function() {
  if (!this.isAccountLocked) return false;
  
  // Check if lockout period has expired for failed_attempts
  if (this.accountLockReason === 'failed_attempts') {
    const lockoutDuration = 15 * 60 * 1000; // 15 minutes
    const timeSinceLock = Date.now() - this.accountLockedAt.getTime();
    return timeSinceLock < lockoutDuration;
  }
  
  // For other lock reasons, stay locked until admin unlocks
  return true;
};

// Get remaining lockout time
userSchema.methods.getRemainingLockoutTime = function() {
  if (!this.isAccountLocked || !this.accountLockedAt) return 0;
  
  const lockoutDuration = 15 * 60 * 1000; // 15 minutes
  const timeSinceLock = Date.now() - this.accountLockedAt.getTime();
  const remaining = lockoutDuration - timeSinceLock;
  
  return Math.max(remaining, 0);
};

// Calculate exponential backoff delay
userSchema.methods.getLoginDelay = function() {
  const attempts = this.failedLoginAttempts;
  if (attempts < 3) return 0;
  
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds
  const delay = baseDelay * Math.pow(2, attempts - 3);
  
  return Math.min(delay, maxDelay);
};

// Unlock account (admin action)
userSchema.methods.unlockAccount = async function() {
  this.isAccountLocked = false;
  this.accountLockedAt = null;
  this.accountLockReason = null;
  this.failedLoginAttempts = 0;
  await this.save();
};

// Verify email
userSchema.methods.verifyEmail = async function() {
  this.isEmailVerified = true;
  this.emailVerifiedAt = new Date();
  this.accountStatus = 'active';
  await this.save();
};

// Virtual for assessment locking
userSchema.virtual('isAssessmentLocked').get(function() {
  if (!this.lastAssessmentAt) return false;
  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
  const timeSinceLast = Date.now() - this.lastAssessmentAt.getTime();
  return timeSinceLast < threeDaysInMs;
});

// Virtual for assessment unlock date
userSchema.virtual('assessmentUnlockDate').get(function() {
  if (!this.lastAssessmentAt) return null;
  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
  return new Date(this.lastAssessmentAt.getTime() + threeDaysInMs);
});

// Method to convert to JSON for frontend (excluding sensitive data)
userSchema.methods.toJSON = function() {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  delete obj.passwordHistory;
  delete obj.twoFactorSecret;
  delete obj.__v;
  obj.id = obj._id;
  delete obj._id;
  return obj;
};


// Static: Find user with password for authentication
userSchema.statics.findByEmailWithPassword = async function(email) {
  return this.findOne({ email: email.toLowerCase() })
    .select('+password +passwordHistory');
};

// Static: Find active users
userSchema.statics.findActiveUsers = async function(query = {}) {
  return this.find({
    ...query,
    accountStatus: 'active',
    isAccountLocked: false,
  });
};

const User = mongoose.model('User', userSchema);

export default User;
