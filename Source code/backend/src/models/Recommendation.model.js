/**
 * AI Recommendation Model
 * Stores AI-generated personalized recommendations for each user
 */

import mongoose from 'mongoose';

const courseRecommendationSchema = new mongoose.Schema({
  title: { type: String },
  platform: { type: String },
  url: { type: String },
  thumbnail: { type: String },
  instructor: { type: String },
  level: { type: String },
  difficulty: { type: String },
  duration: { type: String },
  rating: { type: Number },
  students: { type: String },
  price: { type: String },
  expectedImprovement: { type: Number },
  skills: [{ type: String }],
  skillsTargeted: [{ type: String }],
  whyRecommended: { type: String },
  whyThisCourse: { type: String },
  howItHelps: { type: String },
  expectedOutcome: { type: String },
  readinessImpact: { type: String },
  priority: { type: String, default: 'important' },
  estimatedCompletionDays: { type: Number },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
});

const youtubeRecommendationSchema = new mongoose.Schema({
  title: { type: String },
  playlistTitle: { type: String },
  channel: { type: String },
  channelName: { type: String },
  channelLogo: { type: String },
  url: { type: String },
  thumbnail: { type: String },
  thumbnailUrl: { type: String },
  videoCount: { type: Number },
  totalVideos: { type: Number },
  totalDuration: { type: String },
  estimatedHours: { type: Number },
  views: { type: String },
  skillFocus: [{ type: String }],
  skillsTargeted: [{ type: String }],
  whyRecommended: { type: String },
  whyThisPlaylist: { type: String },
  howItHelps: { type: String },
  learningStyle: { type: String },
  priority: { type: String, default: 'important' },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
});

const certificationRecommendationSchema = new mongoose.Schema({
  title: { type: String },
  name: { type: String },
  provider: { type: String },
  issuingAuthority: { type: String },
  authorityLogo: { type: String },
  url: { type: String },
  thumbnail: { type: String },
  cost: { type: String },
  duration: { type: String },
  skills: [{ type: String }],
  skillsValidated: [{ type: String }],
  resumeImpact: { type: String },
  salaryImpact: { type: String },
  interviewValue: { type: String },
  industryValue: { type: String },
  difficultyLevel: { type: String },
  whyRecommended: { type: String },
  priority: { type: String, default: 'important' },
  achieved: { type: Boolean, default: false },
  achievedAt: { type: Date },
});

const projectRecommendationSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  techStack: [{ type: String }],
  difficulty: { type: String },
  duration: { type: String },
  estimatedDays: { type: Number },
  category: { type: String },
  thumbnail: { type: String },
  skillsGained: [{ type: String }],
  resumeImpact: { type: String },
  interviewTalkingPoints: [{ type: String }],
  githubRepoExample: { type: String },
  githubIdea: { type: String },
  whyRecommended: { type: String },
  howItHelps: { type: String },
  priority: { type: String, default: 'important' },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  userGithubUrl: { type: String },
});

const skillGapSchema = new mongoose.Schema({
  skill: { type: String },
  currentLevel: { type: String },
  requiredLevel: { type: String },
  impactOnInterviews: { type: String },
  priority: { type: String },
  reasoning: { type: String },
});

const improvementPredictionSchema = new mongoose.Schema({
  currentScore: { type: Number },
  predictedScore: { type: Number },
  improvementPercentage: { type: Number },
  timeToAchieve: { type: String },
  sectionWiseImprovement: { type: mongoose.Schema.Types.Mixed },
  interviewSuccessRate: {
    current: { type: String },
    predicted: { type: String },
  },
  confidenceLevel: { type: String },
});

const learningPathSchema = new mongoose.Schema({
  week1: [{ type: String }],
  week2: [{ type: String }],
  week3: [{ type: String }],
  week4: [{ type: String }],
});

const careerAdviceSchema = new mongoose.Schema({
  shortTerm: [{ type: String }],
  mediumTerm: [{ type: String }],
  longTerm: [{ type: String }],
  targetCompanyStrategy: { type: String },
  networkingTips: [{ type: String }],
  interviewPreparation: [{ type: String }],
});

const recommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  testSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestSession',
  },
  testId: {
    type: String,
  },

  // Analysis Insights
  analysisInsights: {
    primaryWeaknesses: [{ type: String }],
    hiddenGaps: [{ type: String }],
    strengths: [{ type: String }],
    interviewReadiness: { type: String },
    resumeGaps: [{ type: String }],
  },

  // Priority Skill Gaps
  prioritySkillGaps: [skillGapSchema],

  // Recommendations
  recommendations: {
    courses: [courseRecommendationSchema],
    youtube: [youtubeRecommendationSchema],
    certifications: [certificationRecommendationSchema],
    projects: [projectRecommendationSchema],
    studyNotes: { type: [mongoose.Schema.Types.Mixed], default: [] },
    interviewPrep: { type: [mongoose.Schema.Types.Mixed], default: [] },
    practice: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },

  // Learning Path
  learningPath: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Improvement Prediction
  improvementPrediction: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Career Advice
  careerAdvice: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Career Paths
  careerPaths: [{ type: mongoose.Schema.Types.Mixed }],

  // Section Scores (Mapped from Assessment)
  sectionScores: [{ type: mongoose.Schema.Types.Mixed }],

  // Summary
  explanationSummary: { type: String },



  // Metadata
  metadata: {
    generatedBy: { type: String },
    generatedAt: { type: Date, default: Date.now },
    inputScore: { type: Number },
    targetRole: { type: String },
    processingTime: { type: Number },
  },

  // Input data snapshot
  inputSnapshot: {
    studentProfile: { type: mongoose.Schema.Types.Mixed },
    assessmentResults: { type: mongoose.Schema.Types.Mixed },
    placementReadinessScore: { type: Number },
  },

  // Status
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed', 'expired'],
    default: 'completed',
  },

  // User engagement
  engagement: {
    viewedAt: { type: Date },
    coursesStarted: { type: Number, default: 0 },
    coursesCompleted: { type: Number, default: 0 },
    projectsStarted: { type: Number, default: 0 },
    projectsCompleted: { type: Number, default: 0 },
    certificationsAchieved: { type: Number, default: 0 },
    lastEngagedAt: { type: Date },
  },

  // Feedback
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    helpful: { type: Boolean },
    comment: { type: String },
    submittedAt: { type: Date },
  },

  // Versioning
  version: { type: Number, default: 1 },
  isLatest: { type: Boolean, default: true },

}, { timestamps: true });

// Index for efficient queries
recommendationSchema.index({ user: 1, createdAt: -1 });
recommendationSchema.index({ user: 1, isLatest: 1 });
recommendationSchema.index({ testId: 1 });

// Static method to get latest recommendation for user
recommendationSchema.statics.getLatestForUser = async function(userId) {
  return this.findOne({ user: userId, isLatest: true })
    .sort({ createdAt: -1 })
    .lean();
};

// Static method to mark old recommendations as not latest
recommendationSchema.statics.markOldAsNotLatest = async function(userId, excludeId) {
  return this.updateMany(
    { user: userId, _id: { $ne: excludeId } },
    { $set: { isLatest: false } }
  );
};

// Instance method to mark a course as completed
recommendationSchema.methods.markCourseCompleted = async function(courseIndex) {
  if (this.recommendations.courses[courseIndex]) {
    this.recommendations.courses[courseIndex].completed = true;
    this.recommendations.courses[courseIndex].completedAt = new Date();
    this.engagement.coursesCompleted += 1;
    this.engagement.lastEngagedAt = new Date();
    return this.save();
  }
  return null;
};

// Instance method to mark a project as completed
recommendationSchema.methods.markProjectCompleted = async function(projectIndex, githubUrl) {
  if (this.recommendations.projects[projectIndex]) {
    this.recommendations.projects[projectIndex].completed = true;
    this.recommendations.projects[projectIndex].completedAt = new Date();
    this.recommendations.projects[projectIndex].userGithubUrl = githubUrl;
    this.engagement.projectsCompleted += 1;
    this.engagement.lastEngagedAt = new Date();
    return this.save();
  }
  return null;
};

// Calculate completion progress
recommendationSchema.methods.getProgress = function() {
  const courses = this.recommendations.courses || [];
  const projects = this.recommendations.projects || [];
  const certifications = this.recommendations.certifications || [];

  const totalItems = courses.length + projects.length + certifications.length;
  const completedItems = 
    courses.filter(c => c.completed).length +
    projects.filter(p => p.completed).length +
    certifications.filter(c => c.achieved).length;

  return {
    total: totalItems,
    completed: completedItems,
    percentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
    breakdown: {
      courses: { total: courses.length, completed: courses.filter(c => c.completed).length },
      projects: { total: projects.length, completed: projects.filter(p => p.completed).length },
      certifications: { total: certifications.length, completed: certifications.filter(c => c.achieved).length },
    },
  };
};

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

export default Recommendation;
