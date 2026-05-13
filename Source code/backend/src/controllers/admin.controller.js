import User from '../models/User.model.js';
import TestSession from '../models/TestSession.model.js';
import Notification from '../models/Notification.model.js';
import AuditLog from '../models/AuditLog.model.js';
import { runSeeder } from '../utils/seeder.js';

// @desc    Seed system data (Companies, Jobs)
// @route   POST /api/admin/seed
// @access  Private/Admin
export const seedSystemData = async (req, res) => {
  try {
    const results = await runSeeder();
    res.json({
      success: true,
      message: 'System data seeded successfully',
      data: results
    });
  } catch (error) {
    console.error('Seed system data error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ accountStatus: 'active' });
    const blockedUsers = await User.countDocuments({ accountStatus: 'suspended' });
    const pendingUsers = await User.countDocuments({ accountStatus: 'pending_verification' });
    const adminUsers = await User.countDocuments({ role: { $in: ['admin', 'superadmin'] } });
    const onboardedUsers = await User.countDocuments({ isOnboarded: true });
    const assessmentCompleted = await User.countDocuments({ isAssessmentComplete: true });
    
    // Get test session stats
    const totalTests = await TestSession.countDocuments();
    const completedTests = await TestSession.countDocuments({ status: 'completed' });
    const activeTests = await TestSession.countDocuments({ status: 'in_progress' });
    
    // Get today's registrations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRegistrations = await User.countDocuments({ createdAt: { $gte: today } });
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekRegistrations = await User.countDocuments({ createdAt: { $gte: weekAgo } });
    
    // Get students active in last 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeStudents24h = await User.countDocuments({ 
      lastActivityAt: { $gte: twentyFourHoursAgo },
      role: 'student'
    });
    
    // Get average placement readiness score
    const users = await User.find({ placementReadinessScore: { $exists: true, $gt: 0 } });
    const avgScore = users.length > 0 
      ? Math.round(users.reduce((sum, u) => sum + (u.placementReadinessScore || 0), 0) / users.length)
      : 0;

    // Get proctoring violation stats
    const testsWithViolations = await TestSession.find({ 'proctoringViolations.0': { $exists: true } });
    const totalViolations = testsWithViolations.reduce((sum, t) => sum + (t.proctoringViolations?.length || 0), 0);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        blocked: blockedUsers,
        pending: pendingUsers,
        admins: adminUsers,
        onboarded: onboardedUsers,
        assessmentCompleted,
        todayRegistrations,
        weekRegistrations,
        active24h: activeStudents24h,
      },
      tests: {
        total: totalTests,
        completed: completedTests,
        active: activeTests,
      },
      performance: {
        avgPlacementScore: avgScore,
        totalViolations,
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all users with advanced filtering
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const accountStatus = req.query.status;
    const role = req.query.role;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { collegeName: { $regex: search, $options: 'i' } },
      ];
    }
    if (accountStatus) filter.accountStatus = accountStatus;
    if (role) filter.role = role;

    const users = await User.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .select('-password');

    const total = await User.countDocuments(filter);

    res.json({
      users: users.map(u => ({
        id: u._id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        college: u.collegeName,
        degree: u.degree,
        targetRole: u.targetRole,
        status: u.accountStatus || 'active',
        role: u.role || 'student',
        placementReadinessScore: u.placementReadinessScore || 0,
        isOnboarded: u.isOnboarded,
        isAssessmentComplete: u.isAssessmentComplete,
        createdAt: u.createdAt,
        lastActive: u.lastActive || u.updatedAt,
      })),
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

// @desc    Get user details by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's test sessions
    const testSessions = await TestSession.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        collegeName: user.collegeName,
        degree: user.degree,
        fieldOfStudy: user.fieldOfStudy,
        yearOfStudy: user.yearOfStudy,
        cgpa: user.cgpa,
        targetRole: user.targetRole,
        knownTechnologies: user.knownTechnologies,
        skillRatings: user.skillRatings,
        placementTimeline: user.placementTimeline,
        expectedCtc: user.expectedCtc,
        preferredCompanies: user.preferredCompanies,
        linkedin: user.linkedin,
        github: user.github,
        resumeUrl: user.resumeUrl,
        status: user.accountStatus || 'active',
        role: user.role || 'student',
        isOnboarded: user.isOnboarded,
        isAssessmentComplete: user.isAssessmentComplete,
        placementReadinessScore: user.placementReadinessScore,
        atsScore: user.atsScore,
        skillGaps: user.skillGaps,
        strengths: user.strengths,
        weaknesses: user.weaknesses,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastActive: user.lastActive,
      },
      testSessions: testSessions.map(t => ({
        id: t._id,
        testType: t.testType,
        field: t.field,
        status: t.status,
        totalScore: t.totalScore,
        violationsCount: t.proctoringViolations?.length || 0,
        startTime: t.startTime,
        endTime: t.endTime,
      })),
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update user (admin can update any field)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent changing own role if not super admin
    if (req.params.id === req.user.id && req.body.role && req.body.role !== user.role) {
      return res.status(403).json({ message: 'Cannot change your own role' });
    }

    // Admin can update these fields
    const updatableFields = [
      'fullName', 'email', 'phone', 'accountStatus', 'role',
      'collegeName', 'degree', 'fieldOfStudy', 'yearOfStudy', 'cgpa',
      'targetRole', 'knownTechnologies', 'skillRatings',
      'placementTimeline', 'expectedCtc', 'preferredCompanies',
      'isOnboarded', 'isAssessmentComplete',
      'placementReadinessScore', 'atsScore', 'skillGaps', 'strengths', 'weaknesses'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    const updatedUser = await user.save();
    res.json({ 
      message: 'User updated successfully',
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        status: updatedUser.accountStatus,
        role: updatedUser.role,
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-deletion
    if (req.params.id === req.user.id) {
      return res.status(403).json({ message: 'Cannot delete your own account' });
    }

    // Delete associated test sessions
    await TestSession.deleteMany({ userId: req.params.id });
    
    await user.deleteOne();
    res.json({ message: 'User and associated data deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Block/Unblock user
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const toggleUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'suspended', 'pending_verification', 'deactivated'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent blocking yourself
    if (req.params.id === req.user.id && status === 'suspended') {
      return res.status(403).json({ message: 'Cannot suspend your own account' });
    }

    user.accountStatus = status;
    await user.save();

    res.json({ 
      message: `User status changed to ${status} successfully`,
      user: { id: user._id, status: user.accountStatus }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Change user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['student', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent changing own role
    if (req.params.id === req.user.id) {
      return res.status(403).json({ message: 'Cannot change your own role' });
    }

    user.role = role;
    await user.save();

    res.json({ 
      message: `User role changed to ${role} successfully`,
      user: { id: user._id, role: user.role }
    });
  } catch (error) {
    console.error('Change user role error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all test sessions (proctoring logs)
// @route   GET /api/admin/tests
// @access  Private/Admin
export const getAllTestSessions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const hasViolations = req.query.hasViolations === 'true';

    const filter = {};
    if (status) filter.status = status;
    if (hasViolations) {
      filter['proctoringViolations.0'] = { $exists: true };
    }

    const tests = await TestSession.find(filter)
      .populate('userId', 'fullName email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await TestSession.countDocuments(filter);

    res.json({
      tests: tests.map(t => ({
        id: t._id,
        user: t.userId ? {
          id: t.userId._id,
          name: t.userId.fullName,
          email: t.userId.email,
        } : null,
        testType: t.testType,
        field: t.field,
        status: t.status,
        totalScore: t.totalScore,
        violations: t.proctoringViolations || [],
        violationsCount: t.proctoringViolations?.length || 0,
        startTime: t.startTime,
        endTime: t.endTime,
        createdAt: t.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all test sessions error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get proctoring violations
// @route   GET /api/admin/proctoring
// @access  Private/Admin
export const getProctoringLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const severity = req.query.severity;

    // Find tests with violations
    const tests = await TestSession.find({ 'proctoringViolations.0': { $exists: true } })
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 });

    // Flatten violations with test and user info
    let violations = [];
    tests.forEach(test => {
      (test.proctoringViolations || []).forEach(v => {
        violations.push({
          id: v._id,
          testId: test._id,
          user: test.userId ? {
            id: test.userId._id,
            name: test.userId.fullName,
            email: test.userId.email,
          } : null,
          testField: test.field,
          type: v.type,
          description: v.description,
          severity: v.severity,
          timestamp: v.timestamp,
        });
      });
    });

    // Filter by severity if provided
    if (severity) {
      violations = violations.filter(v => v.severity === severity);
    }

    // Sort by timestamp desc
    violations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Paginate
    const total = violations.length;
    const paginatedViolations = violations.slice(skip, skip + limit);

    res.json({
      violations: paginatedViolations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get proctoring logs error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Bulk action on users
// @route   POST /api/admin/users/bulk
// @access  Private/Admin
export const bulkUserAction = async (req, res) => {
  try {
    const { userIds, action, value } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs are required' });
    }

    if (!['block', 'unblock', 'delete', 'changeRole'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    // Remove current admin from the list
    const filteredIds = userIds.filter(id => id !== req.user.id);

    let result;
    switch (action) {
      case 'block':
        result = await User.updateMany(
          { _id: { $in: filteredIds } },
          { accountStatus: 'suspended' }
        );
        break;
      case 'unblock':
        result = await User.updateMany(
          { _id: { $in: filteredIds } },
          { accountStatus: 'active' }
        );
        break;
      case 'delete':
        await TestSession.deleteMany({ userId: { $in: filteredIds } });
        result = await User.deleteMany({ _id: { $in: filteredIds } });
        break;
      case 'changeRole':
        if (!value || !['student', 'admin', 'superadmin'].includes(value)) {
          return res.status(400).json({ message: 'Invalid role value' });
        }
        result = await User.updateMany(
          { _id: { $in: filteredIds } },
          { role: value }
        );
        break;
    }

    res.json({ 
      message: `Bulk ${action} completed successfully`,
      affectedCount: result.modifiedCount || result.deletedCount || 0
    });
  } catch (error) {
    console.error('Bulk user action error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Export users data
// @route   GET /api/admin/users/export
// @access  Private/Admin
export const exportUsers = async (req, res) => {
  try {
    const format = req.query.format || 'json';
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const userData = users.map(u => ({
      id: u._id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      college: u.collegeName,
      degree: u.degree,
      targetRole: u.targetRole,
      status: u.accountStatus || 'active',
      role: u.role || 'student',
      placementReadinessScore: u.placementReadinessScore || 0,
      isOnboarded: u.isOnboarded,
      isAssessmentComplete: u.isAssessmentComplete,
      createdAt: u.createdAt,
    }));

    if (format === 'csv') {
      const headers = Object.keys(userData[0] || {}).join(',');
      const rows = userData.map(u => Object.values(u).join(','));
      const csv = [headers, ...rows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
      return res.send(csv);
    }

    res.json({ users: userData });
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Send announcement to all users
// @route   POST /api/admin/announcements
// @access  Private/Admin
export const sendAnnouncement = async (req, res) => {
  try {
    const { title, message, priority, targetRole } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }
    
    // Find users
    const filter = {};
    if (targetRole && targetRole !== 'all') filter.role = targetRole;
    
    const users = await User.find(filter).select('_id');
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found for the given criteria' });
    }

    const notifications = users.map(user => ({
      recipient: user._id,
      type: 'system_announcement',
      title,
      message,
      priority: priority || 'normal',
      category: 'system'
    }));
    
    await Notification.insertMany(notifications);
    
    res.json({ 
      success: true, 
      message: `Announcement sent to ${users.length} users successfully` 
    });
  } catch (error) {
    console.error('Send announcement error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Get system audit logs
 * @route   GET /api/admin/audit-logs
 * @access  Private/Admin
 */
export const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const action = req.query.action;
    const userId = req.query.userId;

    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.userId = userId;

    const logs = await AuditLog.find(filter)
      .populate('userId', 'fullName email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await AuditLog.countDocuments(filter);

    res.json({
      logs: logs.map(l => ({
        id: l._id,
        user: l.userId ? {
          id: l.userId._id,
          name: l.userId.fullName,
          email: l.userId.email,
        } : null,
        action: l.action,
        description: l.description,
        metadata: l.metadata,
        ipAddress: l.ipAddress,
        createdAt: l.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
