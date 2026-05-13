/**
 * TestResult Model
 * Stores complete test data for AI analysis and answer review
 * 
 * This model stores:
 * - All answers submitted by the user
 * - Correct answers for each question
 * - Time taken per question
 * - Section-wise analysis
 * - AI analysis ready data
 */

import mongoose from 'mongoose';

const questionResultSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  options: [{
    type: String
  }],
  correctAnswer: {
    type: Number,  // Index of correct option
    required: true
  },
  selectedAnswer: {
    type: Number,  // Index of selected option, -1 if unattempted
    default: -1
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  isAttempted: {
    type: Boolean,
    default: false
  },
  timeTaken: {
    type: Number,  // in seconds
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  skill: {
    type: String,
    required: true
  },
  topic: {
    type: String
  },
  explanation: {
    type: String
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
  totalQuestions: {
    type: Number,
    required: true
  },
  attemptedQuestions: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  incorrectAnswers: {
    type: Number,
    default: 0
  },
  skippedQuestions: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,  // 0-100
    default: 0
  },
  accuracyRate: {
    type: Number,  // correctAnswers / attemptedQuestions
    default: 0
  },
  completionRate: {
    type: Number,  // attemptedQuestions / totalQuestions
    default: 0
  },
  timeTaken: {
    type: Number,  // in seconds
    default: 0
  },
  status: {
    type: String,
    enum: ['strong', 'moderate', 'weak', 'critical'],
    default: 'moderate'
  },
  questions: [questionResultSchema]
});

const testResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestSession'
  },
  
  // Test Metadata
  testType: {
    type: String,
    enum: ['field_based', 'skill_assessment', 'mock_interview', 'custom'],
    default: 'field_based'
  },
  field: {
    type: String,
    required: true
  },
  targetRole: {
    type: String
  },
  
  // Overall Results
  totalQuestions: {
    type: Number,
    required: true
  },
  attemptedQuestions: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  incorrectAnswers: {
    type: Number,
    default: 0
  },
  skippedQuestions: {
    type: Number,
    default: 0
  },
  
  // Scores
  overallScore: {
    type: Number,  // 0-100
    default: 0
  },
  accuracyRate: {
    type: Number,  // correctAnswers / attemptedQuestions * 100
    default: 0
  },
  completionRate: {
    type: Number,  // attemptedQuestions / totalQuestions * 100
    default: 0
  },
  
  // Time
  totalDuration: {
    type: Number,  // Total time allowed in minutes
    default: 0
  },
  timeTaken: {
    type: Number,  // Actual time taken in seconds
    default: 0
  },
  
  // Threshold Validation
  meetsThreshold: {
    type: Boolean,
    default: false
  },
  thresholdPercentage: {
    type: Number,
    default: 60  // Minimum 60% questions must be attempted
  },
  
  // Section-wise Results
  sections: [sectionResultSchema],
  
  // Analysis Flags
  isAnalyzed: {
    type: Boolean,
    default: false
  },
  aiRecommendationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recommendation'
  },
  
  // Performance Categories
  strongAreas: [{
    type: String
  }],
  weakAreas: [{
    type: String
  }],
  criticalGaps: [{
    type: String
  }],
  
  // Timestamps
  startedAt: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
testResultSchema.index({ userId: 1, createdAt: -1 });
testResultSchema.index({ userId: 1, field: 1 });
testResultSchema.index({ sessionId: 1 });

// Pre-save middleware to calculate derived fields
testResultSchema.pre('save', function(next) {
  // Calculate accuracy rate
  if (this.attemptedQuestions > 0) {
    this.accuracyRate = Math.round((this.correctAnswers / this.attemptedQuestions) * 100);
  }
  
  // Calculate completion rate
  if (this.totalQuestions > 0) {
    this.completionRate = Math.round((this.attemptedQuestions / this.totalQuestions) * 100);
  }
  
  // Check if meets threshold
  this.meetsThreshold = this.completionRate >= this.thresholdPercentage;
  
  // Calculate incorrect answers
  this.incorrectAnswers = this.attemptedQuestions - this.correctAnswers;
  
  // Calculate skipped questions
  this.skippedQuestions = this.totalQuestions - this.attemptedQuestions;
  
  // Categorize sections
  this.strongAreas = [];
  this.weakAreas = [];
  this.criticalGaps = [];
  
  this.sections.forEach(section => {
    if (section.score >= 70) {
      this.strongAreas.push(section.sectionName);
      section.status = 'strong';
    } else if (section.score >= 50) {
      section.status = 'moderate';
    } else if (section.score >= 30) {
      this.weakAreas.push(section.sectionName);
      section.status = 'weak';
    } else {
      this.criticalGaps.push(section.sectionName);
      section.status = 'critical';
    }
  });
  
  next();
});

// Method to get all question details for answer review
testResultSchema.methods.getAnswerReview = function() {
  const allQuestions = [];
  
  this.sections.forEach(section => {
    section.questions.forEach(q => {
      allQuestions.push({
        sectionName: section.sectionName,
        questionId: q.questionId,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        selectedAnswer: q.selectedAnswer,
        isCorrect: q.isCorrect,
        isAttempted: q.isAttempted,
        explanation: q.explanation,
        difficulty: q.difficulty,
        skill: q.skill
      });
    });
  });
  
  return allQuestions;
};

// Method to get AI analysis input
testResultSchema.methods.getAIAnalysisInput = function() {
  return {
    userId: this.userId,
    testId: this._id,
    field: this.field,
    targetRole: this.targetRole,
    overallScore: this.overallScore,
    accuracyRate: this.accuracyRate,
    completionRate: this.completionRate,
    meetsThreshold: this.meetsThreshold,
    strongAreas: this.strongAreas,
    weakAreas: this.weakAreas,
    criticalGaps: this.criticalGaps,
    sectionResults: this.sections.map(s => ({
      name: s.sectionName,
      score: s.score,
      accuracyRate: s.accuracyRate,
      completionRate: s.completionRate,
      status: s.status,
      totalQuestions: s.totalQuestions,
      attemptedQuestions: s.attemptedQuestions,
      correctAnswers: s.correctAnswers
    }))
  };
};

// Static method to check if user meets threshold for AI recommendations
testResultSchema.statics.checkThreshold = function(testResultId) {
  return this.findById(testResultId).then(result => {
    if (!result) return { eligible: false, message: 'Test result not found' };
    
    if (!result.meetsThreshold) {
      return {
        eligible: false,
        message: `Please attempt at least ${result.thresholdPercentage}% of questions (${Math.ceil(result.totalQuestions * result.thresholdPercentage / 100)} questions) to receive accurate AI recommendations.`,
        attemptedPercentage: result.completionRate,
        requiredPercentage: result.thresholdPercentage
      };
    }
    
    return {
      eligible: true,
      message: 'Eligible for AI recommendations',
      attemptedPercentage: result.completionRate
    };
  });
};

// Static method to get user's latest test result
testResultSchema.statics.getLatestForUser = function(userId, field = null) {
  const query = { userId };
  if (field) query.field = field;
  
  return this.findOne(query).sort({ createdAt: -1 });
};

const TestResult = mongoose.model('TestResult', testResultSchema);

export default TestResult;
