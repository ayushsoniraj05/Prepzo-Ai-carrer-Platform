/**
 * Admin Proctoring Controller
 * Admin endpoints for monitoring tests, violations, and proctoring data
 */

import TestSession from '../models/TestSession.model.js';
import TestResult from '../models/TestResult.model.js';
import ProctoringSession from '../models/ProctoringSession.model.js';
import User from '../models/User.model.js';
import mongoose from 'mongoose';

// =====================================================
// LIVE TEST MONITORING
// =====================================================

// @desc    Get all currently active test sessions
// @route   GET /api/admin/proctoring/live
// @access  Private/Admin
export const getLiveTests = async (req, res) => {
  try {
    const activeSessions = await TestSession.find({ status: 'in_progress' })
      .populate('userId', 'fullName email collegeName')
      .sort({ startTime: -1 });

    const liveTests = await Promise.all(activeSessions.map(async (session) => {
      const proctoring = await ProctoringSession.findOne({ testSession: session._id });
      
      // Calculate elapsed time
      const elapsedSeconds = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000);
      const remainingSeconds = Math.max(0, (session.totalDuration || 3600) - elapsedSeconds);
      
      return {
        sessionId: session._id,
        testId: session.testId,
        testType: session.testType,
        company: session.company,
        student: {
          id: session.userId?._id,
          name: session.userId?.fullName || 'Unknown',
          email: session.userId?.email,
          college: session.userId?.collegeName
        },
        startTime: session.startTime,
        elapsedTime: elapsedSeconds,
        remainingTime: remainingSeconds,
        totalDuration: session.totalDuration,
        questionsAnswered: session.sections?.reduce((sum, s) => sum + (s.questionsAttempted || 0), 0) || 0,
        totalQuestions: session.totalQuestions,
        violations: {
          total: session.violations?.length || 0,
          warnings: session.violations?.filter(v => v.severity === 'warning').length || 0,
          critical: session.violations?.filter(v => v.severity === 'critical').length || 0,
          latest: session.violations?.slice(-3) || []
        },
        proctoring: {
          enabled: session.isProctoringEnabled,
          status: proctoring?.status || 'unknown',
          cameraEnabled: session.proctoringData?.cameraEnabled || false,
          fullscreenEnabled: session.proctoringData?.fullscreenEnabled || false
        },
        aiGenerated: session.aiGenerated || false
      };
    }));

    res.json({
      success: true,
      data: {
        activeSessions: liveTests.length,
        tests: liveTests
      }
    });
  } catch (error) {
    console.error('Get live tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching live tests',
      error: error.message
    });
  }
};

// @desc    Get live updates for a specific session (WebSocket fallback)
// @route   GET /api/admin/proctoring/live/:sessionId
// @access  Private/Admin
export const getLiveSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await TestSession.findById(sessionId)
      .populate('userId', 'fullName email collegeName phone');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const proctoring = await ProctoringSession.findOne({ testSession: sessionId });

    const elapsedSeconds = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000);

    res.json({
      success: true,
      data: {
        session: {
          id: session._id,
          status: session.status,
          testType: session.testType,
          company: session.company,
          field: session.field,
          targetRole: session.targetRole,
          startTime: session.startTime,
          elapsedTime: elapsedSeconds,
          totalDuration: session.totalDuration,
          totalQuestions: session.totalQuestions,
          aiGenerated: session.aiGenerated
        },
        student: {
          id: session.userId?._id,
          name: session.userId?.fullName,
          email: session.userId?.email,
          college: session.userId?.collegeName,
          phone: session.userId?.phone
        },
        progress: {
          sections: session.sections?.map(s => ({
            id: s.sectionId,
            name: s.sectionName,
            attempted: s.questionsAttempted || 0,
            correct: s.correctAnswers || 0,
            timeTaken: s.timeTaken || 0
          })) || [],
          totalAttempted: session.sections?.reduce((sum, s) => sum + (s.questionsAttempted || 0), 0) || 0
        },
        violations: {
          total: session.violations?.length || 0,
          list: session.violations || []
        },
        proctoring: {
          enabled: session.isProctoringEnabled,
          status: proctoring?.status || 'unknown',
          proctoringData: session.proctoringData,
          trustScore: proctoring?.trustScore
        }
      }
    });
  } catch (error) {
    console.error('Get live session details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching session details',
      error: error.message
    });
  }
};

// =====================================================
// VIOLATION MANAGEMENT
// =====================================================

// @desc    Get all violations across all tests with filtering
// @route   GET /api/admin/proctoring/violations
// @access  Private/Admin
export const getAllViolations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      violationType,
      severity,
      startDate,
      endDate,
      userId
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build aggregation pipeline
    const matchStage = { 'violations.0': { $exists: true } };
    
    if (userId) {
      matchStage.userId = new mongoose.Types.ObjectId(userId);
    }
    if (startDate || endDate) {
      matchStage.startTime = {};
      if (startDate) matchStage.startTime.$gte = new Date(startDate);
      if (endDate) matchStage.startTime.$lte = new Date(endDate);
    }

    const sessions = await TestSession.aggregate([
      { $match: matchStage },
      { $unwind: '$violations' },
      ...(violationType ? [{ $match: { 'violations.type': violationType } }] : []),
      ...(severity ? [{ $match: { 'violations.severity': severity } }] : []),
      { $sort: { 'violations.timestamp': -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          sessionId: '$_id',
          testType: 1,
          company: 1,
          status: 1,
          violation: '$violations',
          student: {
            id: '$user._id',
            name: '$user.fullName',
            email: '$user.email',
            college: '$user.collegeName'
          }
        }
      }
    ]);

    // Get total count
    const totalPipeline = [
      { $match: matchStage },
      { $unwind: '$violations' },
      ...(violationType ? [{ $match: { 'violations.type': violationType } }] : []),
      ...(severity ? [{ $match: { 'violations.severity': severity } }] : []),
      { $count: 'total' }
    ];
    const countResult = await TestSession.aggregate(totalPipeline);
    const total = countResult[0]?.total || 0;

    // Get violation type breakdown
    const typeBreakdown = await TestSession.aggregate([
      { $match: { 'violations.0': { $exists: true } } },
      { $unwind: '$violations' },
      { $group: { _id: '$violations.type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        violations: sessions,
        typeBreakdown: typeBreakdown.map(t => ({ type: t._id, count: t.count })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get all violations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching violations',
      error: error.message
    });
  }
};

// @desc    Get violations for a specific session
// @route   GET /api/admin/proctoring/violations/:sessionId
// @access  Private/Admin
export const getSessionViolations = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await TestSession.findById(sessionId)
      .populate('userId', 'fullName email collegeName');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const proctoring = await ProctoringSession.findOne({ testSession: sessionId })
      .select('+violations.screenshot');

    res.json({
      success: true,
      data: {
        sessionId: session._id,
        testType: session.testType,
        status: session.status,
        student: {
          id: session.userId?._id,
          name: session.userId?.fullName,
          email: session.userId?.email
        },
        violations: session.violations || [],
        proctoringViolations: proctoring?.violations || [],
        totalViolations: (session.violations?.length || 0) + (proctoring?.violations?.length || 0),
        terminationReason: session.terminationReason || proctoring?.terminationReason
      }
    });
  } catch (error) {
    console.error('Get session violations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching session violations',
      error: error.message
    });
  }
};

// =====================================================
// TEST MANAGEMENT
// =====================================================

// @desc    Terminate a test session (admin action)
// @route   POST /api/admin/proctoring/:sessionId/terminate
// @access  Private/Admin
export const terminateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reason } = req.body;

    const session = await TestSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Session is not active'
      });
    }

    // Terminate the session
    session.status = 'terminated';
    session.endTime = new Date();
    session.timeTaken = Math.floor((session.endTime - session.startTime) / 1000);
    session.terminationReason = reason || 'Admin terminated';
    session.terminatedBy = req.user._id;

    await session.save();

    // Update proctoring session
    await ProctoringSession.findOneAndUpdate(
      { testSession: sessionId },
      {
        status: 'terminated',
        endTime: new Date(),
        terminationReason: reason || 'Admin terminated'
      }
    );

    res.json({
      success: true,
      message: 'Test session terminated',
      data: {
        sessionId: session._id,
        status: session.status,
        terminationReason: session.terminationReason
      }
    });
  } catch (error) {
    console.error('Terminate session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error terminating session',
      error: error.message
    });
  }
};

// @desc    Allow a student to retest
// @route   POST /api/admin/proctoring/:sessionId/allow-retest
// @access  Private/Admin
export const allowRetest = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reason, clearViolations } = req.body;

    const session = await TestSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Mark session as retest allowed
    session.retestAllowed = true;
    session.retestReason = reason || 'Admin approved retest';
    session.retestApprovedBy = req.user._id;
    session.retestApprovedAt = new Date();

    if (clearViolations) {
      session.violationsCleared = true;
      session.violationsClearedReason = 'Admin cleared for retest';
    }

    await session.save();

    // Update user to allow new test
    await User.findByIdAndUpdate(session.userId, {
      $set: { canRetakeTest: true, retestApprovalDate: new Date() }
    });

    res.json({
      success: true,
      message: 'Retest allowed',
      data: {
        sessionId: session._id,
        studentId: session.userId,
        retestApproved: true,
        violationsCleared: clearViolations || false
      }
    });
  } catch (error) {
    console.error('Allow retest error:', error);
    res.status(500).json({
      success: false,
      message: 'Error allowing retest',
      error: error.message
    });
  }
};

// @desc    Get detailed test results for admin review
// @route   GET /api/admin/proctoring/results/:sessionId
// @access  Private/Admin
export const getAdminTestResults = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await TestSession.findById(sessionId)
      .populate('userId', 'fullName email collegeName degree targetRole skills');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const testResult = await TestResult.findOne({ sessionId });
    const proctoring = await ProctoringSession.findOne({ testSession: sessionId });

    res.json({
      success: true,
      data: {
        session: {
          id: session._id,
          testType: session.testType,
          company: session.company,
          field: session.field,
          status: session.status,
          aiGenerated: session.aiGenerated,
          startTime: session.startTime,
          endTime: session.endTime,
          timeTaken: session.timeTaken,
          totalDuration: session.totalDuration
        },
        student: {
          id: session.userId?._id,
          name: session.userId?.fullName,
          email: session.userId?.email,
          college: session.userId?.collegeName,
          degree: session.userId?.degree,
          targetRole: session.userId?.targetRole,
          skills: session.userId?.skills
        },
        results: {
          overallScore: session.percentageScore || testResult?.overallScore,
          totalQuestions: session.totalQuestions || testResult?.totalQuestions,
          correctAnswers: session.correctAnswers || testResult?.correctAnswers,
          sections: session.sections || testResult?.sections,
          codingSubmissions: session.codingSubmissions || testResult?.codingSubmissions,
          strongAreas: testResult?.strongAreas,
          weakAreas: testResult?.weakAreas
        },
        proctoring: {
          enabled: session.isProctoringEnabled,
          violations: session.violations || [],
          proctoringData: session.proctoringData,
          terminationReason: session.terminationReason,
          trustScore: proctoring?.trustScore
        },
        generatedTest: session.generatedTest,
        retestInfo: {
          allowed: session.retestAllowed || false,
          reason: session.retestReason,
          approvedAt: session.retestApprovedAt
        }
      }
    });
  } catch (error) {
    console.error('Get admin test results error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching test results',
      error: error.message
    });
  }
};

// =====================================================
// PROCTORING STATISTICS
// =====================================================

// @desc    Get proctoring statistics dashboard
// @route   GET /api/admin/proctoring/stats
// @access  Private/Admin
export const getProctoringStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.startTime = {};
      if (startDate) dateFilter.startTime.$gte = new Date(startDate);
      if (endDate) dateFilter.startTime.$lte = new Date(endDate);
    }

    // Overall stats
    const totalTests = await TestSession.countDocuments(dateFilter);
    const completedTests = await TestSession.countDocuments({ ...dateFilter, status: 'completed' });
    const terminatedTests = await TestSession.countDocuments({ ...dateFilter, status: 'terminated' });
    const activeTests = await TestSession.countDocuments({ ...dateFilter, status: 'in_progress' });

    // AI-generated tests
    const aiGeneratedTests = await TestSession.countDocuments({ ...dateFilter, aiGenerated: true });

    // Proctored tests
    const proctoredTests = await TestSession.countDocuments({ ...dateFilter, isProctoringEnabled: true });

    // Violation stats
    const testsWithViolations = await TestSession.countDocuments({
      ...dateFilter,
      'violations.0': { $exists: true }
    });

    // Violation breakdown by type
    const violationBreakdown = await TestSession.aggregate([
      { $match: { ...dateFilter, 'violations.0': { $exists: true } } },
      { $unwind: '$violations' },
      { $group: { _id: '$violations.type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Tests terminated due to violations
    const terminatedDueToViolations = await TestSession.countDocuments({
      ...dateFilter,
      status: 'terminated',
      terminationReason: { $regex: /violation/i }
    });

    // Company-wise test distribution
    const companyDistribution = await TestSession.aggregate([
      { $match: { ...dateFilter, company: { $exists: true, $ne: null } } },
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Average scores
    const avgScores = await TestSession.aggregate([
      { $match: { ...dateFilter, status: 'completed', percentageScore: { $exists: true } } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$percentageScore' },
          maxScore: { $max: '$percentageScore' },
          minScore: { $min: '$percentageScore' }
        }
      }
    ]);

    // Retests allowed
    const retestsAllowed = await TestSession.countDocuments({ ...dateFilter, retestAllowed: true });

    res.json({
      success: true,
      data: {
        overview: {
          totalTests,
          completedTests,
          terminatedTests,
          activeTests,
          completionRate: totalTests > 0 ? Math.round((completedTests / totalTests) * 100) : 0,
          terminationRate: totalTests > 0 ? Math.round((terminatedTests / totalTests) * 100) : 0
        },
        testTypes: {
          aiGenerated: aiGeneratedTests,
          proctored: proctoredTests,
          withViolations: testsWithViolations
        },
        violations: {
          testsWithViolations,
          terminatedDueToViolations,
          breakdown: violationBreakdown.map(v => ({ type: v._id, count: v.count }))
        },
        companies: companyDistribution.map(c => ({ company: c._id, count: c.count })),
        scores: avgScores[0] || { avgScore: 0, maxScore: 0, minScore: 0 },
        retests: {
          allowed: retestsAllowed
        }
      }
    });
  } catch (error) {
    console.error('Get proctoring stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching proctoring stats',
      error: error.message
    });
  }
};

// @desc    Get student test history (admin view)
// @route   GET /api/admin/proctoring/student/:userId/history
// @access  Private/Admin
export const getStudentTestHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const user = await User.findById(userId).select('fullName email collegeName degree');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const sessions = await TestSession.find({ userId })
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TestSession.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        student: {
          id: user._id,
          name: user.fullName,
          email: user.email,
          college: user.collegeName,
          degree: user.degree
        },
        tests: sessions.map(s => ({
          sessionId: s._id,
          testType: s.testType,
          company: s.company,
          status: s.status,
          aiGenerated: s.aiGenerated,
          score: s.percentageScore,
          startTime: s.startTime,
          endTime: s.endTime,
          timeTaken: s.timeTaken,
          violations: s.violations?.length || 0,
          retestAllowed: s.retestAllowed || false
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get student test history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student test history',
      error: error.message
    });
  }
};

export default {
  getLiveTests,
  getLiveSessionDetails,
  getAllViolations,
  getSessionViolations,
  terminateSession,
  allowRetest,
  getAdminTestResults,
  getProctoringStats,
  getStudentTestHistory
};
