/**
 * SavedJob Model
 * Represents jobs saved/bookmarked by users
 */

import mongoose from 'mongoose';

const savedJobSchema = new mongoose.Schema(
  {
    // User who saved
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Job saved
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    
    // Company (denormalized for quick access)
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    
    // Notes
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    
    // Categories/Tags for organization
    tags: [String],
    
    // Priority
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'very_high'],
      default: 'medium',
    },
    
    // Reminder
    reminderDate: Date,
    reminderSent: {
      type: Boolean,
      default: false,
    },
    
    // Status in user's workflow
    workflowStatus: {
      type: String,
      enum: ['saved', 'reviewing', 'preparing', 'ready_to_apply', 'applied'],
      default: 'saved',
    },
    
    // If already applied
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },
    appliedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });
savedJobSchema.index({ user: 1, createdAt: -1 });
savedJobSchema.index({ user: 1, priority: 1 });
savedJobSchema.index({ user: 1, workflowStatus: 1 });
savedJobSchema.index({ reminderDate: 1, reminderSent: 1 });

// Static method to check if job is saved
savedJobSchema.statics.isJobSaved = async function (userId, jobId) {
  const saved = await this.findOne({ user: userId, job: jobId });
  return !!saved;
};

// Static method to get user's saved jobs with filters
savedJobSchema.statics.getUserSavedJobs = async function (userId, options = {}) {
  const { page = 1, limit = 20, priority, workflowStatus, sortBy = 'createdAt' } = options;
  const skip = (page - 1) * limit;
  
  const query = { user: userId };
  if (priority) query.priority = priority;
  if (workflowStatus) query.workflowStatus = workflowStatus;
  
  const [savedJobs, total] = await Promise.all([
    this.find(query)
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'name logo industry',
        },
      })
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments(query),
  ]);
  
  return {
    savedJobs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const SavedJob = mongoose.model('SavedJob', savedJobSchema);

export default SavedJob;
