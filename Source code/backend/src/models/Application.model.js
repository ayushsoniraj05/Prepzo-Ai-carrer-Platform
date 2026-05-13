/**
 * Application Model
 * Represents job applications from students
 */

import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    // References
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant is required'],
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job is required'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
    },
    
    // Application Status
    status: {
      type: String,
      enum: [
        'applied',         // Just submitted
        'viewed',          // Recruiter viewed
        'under_review',    // Being reviewed
        'shortlisted',     // Passed initial screening
        'interview_scheduled', // Interview date set
        'interview_completed', // Interview done
        'offer_extended',  // Got offer
        'offer_accepted',  // Accepted offer
        'offer_rejected',  // Rejected offer
        'rejected',        // Application rejected
        'withdrawn',       // Student withdrew
        'on_hold',         // Temporarily paused
      ],
      default: 'applied',
    },
    
    // Status History
    statusHistory: [{
      status: String,
      changedAt: { type: Date, default: Date.now },
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      notes: String,
    }],
    
    // Resume & Cover Letter
    resumeUrl: {
      type: String,
    },
    resumeVersion: String, // Track which resume version was used
    coverLetter: {
      type: String,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
    },
    
    // AI Job Match Score
    matchScore: {
      overall: { type: Number, min: 0, max: 100 },
      skillMatch: { type: Number, min: 0, max: 100 },
      experienceMatch: { type: Number, min: 0, max: 100 },
      educationMatch: { type: Number, min: 0, max: 100 },
    },
    matchDetails: {
      matchedSkills: [String],
      missingSkills: [String],
      recommendations: [String],
    },
    
    // Interview Details
    interviews: [{
      round: Number,
      type: {
        type: String,
        enum: ['phone', 'video', 'onsite', 'technical', 'hr', 'panel', 'coding'],
      },
      scheduledAt: Date,
      duration: Number, // in minutes
      location: String, // or video link
      interviewers: [String],
      feedback: String,
      rating: { type: Number, min: 1, max: 5 },
      status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show'],
        default: 'scheduled',
      },
      notes: String,
    }],
    
    // Offer Details
    offer: {
      salary: Number,
      currency: { type: String, default: 'INR' },
      joiningDate: Date,
      expiryDate: Date,
      offerLetterUrl: String,
      additionalDetails: String,
    },
    
    // Screening Questions & Answers
    screeningResponses: [{
      question: String,
      answer: String,
    }],
    
    // Additional Documents
    additionalDocuments: [{
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now },
    }],
    
    // Recruiter Notes (internal)
    recruiterNotes: [{
      note: String,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      addedAt: { type: Date, default: Date.now },
    }],
    
    // Applicant Notes (personal)
    applicantNotes: String,
    
    // Source Tracking
    source: {
      type: String,
      enum: ['direct', 'ai_recommendation', 'search', 'company_page', 'referral', 'external', 'platform'],
      default: 'direct',
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    
    // Flags
    isStarred: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
    
    // Withdrawal
    withdrawnAt: Date,
    withdrawalReason: String,
    
    // Rejection
    rejectedAt: Date,
    rejectionReason: String,
    rejectionFeedback: String,
    
    // Timestamps for stages
    viewedAt: Date,
    shortlistedAt: Date,
    interviewScheduledAt: Date,
    offerExtendedAt: Date,
    
    // Expected Salary (from applicant)
    expectedSalary: {
      amount: Number,
      currency: { type: String, default: 'INR' },
    },
    
    // Availability
    noticePeriod: String,
    preferredJoiningDate: Date,
    
    // Communication
    lastCommunicatedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
applicationSchema.index({ applicant: 1, job: 1 }, { unique: true }); // One application per job per user
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ company: 1, status: 1 });
applicationSchema.index({ createdAt: -1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ 'matchScore.overall': -1 });

// Virtual for days since applied
applicationSchema.virtual('daysSinceApplied').get(function () {
  const now = new Date();
  const applied = new Date(this.createdAt);
  return Math.floor((now - applied) / (1000 * 60 * 60 * 24));
});

// Pre-save hook to track status changes
applicationSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
    
    // Set timestamps for specific statuses
    switch (this.status) {
      case 'viewed':
        if (!this.viewedAt) this.viewedAt = new Date();
        break;
      case 'shortlisted':
        this.shortlistedAt = new Date();
        break;
      case 'interview_scheduled':
        this.interviewScheduledAt = new Date();
        break;
      case 'offer_extended':
        this.offerExtendedAt = new Date();
        break;
      case 'withdrawn':
        this.withdrawnAt = new Date();
        break;
      case 'rejected':
        this.rejectedAt = new Date();
        break;
    }
  }
  next();
});

// Static method to get application stats for a user
applicationSchema.statics.getUserStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { applicant: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);
  
  const result = {
    total: 0,
    applied: 0,
    viewed: 0,
    under_review: 0,
    shortlisted: 0,
    interview_scheduled: 0,
    rejected: 0,
    offer_extended: 0,
  };
  
  stats.forEach(({ _id, count }) => {
    result[_id] = count;
    result.total += count;
  });
  
  return result;
};

// Static method to get company application stats
applicationSchema.statics.getCompanyStats = async function (companyId) {
  return this.aggregate([
    { $match: { company: new mongoose.Types.ObjectId(companyId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);
};

const Application = mongoose.model('Application', applicationSchema);

export default Application;
