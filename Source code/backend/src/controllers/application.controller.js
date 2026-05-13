/**
 * Application Controller
 * Handles job application operations
 */

import { asyncHandler } from '../middleware/error.middleware.js';
import Application from '../models/Application.model.js';
import Job from '../models/Job.model.js';
import Company from '../models/Company.model.js';
import User from '../models/User.model.js';
import Notification from '../models/Notification.model.js';

/**
 * @desc    Apply for a job
 * @route   POST /api/applications
 * @access  Private
 */
export const applyForJob = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { jobId, coverLetter, answers } = req.body;

  // Check if job exists and is active
  const job = await Job.findById(jobId);
  if (!job || job.status !== 'active') {
    res.status(404);
    throw new Error('Job not found or not accepting applications');
  }

  // Check deadline
  if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
    res.status(400);
    throw new Error('Application deadline has passed');
  }

  // Check if already applied
  const existingApp = await Application.findOne({ applicant: userId, job: jobId });
  if (existingApp) {
    res.status(400);
    throw new Error('You have already applied for this job');
  }

  // Get user details for match score calculation
  const user = await User.findById(userId)
    .select('resumeAnalysis resumeUrl knownTechnologies targetRole')
    .lean();

  // Calculate match score
  const jobSkills = job.requiredSkills.map(s => s.skill.toLowerCase());
  const userSkills = [
    ...(user.knownTechnologies || []),
    ...(user.resumeAnalysis?.extractedData?.skills || []),
  ].map(s => s.toLowerCase());

  const matchedSkills = jobSkills.filter(s => userSkills.some(us => us.includes(s) || s.includes(us)));
  const skillScore = jobSkills.length > 0 
    ? Math.round((matchedSkills.length / jobSkills.length) * 100)
    : 50;

  // Education match (simplified)
  const educationScore = user.resumeAnalysis?.extractedData?.education ? 70 : 50;

  // Overall match score
  const overallScore = Math.round(skillScore * 0.6 + educationScore * 0.4);

  const application = await Application.create({
    applicant: userId,
    job: jobId,
    company: job.company,
    coverLetter,
    answers,
    resumeUrl: user.resumeUrl || null,
    matchScore: {
      overall: overallScore,
      skillMatch: skillScore,
      experienceMatch: 50,
      educationMatch: educationScore,
    },
    source: 'platform',
    statusHistory: [{
      status: 'applied',
      changedBy: userId,
      note: 'Application submitted',
    }],
  });

  // Update job application count
  await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

  // Create notification for applicant
  await Notification.createNotification({
    recipient: userId,
    type: 'application_submitted',
    title: 'Application Submitted',
    message: `Your application for ${job.title} has been submitted successfully`,
    relatedEntities: { application: application._id, job: jobId },
    actionUrl: `/applications/${application._id}`,
  });

  res.status(201).json({
    success: true,
    data: application,
    message: 'Application submitted successfully',
  });
});

/**
 * @desc    Get user's applications
 * @route   GET /api/applications
 * @access  Private
 */
export const getUserApplications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { status, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = { applicant: userId };
  if (status) query.status = status;

  const [applications, total] = await Promise.all([
    Application.find(query)
      .populate('job', 'title jobType locations salary applicationDeadline')
      .populate('company', 'name logo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Application.countDocuments(query),
  ]);

  // Get stats
  const stats = await Application.getUserStats(userId);

  res.json({
    success: true,
    data: {
      applications,
      stats,
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
 * @desc    Get single application
 * @route   GET /api/applications/:id
 * @access  Private
 */
export const getApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('job', 'title company jobType locations salary description requiredSkills applicationDeadline hiringProcess')
    .populate('company', 'name logo industry description website')
    .populate({
      path: 'statusHistory.changedBy',
      select: 'fullName',
    });

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // Check ownership
  if (application.applicant.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this application');
  }

  res.json({
    success: true,
    data: application,
  });
});

/**
 * @desc    Withdraw application
 * @route   PUT /api/applications/:id/withdraw
 * @access  Private
 */
export const withdrawApplication = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.id,
    applicant: req.user._id,
  });

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // Can only withdraw if in early stages
  const withdrawableStatuses = ['applied', 'viewed', 'under_review', 'shortlisted'];
  if (!withdrawableStatuses.includes(application.status)) {
    res.status(400);
    throw new Error('Cannot withdraw application at this stage');
  }

  application.status = 'withdrawn';
  application.statusHistory.push({
    status: 'withdrawn',
    changedBy: req.user._id,
    note: req.body.reason || 'Applicant withdrew application',
  });
  application.withdrawnAt = new Date();

  await application.save();

  // Update job application count
  await Job.findByIdAndUpdate(application.job, { $inc: { applicationCount: -1 } });

  res.json({
    success: true,
    data: application,
    message: 'Application withdrawn',
  });
});

/**
 * @desc    Get application stats for user
 * @route   GET /api/applications/stats
 * @access  Private
 */
export const getApplicationStats = asyncHandler(async (req, res) => {
  const stats = await Application.getUserStats(req.user._id);

  // Recent activity
  const recentActivity = await Application.find({ applicant: req.user._id })
    .populate('job', 'title')
    .populate('company', 'name')
    .select('job company status updatedAt')
    .sort({ updatedAt: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      stats,
      recentActivity,
    },
  });
});

// ============ ADMIN ROUTES ============

/**
 * @desc    Get applications for a company (admin)
 * @route   GET /api/applications/company/:companyId
 * @access  Admin
 */
export const getCompanyApplications = asyncHandler(async (req, res) => {
  const { status, jobId, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = { company: req.params.companyId };
  if (status) query.status = status;
  if (jobId) query.job = jobId;

  const [applications, total] = await Promise.all([
    Application.find(query)
      .populate('applicant', 'fullName email phone resumeUrl')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Application.countDocuments(query),
  ]);

  const stats = await Application.getCompanyStats(req.params.companyId);

  res.json({
    success: true,
    data: {
      applications,
      stats,
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
 * @desc    Update application status (admin)
 * @route   PUT /api/applications/:id/status
 * @access  Admin
 */
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  
  const application = await Application.findById(req.params.id)
    .populate('job', 'title')
    .populate('company', 'name');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  const oldStatus = application.status;
  application.status = status;
  application.statusHistory.push({
    status,
    changedBy: req.user._id,
    note,
  });

  await application.save();

  // Send notification to applicant
  const notificationTypes = {
    viewed: 'application_viewed',
    shortlisted: 'application_shortlisted',
    interview_scheduled: 'interview_scheduled',
    rejected: 'application_rejected',
    offer_extended: 'offer_received',
  };

  const notificationType = notificationTypes[status] || 'application_status_changed';
  
  await Notification.createNotification({
    recipient: application.applicant,
    sender: req.user._id,
    type: notificationType,
    title: 'Application Update',
    message: `Your application for ${application.job.title} at ${application.company.name} has been updated to: ${status.replace(/_/g, ' ')}`,
    relatedEntities: { application: application._id, job: application.job._id },
    actionUrl: `/applications/${application._id}`,
    priority: status === 'shortlisted' || status === 'offer_extended' ? 'high' : 'normal',
  });

  res.json({
    success: true,
    data: application,
  });
});

/**
 * @desc    Add interview to application (admin)
 * @route   POST /api/applications/:id/interview
 * @access  Admin
 */
export const addInterview = asyncHandler(async (req, res) => {
  const { round, date, type, interviewers, meetingLink, notes } = req.body;

  const application = await Application.findById(req.params.id)
    .populate('job', 'title')
    .populate('company', 'name');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  application.interviews.push({
    round,
    date,
    type,
    interviewers,
    meetingLink,
    notes,
    status: 'scheduled',
  });

  application.status = 'interview_scheduled';
  application.statusHistory.push({
    status: 'interview_scheduled',
    changedBy: req.user._id,
    note: `Interview ${round} scheduled for ${new Date(date).toLocaleDateString()}`,
  });

  await application.save();

  // Notify applicant
  await Notification.createNotification({
    recipient: application.applicant,
    sender: req.user._id,
    type: 'interview_scheduled',
    title: 'Interview Scheduled',
    message: `Your interview for ${application.job.title} at ${application.company.name} is scheduled for ${new Date(date).toLocaleDateString()}`,
    relatedEntities: { application: application._id },
    actionUrl: `/applications/${application._id}`,
    priority: 'high',
  });

  res.json({
    success: true,
    data: application,
  });
});

/**
 * @desc    Update interview result (admin)
 * @route   PUT /api/applications/:id/interview/:interviewId
 * @access  Admin
 */
export const updateInterview = asyncHandler(async (req, res) => {
  const { status, feedback, score } = req.body;

  const application = await Application.findById(req.params.id);
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  const interview = application.interviews.id(req.params.interviewId);
  if (!interview) {
    res.status(404);
    throw new Error('Interview not found');
  }

  interview.status = status;
  interview.feedback = feedback;
  interview.score = score;

  await application.save();

  res.json({
    success: true,
    data: application,
  });
});

/**
 * @desc    Add recruiter note (admin)
 * @route   POST /api/applications/:id/notes
 * @access  Admin
 */
export const addRecruiterNote = asyncHandler(async (req, res) => {
  const { note } = req.body;

  const application = await Application.findById(req.params.id);
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  application.recruiterNotes.push({
    note,
    addedBy: req.user._id,
    addedAt: new Date(),
  });

  await application.save();

  res.json({
    success: true,
    data: application,
  });
});

/**
 * @desc    Extend offer (admin)
 * @route   POST /api/applications/:id/offer
 * @access  Admin
 */
export const extendOffer = asyncHandler(async (req, res) => {
  const { salary, joiningDate, position, benefits, expiryDate } = req.body;

  const application = await Application.findById(req.params.id)
    .populate('job', 'title')
    .populate('company', 'name');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  application.offer = {
    salary,
    joiningDate,
    position,
    benefits,
    expiryDate,
    extendedAt: new Date(),
  };

  application.status = 'offer_extended';
  application.offerDate = new Date();
  application.statusHistory.push({
    status: 'offer_extended',
    changedBy: req.user._id,
    note: `Offer extended for ${position} position`,
  });

  await application.save();

  // Notify applicant
  await Notification.createNotification({
    recipient: application.applicant,
    sender: req.user._id,
    type: 'offer_received',
    title: 'Congratulations! You have an offer',
    message: `${application.company.name} has extended an offer for ${position}`,
    relatedEntities: { application: application._id },
    actionUrl: `/applications/${application._id}`,
    priority: 'high',
  });

  res.json({
    success: true,
    data: application,
  });
});
