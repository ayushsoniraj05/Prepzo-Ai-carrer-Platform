/**
 * Company Model
 * Represents companies in the placement portal
 */

import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    logo: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },
    
    // Company Details
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      enum: [
        'Information Technology',
        'Software Development',
        'E-commerce',
        'Finance & Banking',
        'Consulting',
        'Healthcare',
        'Education',
        'Manufacturing',
        'Telecommunications',
        'Media & Entertainment',
        'Automotive',
        'Aerospace',
        'Energy',
        'Retail',
        'Hospitality',
        'Real Estate',
        'Other',
      ],
    },
    companyType: {
      type: String,
      enum: ['Product', 'Service', 'Startup', 'MNC', 'Government', 'PSU', 'Other'],
      default: 'Other',
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'],
    },
    foundedYear: {
      type: Number,
    },
    
    // Description
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    tagline: {
      type: String,
      maxlength: [200, 'Tagline cannot exceed 200 characters'],
    },
    
    // Location & Contact
    headquarters: {
      city: String,
      state: String,
      country: {
        type: String,
        default: 'India',
      },
    },
    locations: [{
      city: String,
      state: String,
      country: String,
    }],
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
    linkedIn: String,
    
    // Hiring Information
    hiringStatus: {
      type: String,
      enum: ['actively_hiring', 'occasionally_hiring', 'not_hiring'],
      default: 'not_hiring',
    },
    hiringProcess: {
      stages: [{
        name: String,
        description: String,
        order: Number,
      }],
      averageDuration: String, // e.g., "2-3 weeks"
      tips: [String],
    },
    
    // Skills & Technologies
    techStack: [String],
    requiredSkills: [String],
    
    // Salary Information
    salaryRange: {
      fresher: {
        min: Number,
        max: Number,
        currency: { type: String, default: 'INR' },
      },
      experienced: {
        min: Number,
        max: Number,
        currency: { type: String, default: 'INR' },
      },
    },
    
    // Benefits & Perks
    benefits: [String],
    
    // Ratings & Reviews
    ratings: {
      overall: { type: Number, default: 0, min: 0, max: 5 },
      workLifeBalance: { type: Number, default: 0, min: 0, max: 5 },
      salaryBenefits: { type: Number, default: 0, min: 0, max: 5 },
      careerGrowth: { type: Number, default: 0, min: 0, max: 5 },
      culture: { type: Number, default: 0, min: 0, max: 5 },
      reviewCount: { type: Number, default: 0 },
    },
    
    // Admin & Moderation
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    addedByType: {
      type: String,
      enum: ['admin', 'student_suggestion'],
      default: 'admin',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    rejectionReason: String,
    
    // Engagement Metrics
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    followerCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    
    // Featured
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: Date,
    
    // SEO & Meta
    metaKeywords: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
companySchema.index({ name: 'text', description: 'text', tagline: 'text' });
companySchema.index({ industry: 1, status: 1 });
companySchema.index({ 'headquarters.city': 1 });
companySchema.index({ techStack: 1 });
companySchema.index({ hiringStatus: 1 });

// Virtual for active jobs count
companySchema.virtual('activeJobs', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'company',
  count: true,
  match: { status: 'active' },
});

// Generate slug before saving
companySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Static method to find approved companies
companySchema.statics.findApproved = function (query = {}) {
  return this.find({ ...query, status: 'approved' });
};

// Instance method to follow company
companySchema.methods.addFollower = function (userId) {
  if (!this.followers.includes(userId)) {
    this.followers.push(userId);
    this.followerCount = this.followers.length;
  }
  return this.save();
};

// Instance method to unfollow company
companySchema.methods.removeFollower = function (userId) {
  this.followers = this.followers.filter(
    (id) => id.toString() !== userId.toString()
  );
  this.followerCount = this.followers.length;
  return this.save();
};

const Company = mongoose.model('Company', companySchema);

export default Company;
