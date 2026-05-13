/**
 * Company Controller
 * Handles all company-related operations
 */

import { asyncHandler } from '../middleware/error.middleware.js';
import Company from '../models/Company.model.js';
import Job from '../models/Job.model.js';
import Notification from '../models/Notification.model.js';

/**
 * @desc    Get all approved companies with filters
 * @route   GET /api/companies
 * @access  Public
 */
export const getCompanies = asyncHandler(async (req, res) => {
  const {
    search,
    industry,
    companyType,
    city,
    hiringStatus,
    page = 1,
    limit = 20,
    sortBy = 'name',
    sortOrder = 'asc',
  } = req.query;

  const query = { status: 'approved' };

  if (search) {
    query.$text = { $search: search };
  }
  if (industry) query.industry = industry;
  if (companyType) query.companyType = companyType;
  if (city) {
    query['headquarters.city'] = { $regex: city, $options: 'i' };
  }
  if (hiringStatus) query.hiringStatus = hiringStatus;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [companies, total] = await Promise.all([
    Company.find(query)
      .select('-followers -reports')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Company.countDocuments(query),
  ]);

  // Get active job count for each company
  const companiesWithJobCount = await Promise.all(
    companies.map(async (company) => {
      const jobCount = await Job.countDocuments({
        company: company._id,
        status: 'active',
        isApproved: true,
      });
      return { ...company, activeJobsCount: jobCount };
    })
  );

  res.json({
    success: true,
    data: {
      companies: companiesWithJobCount,
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
 * @desc    Get company by ID or slug
 * @route   GET /api/companies/:identifier
 * @access  Public
 */
export const getCompanyById = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  
  const query = identifier.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: identifier }
    : { slug: identifier };
    
  query.status = 'approved';

  const company = await Company.findOne(query)
    .select('-followers')
    .lean();

  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  // Increment view count
  await Company.findByIdAndUpdate(company._id, { $inc: { viewCount: 1 } });

  // Get active jobs
  const jobs = await Job.find({
    company: company._id,
    status: 'active',
    isApproved: true,
  })
    .select('title jobType experienceLevel salary locations createdAt')
    .sort({ createdAt: -1 })
    .limit(10);

  // Check if user is following
  let isFollowing = false;
  if (req.user) {
    const companyDoc = await Company.findById(company._id).select('followers');
    isFollowing = companyDoc.followers.includes(req.user._id);
  }

  res.json({
    success: true,
    data: {
      ...company,
      jobs,
      isFollowing,
    },
  });
});

/**
 * @desc    Suggest a company (by student)
 * @route   POST /api/companies/suggest
 * @access  Private
 */
export const suggestCompany = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { name, industry, website, description, location } = req.body;

  if (!name || !industry) {
    res.status(400);
    throw new Error('Company name and industry are required');
  }

  // Check if company already exists
  const existing = await Company.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
  });

  if (existing) {
    res.status(400);
    throw new Error('A company with this name already exists');
  }

  const company = await Company.create({
    name,
    industry,
    website,
    description,
    headquarters: location ? { city: location } : undefined,
    addedBy: userId,
    addedByType: 'student_suggestion',
    status: 'pending',
  });

  res.status(201).json({
    success: true,
    message: 'Company suggestion submitted for review',
    data: { companyId: company._id },
  });
});

/**
 * @desc    Follow/Unfollow a company
 * @route   POST /api/companies/:id/follow
 * @access  Private
 */
export const toggleFollowCompany = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const companyId = req.params.id;

  const company = await Company.findById(companyId);
  if (!company || company.status !== 'approved') {
    res.status(404);
    throw new Error('Company not found');
  }

  const isFollowing = company.followers.includes(userId);

  if (isFollowing) {
    await company.removeFollower(userId);
  } else {
    await company.addFollower(userId);
    
    // Create notification for company follow
    await Notification.createNotification({
      recipient: company.addedBy,
      sender: userId,
      type: 'company_followed',
      title: 'New Follower',
      message: `${req.user.fullName} is now following ${company.name}`,
      relatedEntities: { company: companyId },
      actionUrl: `/companies/${company.slug}`,
    });
  }

  res.json({
    success: true,
    data: {
      isFollowing: !isFollowing,
      followerCount: company.followerCount,
    },
  });
});

/**
 * @desc    Get followed companies
 * @route   GET /api/companies/following
 * @access  Private
 */
export const getFollowedCompanies = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [companies, total] = await Promise.all([
    Company.find({
      followers: userId,
      status: 'approved',
    })
      .select('name logo industry headquarters followerCount')
      .skip(skip)
      .limit(parseInt(limit)),
    Company.countDocuments({ followers: userId, status: 'approved' }),
  ]);

  res.json({
    success: true,
    data: {
      companies,
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
 * @desc    Get featured companies
 * @route   GET /api/companies/featured
 * @access  Public
 */
export const getFeaturedCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find({
    status: 'approved',
    isFeatured: true,
    $or: [
      { featuredUntil: { $gte: new Date() } },
      { featuredUntil: null },
    ],
  })
    .select('name logo industry tagline ratings followerCount')
    .sort({ followerCount: -1 })
    .limit(10);

  res.json({
    success: true,
    data: companies,
  });
});

/**
 * @desc    Get hiring companies (actively hiring)
 * @route   GET /api/companies/hiring
 * @access  Public
 */
export const getHiringCompanies = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [companies, total] = await Promise.all([
    Company.find({
      status: 'approved',
      hiringStatus: 'actively_hiring',
    })
      .select('name logo industry tagline headquarters techStack')
      .sort({ viewCount: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Company.countDocuments({
      status: 'approved',
      hiringStatus: 'actively_hiring',
    }),
  ]);

  res.json({
    success: true,
    data: {
      companies,
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
 * @desc    Get company industries (for filters)
 * @route   GET /api/companies/industries
 * @access  Public
 */
export const getIndustries = asyncHandler(async (req, res) => {
  const industries = await Company.distinct('industry', { status: 'approved' });
  
  res.json({
    success: true,
    data: industries,
  });
});

// ============ ADMIN ROUTES ============

/**
 * @desc    Create company (admin)
 * @route   POST /api/companies
 * @access  Admin
 */
export const createCompany = asyncHandler(async (req, res) => {
  const company = await Company.create({
    ...req.body,
    addedBy: req.user._id,
    addedByType: 'admin',
    status: 'approved',
    approvedBy: req.user._id,
    approvedAt: new Date(),
  });

  res.status(201).json({
    success: true,
    data: company,
  });
});

/**
 * @desc    Update company (admin)
 * @route   PUT /api/companies/:id
 * @access  Admin
 */
export const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  res.json({
    success: true,
    data: company,
  });
});

/**
 * @desc    Delete company (admin)
 * @route   DELETE /api/companies/:id
 * @access  Admin
 */
export const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndDelete(req.params.id);

  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  // Also delete related jobs
  await Job.deleteMany({ company: req.params.id });

  res.json({
    success: true,
    message: 'Company and related jobs deleted',
  });
});

/**
 * @desc    Get pending company suggestions (admin)
 * @route   GET /api/companies/admin/pending
 * @access  Admin
 */
export const getPendingCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find({ status: 'pending' })
    .populate('addedBy', 'fullName email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: companies,
  });
});

/**
 * @desc    Approve company suggestion (admin)
 * @route   PUT /api/companies/:id/approve
 * @access  Admin
 */
export const approveCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(
    req.params.id,
    {
      status: 'approved',
      approvedBy: req.user._id,
      approvedAt: new Date(),
    },
    { new: true }
  );

  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  // Notify the student who suggested
  if (company.addedBy && company.addedByType === 'student_suggestion') {
    await Notification.createNotification({
      recipient: company.addedBy,
      type: 'system_announcement',
      title: 'Company Approved',
      message: `Your company suggestion "${company.name}" has been approved!`,
      relatedEntities: { company: company._id },
      actionUrl: `/companies/${company.slug}`,
    });
  }

  res.json({
    success: true,
    message: 'Company approved',
    data: company,
  });
});

/**
 * @desc    Reject company suggestion (admin)
 * @route   PUT /api/companies/:id/reject
 * @access  Admin
 */
export const rejectCompany = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const company = await Company.findByIdAndUpdate(
    req.params.id,
    {
      status: 'rejected',
      rejectionReason: reason,
    },
    { new: true }
  );

  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  // Notify the student
  if (company.addedBy && company.addedByType === 'student_suggestion') {
    await Notification.createNotification({
      recipient: company.addedBy,
      type: 'system_announcement',
      title: 'Company Suggestion Not Approved',
      message: `Your company suggestion "${company.name}" was not approved. ${reason ? `Reason: ${reason}` : ''}`,
    });
  }

  res.json({
    success: true,
    message: 'Company rejected',
  });
});
