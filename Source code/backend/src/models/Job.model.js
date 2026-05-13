/**
 * Job Model
 * Represents job postings from companies
 */

import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Job title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
    },
    
    // Company Reference
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
    },
    
    // Job Details
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    responsibilities: [String],
    
    // Job Type & Work Mode
    jobType: {
      type: String,
      enum: ['full_time', 'part_time', 'internship', 'contract', 'freelance'],
      default: 'full_time',
    },
    workMode: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid'],
      default: 'onsite',
    },
    
    // Experience Requirements
    experienceLevel: {
      type: String,
      enum: ['fresher', 'entry', 'mid', 'senior', 'lead', 'executive'],
      required: true,
    },
    experienceRequired: {
      min: { type: Number, default: 0 },
      max: { type: Number },
    },
    
    // Skills & Qualifications
    requiredSkills: [{
      skill: { type: String, required: true },
      importance: { type: String, enum: ['required', 'preferred', 'nice_to_have'], default: 'required' },
    }],
    preferredSkills: [String],
    
    // Education
    educationRequired: {
      degree: {
        type: String,
        enum: ['High School', 'Diploma', 'Bachelor\'s', 'Master\'s', 'PhD', 'Any'],
        default: 'Any',
      },
      fields: [String], // e.g., ['Computer Science', 'Information Technology']
      minCGPA: Number,
    },
    
    // Salary
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'INR' },
      period: { type: String, enum: ['yearly', 'monthly', 'hourly'], default: 'yearly' },
      isNegotiable: { type: Boolean, default: true },
    },
    showSalary: {
      type: Boolean,
      default: true,
    },
    
    // Location
    locations: [{
      city: { type: String, required: true },
      state: String,
      country: { type: String, default: 'India' },
    }],
    
    // Application Details
    applicationDeadline: {
      type: Date,
    },
    applicationLink: {
      type: String, // External application link if any
    },
    applicationEmail: String,
    
    // Department & Role Category
    department: {
      type: String,
      enum: [
        'Engineering',
        'Product',
        'Design',
        'Data Science',
        'DevOps',
        'QA',
        'Security',
        'Marketing',
        'Sales',
        'HR',
        'Finance',
        'Operations',
        'Customer Support',
        'Other',
      ],
    },
    roleCategory: {
      type: String,
      enum: [
        'Software Engineer',
        'Frontend Developer',
        'Backend Developer',
        'Full Stack Developer',
        'Data Scientist',
        'Data Analyst',
        'ML Engineer',
        'DevOps Engineer',
        'Cloud Engineer',
        'QA Engineer',
        'Product Manager',
        'UI/UX Designer',
        'System Administrator',
        'Network Engineer',
        'Security Engineer',
        'Technical Writer',
        'Business Analyst',
        'Project Manager',
        'Other',
      ],
    },
    
    // Benefits
    benefits: [String],
    perks: [String],
    
    // Hiring Process
    hiringProcess: [{
      stage: String,
      description: String,
      order: Number,
    }],
    
    // Status
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'closed', 'filled'],
      default: 'active',
    },
    
    // Moderation
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    
    // Posted By
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Metrics
    viewCount: {
      type: Number,
      default: 0,
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
    savedCount: {
      type: Number,
      default: 0,
    },
    
    // AI Features
    aiMatchingEnabled: {
      type: Boolean,
      default: true,
    },
    keywordsForMatching: [String], // AI-extracted keywords for matching
    
    // Featured/Sponsored
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: Date,
    
    // Urgency
    isUrgent: {
      type: Boolean,
      default: false,
    },
    
    // Additional Info
    vacancyCount: {
      type: Number,
      default: 1,
    },
    startDate: Date,
    
    // Tags for search
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
jobSchema.index({ title: 'text', description: 'text', tags: 'text' });
jobSchema.index({ company: 1, status: 1 });
jobSchema.index({ 'locations.city': 1 });
jobSchema.index({ requiredSkills: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ salary: 1 });
jobSchema.index({ applicationDeadline: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ roleCategory: 1, status: 1 });

// Generate slug before saving
jobSchema.pre('save', async function (next) {
  if (this.isModified('title') || !this.slug) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    this.slug = `${baseSlug}-${this._id.toString().slice(-6)}`;
  }
  next();
});

// Virtual for days remaining
jobSchema.virtual('daysRemaining').get(function () {
  if (!this.applicationDeadline) return null;
  const now = new Date();
  const deadline = new Date(this.applicationDeadline);
  const diff = deadline - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual for salary display
jobSchema.virtual('salaryDisplay').get(function () {
  if (!this.showSalary || !this.salary) return 'Not Disclosed';
  const { min, max, currency, period } = this.salary;
  const formatSalary = (val) => {
    if (val >= 10000000) return `${(val / 10000000).toFixed(1)} Cr`;
    if (val >= 100000) return `${(val / 100000).toFixed(1)} LPA`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val;
  };
  if (min && max) {
    return `${currency} ${formatSalary(min)} - ${formatSalary(max)}`;
  }
  if (min) return `${currency} ${formatSalary(min)}+`;
  if (max) return `Up to ${currency} ${formatSalary(max)}`;
  return 'Not Disclosed';
});

// Static method to find active jobs
jobSchema.statics.findActive = function (query = {}) {
  return this.find({
    ...query,
    status: 'active',
    isApproved: true,
    $or: [
      { applicationDeadline: { $gte: new Date() } },
      { applicationDeadline: null },
    ],
  });
};

// Static method to search jobs with filters
jobSchema.statics.searchJobs = async function (filters = {}) {
  const {
    search,
    company,
    location,
    skills,
    experienceLevel,
    jobType,
    workMode,
    salaryMin,
    salaryMax,
    department,
    roleCategory,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filters;

  const query = {
    status: 'active',
    isApproved: true,
    $or: [
      { applicationDeadline: { $gte: new Date() } },
      { applicationDeadline: null },
    ],
  };

  if (search) {
    query.$text = { $search: search };
  }
  if (company) query.company = company;
  if (location) {
    query['locations.city'] = { $regex: location, $options: 'i' };
  }
  if (skills && skills.length > 0) {
    query['requiredSkills.skill'] = { $in: skills };
  }
  if (experienceLevel) query.experienceLevel = experienceLevel;
  if (jobType) query.jobType = jobType;
  if (workMode) query.workMode = workMode;
  if (department) query.department = department;
  if (roleCategory) query.roleCategory = roleCategory;
  if (salaryMin) query['salary.min'] = { $gte: salaryMin };
  if (salaryMax) query['salary.max'] = { $lte: salaryMax };

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [jobs, total] = await Promise.all([
    this.find(query)
      .populate('company', 'name logo industry headquarters')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query),
  ]);

  return {
    jobs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const Job = mongoose.model('Job', jobSchema);

export default Job;
