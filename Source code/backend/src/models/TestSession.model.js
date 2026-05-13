import mongoose from 'mongoose';

const violationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'tab_switch',
      'fullscreen_exit',
      'multiple_faces',
      'no_face',
      'background_noise',
      'screen_share_stopped',
      'camera_disabled',
      'microphone_disabled',
      'copy_paste',
      'right_click',
      'keyboard_shortcut'
    ],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['warning', 'critical'],
    default: 'warning'
  }
});

const sectionResultSchema = new mongoose.Schema({
  sectionId: {
    type: String,
    required: true
  },
  sectionName: {
    type: String,
    required: true
  },
  questionsAttempted: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  },
  answers: [{
    questionId: String,
    selectedOption: Number,
    isCorrect: Boolean,
    timeTaken: Number // in seconds
  }]
});

const testSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testType: {
    type: String,
    enum: ['field_based', 'skill_assessment', 'mock_interview', 'custom', 'ai_generated', 'company_pattern'],
    default: 'field_based'
  },
  field: {
    type: String,
    required: true
  },
  degree: {
    type: String
  },
  targetRole: {
    type: String
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  totalDuration: {
    type: Number // in minutes
  },
  timeTaken: {
    type: Number // in seconds
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'terminated', 'abandoned'],
    default: 'in_progress'
  },
  terminationReason: {
    type: String
  },
  sections: [sectionResultSchema],
  violations: [violationSchema],
  totalViolations: {
    type: Number,
    default: 0
  },
  warningCount: {
    type: Number,
    default: 0
  },
  overallScore: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  percentageScore: {
    type: Number,
    default: 0
  },
  isProctoringEnabled: {
    type: Boolean,
    default: true
  },
  proctoringData: {
    cameraEnabled: { type: Boolean, default: false },
    microphoneEnabled: { type: Boolean, default: false },
    screenSharingEnabled: { type: Boolean, default: false },
    fullscreenEnabled: { type: Boolean, default: false }
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  generatedTest: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {

    type: String
  },
  userAgent: {
    type: String
  },
  deviceInfo: {
    type: String
  }
}, {
  timestamps: true
});

// Index for querying user's test history
testSessionSchema.index({ userId: 1, createdAt: -1 });
testSessionSchema.index({ userId: 1, status: 1 });

// Virtual for calculating pass status
testSessionSchema.virtual('isPassed').get(function() {
  return this.percentageScore >= 60;
});

// Method to add violation
testSessionSchema.methods.addViolation = function(violation) {
  this.violations.push(violation);
  this.totalViolations = this.violations.length;
  this.warningCount = this.violations.filter(v => v.severity === 'warning').length;
  return this.save();
};

// Method to complete test
testSessionSchema.methods.completeTest = function(results) {
  this.status = 'completed';
  this.endTime = new Date();
  this.timeTaken = Math.floor((this.endTime - this.startTime) / 1000);
  
  if (results) {
    this.sections = results.sections || this.sections;
    this.overallScore = results.overallScore || 0;
    this.totalQuestions = results.totalQuestions || 0;
    this.correctAnswers = results.correctAnswers || 0;
    this.percentageScore = results.totalQuestions > 0 
      ? Math.round((results.correctAnswers / results.totalQuestions) * 100)
      : 0;
  }
  
  return this.save();
};

// Method to terminate test
testSessionSchema.methods.terminateTest = function(reason) {
  this.status = 'terminated';
  this.endTime = new Date();
  this.timeTaken = Math.floor((this.endTime - this.startTime) / 1000);
  this.terminationReason = reason || 'Maximum violations exceeded';
  return this.save();
};

// Static method to get user's test history
testSessionSchema.statics.getUserTestHistory = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-answers');
};

// Static method to get user's best score for a field
testSessionSchema.statics.getUserBestScore = function(userId, field) {
  return this.findOne({ userId, field, status: 'completed' })
    .sort({ percentageScore: -1 })
    .select('percentageScore overallScore createdAt');
};

const TestSession = mongoose.model('TestSession', testSessionSchema);

export default TestSession;
