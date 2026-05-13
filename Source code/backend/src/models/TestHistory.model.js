/**
 * Test History Model
 * Tracks user's attempted questions to prevent repetition
 */

import mongoose from 'mongoose';

const attemptedQuestionSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
  },
  wasCorrect: {
    type: Boolean,
    required: true,
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0,
  },
  attemptedAt: {
    type: Date,
    default: Date.now,
  },
});

const testHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // All attempted question IDs (for quick lookup)
  attemptedQuestionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  }],
  
  // Detailed attempt history
  attempts: [attemptedQuestionSchema],
  
  // Section-wise statistics
  sectionStats: {
    type: Map,
    of: {
      totalAttempted: { type: Number, default: 0 },
      correctAnswers: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 },
      lastAttempted: { type: Date },
      easyAttempted: { type: Number, default: 0 },
      mediumAttempted: { type: Number, default: 0 },
      hardAttempted: { type: Number, default: 0 },
    },
    default: {},
  },
  
  // Overall statistics
  totalQuestionsAttempted: {
    type: Number,
    default: 0,
  },
  
  totalCorrectAnswers: {
    type: Number,
    default: 0,
  },
  
  averageScore: {
    type: Number,
    default: 0,
  },
  
  // Test sessions completed
  testsCompleted: {
    type: Number,
    default: 0,
  },
  
  // Weak areas identified
  weakSections: [{
    type: String,
  }],
  
  // Strong areas identified
  strongSections: [{
    type: String,
  }],
  
  // Last test taken
  lastTestDate: {
    type: Date,
  },
  
  // Company-specific history
  companyTestHistory: [{
    company: String,
    testDate: Date,
    score: Number,
    questionCount: Number,
  }],
  
}, {
  timestamps: true,
});

// Indexes for efficient querying
testHistorySchema.index({ userId: 1 });
testHistorySchema.index({ userId: 1, 'attempts.attemptedAt': -1 });
testHistorySchema.index({ userId: 1, attemptedQuestionIds: 1 });

// Static method to get user's attempted question IDs
testHistorySchema.statics.getAttemptedQuestionIds = async function(userId) {
  const history = await this.findOne({ userId }).select('attemptedQuestionIds');
  return history?.attemptedQuestionIds || [];
};

// Static method to record a test attempt
testHistorySchema.statics.recordAttempt = async function(userId, attempts) {
  let history = await this.findOne({ userId });
  
  if (!history) {
    history = new this({ userId, attemptedQuestionIds: [], attempts: [] });
  }
  
  let correctCount = 0;
  
  for (const attempt of attempts) {
    // Add to attempted IDs list (avoid duplicates)
    if (!history.attemptedQuestionIds.includes(attempt.questionId)) {
      history.attemptedQuestionIds.push(attempt.questionId);
    }
    
    // Add to detailed attempts
    history.attempts.push({
      questionId: attempt.questionId,
      section: attempt.section,
      difficulty: attempt.difficulty,
      wasCorrect: attempt.wasCorrect,
      timeSpent: attempt.timeSpent,
    });
    
    if (attempt.wasCorrect) correctCount++;
    
    // Update section stats
    const sectionKey = attempt.section;
    const sectionStats = history.sectionStats.get(sectionKey) || {
      totalAttempted: 0,
      correctAnswers: 0,
      averageTime: 0,
      easyAttempted: 0,
      mediumAttempted: 0,
      hardAttempted: 0,
    };
    
    sectionStats.totalAttempted++;
    if (attempt.wasCorrect) sectionStats.correctAnswers++;
    sectionStats.averageTime = ((sectionStats.averageTime * (sectionStats.totalAttempted - 1)) + attempt.timeSpent) / sectionStats.totalAttempted;
    sectionStats.lastAttempted = new Date();
    
    if (attempt.difficulty === 'Easy') sectionStats.easyAttempted++;
    else if (attempt.difficulty === 'Medium') sectionStats.mediumAttempted++;
    else if (attempt.difficulty === 'Hard') sectionStats.hardAttempted++;
    
    history.sectionStats.set(sectionKey, sectionStats);
  }
  
  // Update overall stats
  history.totalQuestionsAttempted += attempts.length;
  history.totalCorrectAnswers += correctCount;
  history.averageScore = (history.totalCorrectAnswers / history.totalQuestionsAttempted) * 100;
  history.testsCompleted++;
  history.lastTestDate = new Date();
  
  // Calculate weak and strong sections
  const sectionScores = [];
  history.sectionStats.forEach((stats, section) => {
    const score = stats.totalAttempted > 0 
      ? (stats.correctAnswers / stats.totalAttempted) * 100 
      : 0;
    sectionScores.push({ section, score, attempts: stats.totalAttempted });
  });
  
  // Sort by score
  sectionScores.sort((a, b) => a.score - b.score);
  
  // Weak sections (bottom performers with at least 5 attempts)
  history.weakSections = sectionScores
    .filter(s => s.attempts >= 5 && s.score < 50)
    .slice(0, 3)
    .map(s => s.section);
  
  // Strong sections (top performers with at least 5 attempts)
  history.strongSections = sectionScores
    .filter(s => s.attempts >= 5 && s.score >= 70)
    .slice(-3)
    .reverse()
    .map(s => s.section);
  
  await history.save();
  return history;
};

// Static method to get recent attempts for a section
testHistorySchema.statics.getRecentAttempts = async function(userId, section, limit = 50) {
  const history = await this.findOne({ userId });
  if (!history) return [];
  
  return history.attempts
    .filter(a => a.section === section)
    .sort((a, b) => b.attemptedAt - a.attemptedAt)
    .slice(0, limit);
};

// Static method to get user's section performance
testHistorySchema.statics.getSectionPerformance = async function(userId) {
  const history = await this.findOne({ userId });
  if (!history) return [];
  
  const performance = [];
  history.sectionStats.forEach((stats, section) => {
    const accuracy = stats.totalAttempted > 0 
      ? Math.round((stats.correctAnswers / stats.totalAttempted) * 100) 
      : 0;
    
    performance.push({
      section,
      totalAttempted: stats.totalAttempted,
      correctAnswers: stats.correctAnswers,
      accuracy,
      averageTime: Math.round(stats.averageTime),
      lastAttempted: stats.lastAttempted,
      easyAttempted: stats.easyAttempted,
      mediumAttempted: stats.mediumAttempted,
      hardAttempted: stats.hardAttempted,
    });
  });
  
  return performance.sort((a, b) => b.totalAttempted - a.totalAttempted);
};

// Static method to check if user should get harder questions
testHistorySchema.statics.shouldIncreaseeDifficulty = async function(userId, section) {
  const history = await this.findOne({ userId });
  if (!history) return false;
  
  const sectionStats = history.sectionStats.get(section);
  if (!sectionStats || sectionStats.totalAttempted < 10) return false;
  
  // If user has > 80% accuracy, increase difficulty
  const accuracy = (sectionStats.correctAnswers / sectionStats.totalAttempted) * 100;
  return accuracy > 80;
};

// Instance method to clear old history (keep last 1000 attempts)
testHistorySchema.methods.cleanupOldHistory = function() {
  if (this.attempts.length > 1000) {
    // Sort by date and keep only recent
    this.attempts.sort((a, b) => b.attemptedAt - a.attemptedAt);
    this.attempts = this.attempts.slice(0, 1000);
  }
  return this.save();
};

const TestHistory = mongoose.model('TestHistory', testHistorySchema);

export default TestHistory;
