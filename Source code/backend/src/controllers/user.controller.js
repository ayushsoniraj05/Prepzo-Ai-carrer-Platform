import User from '../models/User.model.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fields that can be updated
    const updatableFields = [
      'fullName',
      'phone',
      'dateOfBirth',
      'gender',
      'collegeName',
      'degree',
      'fieldOfStudy',
      'yearOfStudy',
      'cgpa',
      'targetRole',
      'knownTechnologies',
      'skillRatings',
      'linkedin',
      'github',
      'resumeUrl',
      'placementTimeline',
      'expectedCtc',
      'preferredCompanies',
    ];

    // Update only provided fields
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    const updatedUser = await user.save();
    res.json({ user: updatedUser.toJSON() });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Complete onboarding
// @route   PUT /api/users/onboarding
// @access  Private
export const completeOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      collegeName,
      degree,
      fieldOfStudy,
      yearOfStudy,
      cgpa,
      targetRole,
      skillRatings,
      placementTimeline,
      expectedCtc,
      preferredCompanies,
    } = req.body;

    // Update education data if provided
    user.collegeName = collegeName || user.collegeName || 'Not specified';
    user.degree = degree || user.degree || 'Not specified';
    user.fieldOfStudy = fieldOfStudy || user.fieldOfStudy || 'Not specified';
    user.yearOfStudy = yearOfStudy || user.yearOfStudy || 'Not specified';

    // Update onboarding data
    if (cgpa !== undefined) user.cgpa = cgpa;
    user.targetRole = targetRole || user.targetRole || 'Software Engineer';
    if (skillRatings !== undefined) user.skillRatings = skillRatings;
    if (placementTimeline !== undefined) user.placementTimeline = placementTimeline;
    if (expectedCtc !== undefined) user.expectedCtc = expectedCtc;
    if (preferredCompanies !== undefined) user.preferredCompanies = preferredCompanies;

    // Mark as onboarded
    user.isOnboarded = true;

    // Set initial assessment scores (placeholder - would be calculated based on actual assessment)
    user.placementReadinessScore = 45;
    user.skillGaps = ['System Design', 'DSA', 'Cloud'];
    user.strengths = ['Frontend'];
    user.weaknesses = ['Backend'];

    const updatedUser = await user.save();
    res.json({ user: updatedUser.toJSON() });
  } catch (error) {
    console.error('Complete onboarding error details:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
      payload: req.body
    });
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: Object.values(error.errors).map(err => err.message) 
      });
    }

    res.status(500).json({ message: error.message || 'Server error during onboarding' });
  }
};

// @desc    Complete assessment (update scores)
// @route   PUT /api/users/assessment
// @access  Private
export const completeAssessment = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      placementReadinessScore,
      atsScore,
      skillGaps,
      strengths,
      weaknesses,
      isFieldTestComplete,
      isSkillTestComplete,
      isAssessmentComplete,
      fieldAssessmentResults,
      skillAssessmentResults,
      lastAssessmentAt
    } = req.body;

    // Update assessment status flags
    if (isFieldTestComplete !== undefined) user.isFieldTestComplete = isFieldTestComplete;
    if (isSkillTestComplete !== undefined) user.isSkillTestComplete = isSkillTestComplete;
    if (isAssessmentComplete !== undefined) user.isAssessmentComplete = isAssessmentComplete;
    if (lastAssessmentAt !== undefined) user.lastAssessmentAt = lastAssessmentAt;

    // Update detailed results if provided
    if (fieldAssessmentResults !== undefined) user.fieldAssessmentResults = fieldAssessmentResults;
    if (skillAssessmentResults !== undefined) user.skillAssessmentResults = skillAssessmentResults;

    // Update standard metrics
    if (placementReadinessScore !== undefined) user.placementReadinessScore = placementReadinessScore;
    if (atsScore !== undefined) user.atsScore = atsScore;
    if (skillGaps !== undefined) user.skillGaps = skillGaps;
    if (strengths !== undefined) user.strengths = strengths;
    if (weaknesses !== undefined) user.weaknesses = weaknesses;

    const updatedUser = await user.save();
    res.json({ user: updatedUser.toJSON() });
  } catch (error) {
    console.error('Complete assessment error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.json({
      users: users.map(u => u.toJSON()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get user by ID (admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
