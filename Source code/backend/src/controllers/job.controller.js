/**
 * Job Controller
 * Handles all job posting and search operations
 */

import { asyncHandler } from '../middleware/error.middleware.js';
import Job from '../models/Job.model.js';
import Company from '../models/Company.model.js';
import SavedJob from '../models/SavedJob.model.js';
import Application from '../models/Application.model.js';
import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';
import redisService from '../services/redis.service.js';

/**
 * @desc    Search jobs with advanced filters
 * @route   GET /api/jobs
 * @access  Public
 */
export const searchJobs = asyncHandler(async (req, res) => {
  const {
    search,
    company,
    location,
    skills,
    experienceLevel,
    jobType,
    workMode,
    department,
    roleCategory,
    salaryMin,
    salaryMax,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const result = await Job.searchJobs({
    search,
    company,
    location,
    skills: skills ? skills.split(',') : null,
    experienceLevel,
    jobType,
    workMode,
    department,
    roleCategory,
    salaryMin: salaryMin ? parseInt(salaryMin) : null,
    salaryMax: salaryMax ? parseInt(salaryMax) : null,
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
  });

  // If user is logged in, check saved status
  if (req.user) {
    const savedJobs = await SavedJob.find({
      user: req.user._id,
      job: { $in: result.jobs.map(j => j._id) },
    }).select('job');
    
    const savedJobIds = new Set(savedJobs.map(s => s.job.toString()));
    
    result.jobs = result.jobs.map(job => ({
      ...job,
      isSaved: savedJobIds.has(job._id.toString()),
    }));
  }

  res.json({
    success: true,
    data: result,
  });
});

/**
 * @desc    Get job by ID
 * @route   GET /api/jobs/:id
 * @access  Public
 */
export const getJobById = asyncHandler(async (req, res) => {
  const cacheKey = `job:${req.params.id}`;
  const cachedData = await redisService.getCache(cacheKey);
  
  let job;
  if (cachedData) {
    job = cachedData;
  } else {
    job = await Job.findById(req.params.id)
      .populate('company', 'name logo industry headquarters description website ratings techStack benefits hiringProcess')
      .populate('postedBy', 'fullName');

    if (job) {
      // Don't await caching, let it happen in background
      redisService.setCache(cacheKey, job.toObject ? job.toObject() : job, 1800);
    }
  }

  if (!job || (job.status !== 'active' && req.user?.role !== 'admin')) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Increment view count
  await Job.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

  // Check if saved and applied
  let isSaved = false;
  let hasApplied = false;
  let application = null;

  if (req.user) {
    const [savedJob, existingApp] = await Promise.all([
      SavedJob.findOne({ user: req.user._id, job: req.params.id }),
      Application.findOne({ applicant: req.user._id, job: req.params.id })
        .select('status createdAt'),
    ]);
    
    isSaved = !!savedJob;
    hasApplied = !!existingApp;
    application = existingApp;
  }

  // Get similar jobs
  const similarJobs = await Job.find({
    _id: { $ne: job._id },
    status: 'active',
    isApproved: true,
    $or: [
      { roleCategory: job.roleCategory },
      { 'requiredSkills.skill': { $in: job.requiredSkills.map(s => s.skill) } },
    ],
  })
    .populate('company', 'name logo')
    .select('title company locations salary jobType createdAt')
    .limit(5);

  res.json({
    success: true,
    data: {
      job,
      isSaved,
      hasApplied,
      application,
      similarJobs,
    },
  });
});

/**
 * @desc    Save/Unsave a job
 * @route   POST /api/jobs/:id/save
 * @access  Private
 */
export const toggleSaveJob = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const jobId = req.params.id;
  const { notes, priority } = req.body;

  const job = await Job.findById(jobId).select('company');
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  const existingSave = await SavedJob.findOne({ user: userId, job: jobId });

  if (existingSave) {
    await SavedJob.findByIdAndDelete(existingSave._id);
    await Job.findByIdAndUpdate(jobId, { $inc: { savedCount: -1 } });
    
    res.json({
      success: true,
      data: { isSaved: false },
      message: 'Job removed from saved',
    });
  } else {
    await SavedJob.create({
      user: userId,
      job: jobId,
      company: job.company,
      notes,
      priority: priority || 'medium',
    });
    await Job.findByIdAndUpdate(jobId, { $inc: { savedCount: 1 } });
    
    res.json({
      success: true,
      data: { isSaved: true },
      message: 'Job saved successfully',
    });
  }
});

/**
 * @desc    Get user's saved jobs
 * @route   GET /api/jobs/saved
 * @access  Private
 */
export const getSavedJobs = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 20, priority, workflowStatus, sortBy = 'createdAt' } = req.query;

  const result = await SavedJob.getUserSavedJobs(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    priority,
    workflowStatus,
    sortBy,
  });

  res.json({
    success: true,
    data: result,
  });
});

/**
 * @desc    Update saved job
 * @route   PUT /api/jobs/saved/:id
 * @access  Private
 */
export const updateSavedJob = asyncHandler(async (req, res) => {
  const savedJob = await SavedJob.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!savedJob) {
    res.status(404);
    throw new Error('Saved job not found');
  }

  res.json({
    success: true,
    data: savedJob,
  });
});

/**
 * @desc    Get jobs by company
 * @route   GET /api/jobs/company/:companyId
 * @access  Public
 */
export const getJobsByCompany = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {
    company: req.params.companyId,
    status: 'active',
    isApproved: true,
  };

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .select('title jobType experienceLevel salary locations createdAt applicationDeadline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Job.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

/**
 * @desc    Get AI job recommendations
 * @route   GET /api/jobs/recommendations
 * @access  Private
 */
export const getJobRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { limit = 10 } = req.query;

  // Get user profile
  const user = await User.findById(userId)
    .select('resumeAnalysis targetRole knownTechnologies placementReadinessScore')
    .lean();

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Extract skills from user
  const userSkills = [
    ...(user.knownTechnologies || []),
    ...(user.resumeAnalysis?.extractedData?.skills || []),
  ];

  // Build query based on user profile
  const query = {
    status: 'active',
    isApproved: true,
    $or: [
      { applicationDeadline: { $gte: new Date() } },
      { applicationDeadline: null },
    ],
  };

  // Match by skills and target role
  if (userSkills.length > 0) {
    query.$or = [
      { 'requiredSkills.skill': { $in: userSkills } },
      { roleCategory: user.targetRole },
    ];
  }

  // For freshers, filter by experience level
  if (user.placementReadinessScore && user.placementReadinessScore < 70) {
    query.experienceLevel = { $in: ['fresher', 'entry'] };
  }

  const jobs = await Job.find(query)
    .populate('company', 'name logo industry ratings')
    .select('title company locations salary jobType experienceLevel requiredSkills createdAt')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean();

  // Calculate match score for each job
  const recommendations = jobs.map(job => {
    const jobSkills = job.requiredSkills.map(s => s.skill.toLowerCase());
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    
    const matchedSkills = jobSkills.filter(s => userSkillsLower.includes(s));
    const skillMatchScore = jobSkills.length > 0 
      ? (matchedSkills.length / jobSkills.length) * 100 
      : 50;
    
    const roleMatch = job.roleCategory === user.targetRole ? 30 : 0;
    const overallScore = Math.min(100, Math.round(skillMatchScore * 0.7 + roleMatch));

    return {
      ...job,
      matchScore: overallScore,
      matchedSkills,
      missingSkills: jobSkills.filter(s => !userSkillsLower.includes(s)),
    };
  });

  // Sort by match score
  recommendations.sort((a, b) => b.matchScore - a.matchScore);

  res.json({
    success: true,
    data: {
      recommendations,
      userProfile: {
        skills: userSkills.slice(0, 10),
        targetRole: user.targetRole,
      },
    },
  });
});

/**
 * @desc    Get trending jobs
 * @route   GET /api/jobs/trending
 * @access  Public
 */
export const getTrendingJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({
    status: 'active',
    isApproved: true,
  })
    .populate('company', 'name logo')
    .select('title company locations salary jobType applicationCount viewCount createdAt')
    .sort({ applicationCount: -1, viewCount: -1 })
    .limit(10);

  res.json({
    success: true,
    data: jobs,
  });
});

/**
 * @desc    Get urgent jobs (deadline soon)
 * @route   GET /api/jobs/urgent
 * @access  Public
 */
export const getUrgentJobs = asyncHandler(async (req, res) => {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const jobs = await Job.find({
    status: 'active',
    isApproved: true,
    applicationDeadline: {
      $gte: new Date(),
      $lte: threeDaysFromNow,
    },
  })
    .populate('company', 'name logo')
    .select('title company locations salary applicationDeadline')
    .sort({ applicationDeadline: 1 })
    .limit(10);

  res.json({
    success: true,
    data: jobs,
  });
});

/**
 * @desc    Get job filters/facets
 * @route   GET /api/jobs/filters
 * @access  Public
 */
export const getJobFilters = asyncHandler(async (req, res) => {
  const [
    locations,
    skills,
    experienceLevels,
    jobTypes,
    workModes,
    departments,
    roleCategories,
  ] = await Promise.all([
    Job.distinct('locations.city', { status: 'active', isApproved: true }),
    Job.distinct('requiredSkills.skill', { status: 'active', isApproved: true }),
    Job.distinct('experienceLevel', { status: 'active', isApproved: true }),
    Job.distinct('jobType', { status: 'active', isApproved: true }),
    Job.distinct('workMode', { status: 'active', isApproved: true }),
    Job.distinct('department', { status: 'active', isApproved: true }),
    Job.distinct('roleCategory', { status: 'active', isApproved: true }),
  ]);

  res.json({
    success: true,
    data: {
      locations: locations.filter(Boolean).slice(0, 50),
      skills: skills.filter(Boolean).slice(0, 100),
      experienceLevels,
      jobTypes,
      workModes,
      departments: departments.filter(Boolean),
      roleCategories: roleCategories.filter(Boolean),
    },
  });
});

// ============ ADMIN ROUTES ============

/**
 * @desc    Create job (admin)
 * @route   POST /api/jobs
 * @access  Admin
 */
export const createJob = asyncHandler(async (req, res) => {
  // Verify company exists
  const company = await Company.findById(req.body.company);
  if (!company) {
    res.status(400);
    throw new Error('Invalid company');
  }

  const job = await Job.create({
    ...req.body,
    postedBy: req.user._id,
    isApproved: true,
    approvedBy: req.user._id,
    approvedAt: new Date(),
  });

  // Update company hiring status
  await Company.findByIdAndUpdate(req.body.company, {
    hiringStatus: 'actively_hiring',
  });

  // Notify followers of company
  const followers = company.followers || [];
  for (const followerId of followers.slice(0, 100)) {
    await Notification.createNotification({
      recipient: followerId,
      type: 'company_new_job',
      title: 'New Job from Company You Follow',
      message: `${company.name} posted a new job: ${job.title}`,
      relatedEntities: { job: job._id, company: company._id },
      actionUrl: `/jobs/${job._id}`,
    });
  }

  res.status(201).json({
    success: true,
    data: job,
  });
});

/**
 * @desc    Update job (admin)
 * @route   PUT /api/jobs/:id
 * @access  Admin
 */
export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  res.json({
    success: true,
    data: job,
  });
});

/**
 * @desc    Delete job (admin)
 * @route   DELETE /api/jobs/:id
 * @access  Admin
 */
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Remove saved jobs
  await SavedJob.deleteMany({ job: req.params.id });

  res.json({
    success: true,
    message: 'Job deleted',
  });
});

/**
 * @desc    Get all jobs (admin view)
 * @route   GET /api/jobs/admin/all
 * @access  Admin
 */
export const getAllJobsAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {};
  if (status) query.status = status;
  if (req.query.isApproved !== undefined) {
    query.isApproved = req.query.isApproved === 'true';
  }

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .populate('company', 'name')
      .populate('postedBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Job.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

/**
 * @desc    Approve/Reject job
 * @route   PUT /api/jobs/:id/approve
 * @access  Admin
 */
export const approveJob = asyncHandler(async (req, res) => {
  const { isApproved } = req.body;

  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  job.isApproved = isApproved;
  if (isApproved) {
    job.approvedBy = req.user._id;
    job.approvedAt = new Date();
  } else {
    job.approvedBy = undefined;
    job.approvedAt = undefined;
  }

  await job.save();

  res.json({
    success: true,
    data: job,
  });
});
