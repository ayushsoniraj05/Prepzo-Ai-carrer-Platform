import TestSession from '../models/TestSession.model.js';
import TestResult from '../models/TestResult.model.js';
import User from '../models/User.model.js';
import aiService from '../services/aiService.js';

// Minimum threshold for AI recommendations (60% questions attempted)
const MINIMUM_ATTEMPT_THRESHOLD = 60;

// @desc    Start a new test session
// @route   POST /api/test/start
// @access  Private
export const startTestSession = async (req, res) => {
  try {
    const {
      testType,
      field,
      degree,
      targetRole,
      totalDuration,
      totalQuestions,
      sections,
      isProctoringEnabled
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if assessment is locked (Stage 1 or Stage 2 check)
    if (user.isAssessmentLocked) {
      const unlockDate = user.assessmentUnlockDate;
      return res.status(403).json({
        success: false,
        message: 'Assessment is locked. You can retake it after 3 days.',
        unlockDate,
        lockedUntil: unlockDate?.toLocaleString()
      });
    }


    const testSession = await TestSession.create({
      userId: req.user._id,
      testType: testType || 'field_based',
      field: field || req.user.fieldOfStudy || 'General',
      degree: degree || req.user.degree,
      targetRole: targetRole || req.user.targetRole,
      totalDuration,
      totalQuestions,
      isProctoringEnabled: isProctoringEnabled !== false,
      sections: sections?.map(s => ({
        sectionId: s.id,
        sectionName: s.name,
        questionsAttempted: 0,
        correctAnswers: 0,
        score: 0,
        timeTaken: 0,
        answers: []
      })) || [],
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      proctoringData: {
        cameraEnabled: false,
        microphoneEnabled: false,
        screenSharingEnabled: false,
        fullscreenEnabled: false
      }
    });

    res.status(201).json({
      success: true,
      data: testSession
    });
  } catch (error) {
    console.error('Error starting test session:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting test session',
      error: error.message
    });
  }
};

// @desc    Add a violation to test session
// @route   POST /api/test/:sessionId/violation
// @access  Private
export const addViolation = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { type, description, severity } = req.body;

    const testSession = await TestSession.findOne({
      _id: sessionId,
      userId: req.user._id
    });

    if (!testSession) {
      return res.status(404).json({
        success: false,
        message: 'Test session not found'
      });
    }

    if (testSession.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Test session is not active'
      });
    }

    const violation = {
      type,
      description,
      severity: severity || 'warning',
      timestamp: new Date()
    };

    testSession.violations.push(violation);
    testSession.totalViolations = testSession.violations.length;
    testSession.warningCount = testSession.violations.filter(v => v.severity === 'warning').length;

    // Check if max warnings exceeded (3 warnings = terminate)
    const warningCount = testSession.violations.length;
    const shouldTerminate = warningCount >= 3;

    if (shouldTerminate) {
      testSession.status = 'terminated';
      testSession.endTime = new Date();
      testSession.timeTaken = Math.floor((testSession.endTime - testSession.startTime) / 1000);
      testSession.terminationReason = 'Maximum violations exceeded';
    }

    await testSession.save();

    res.json({
      success: true,
      data: {
        violation,
        totalViolations: testSession.totalViolations,
        warningCount,
        isTerminated: shouldTerminate,
        remainingWarnings: Math.max(0, 3 - warningCount)
      }
    });
  } catch (error) {
    console.error('Error adding violation:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding violation',
      error: error.message
    });
  }
};

// @desc    Submit section answers
// @route   POST /api/test/:sessionId/section
// @access  Private
export const submitSection = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { sectionId, answers, timeTaken } = req.body;

    const testSession = await TestSession.findOne({
      _id: sessionId,
      userId: req.user._id
    });

    if (!testSession) {
      return res.status(404).json({
        success: false,
        message: 'Test session not found'
      });
    }

    if (testSession.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Test session is not active'
      });
    }

    // Find the section and update it
    const sectionIndex = testSession.sections.findIndex(s => s.sectionId === sectionId);
    
    if (sectionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const questionsAttempted = answers.length;
    const score = Math.round((correctAnswers / questionsAttempted) * 100);

    testSession.sections[sectionIndex] = {
      ...testSession.sections[sectionIndex],
      questionsAttempted,
      correctAnswers,
      score,
      timeTaken: timeTaken || 0,
      answers
    };

    await testSession.save();

    res.json({
      success: true,
      data: {
        sectionId,
        questionsAttempted,
        correctAnswers,
        score,
        timeTaken
      }
    });
  } catch (error) {
    console.error('Error submitting section:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting section',
      error: error.message
    });
  }
};

// @desc    Complete test session with full result storage
// @route   POST /api/test/:sessionId/complete
// @access  Private
export const completeTest = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { sections, questionDetails } = req.body;

    const testSession = await TestSession.findOne({
      _id: sessionId,
      userId: req.user._id
    });

    if (!testSession) {
      return res.status(404).json({
        success: false,
        message: 'Test session not found'
      });
    }

    // Update sections if provided
    if (sections && sections.length > 0) {
      sections.forEach(section => {
        const idx = testSession.sections.findIndex(s => s.sectionId === section.sectionId);
        if (idx !== -1) {
          testSession.sections[idx] = { ...testSession.sections[idx], ...section };
        }
      });
    }

    // Calculate overall results - properly track attempted vs total
    let totalQuestionsInTest = 0;
    let attemptedQuestions = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let skippedQuestions = 0;
    
    testSession.sections.forEach(section => {
      const sectionTotal = section.answers?.length || section.questionsAttempted || 0;
      const sectionAttempted = section.answers?.filter(a => a.selectedOption !== -1).length || section.questionsAttempted || 0;
      const sectionCorrect = section.answers?.filter(a => a.isCorrect).length || section.correctAnswers || 0;
      
      totalQuestionsInTest += sectionTotal;
      attemptedQuestions += sectionAttempted;
      correctAnswers += sectionCorrect;
    });
    
    incorrectAnswers = attemptedQuestions - correctAnswers;
    skippedQuestions = totalQuestionsInTest - attemptedQuestions;
    
    // Calculate scores
    const overallScore = totalQuestionsInTest > 0 ? Math.round((correctAnswers / totalQuestionsInTest) * 100) : 0;
    const accuracyRate = attemptedQuestions > 0 ? Math.round((correctAnswers / attemptedQuestions) * 100) : 0;
    const completionRate = totalQuestionsInTest > 0 ? Math.round((attemptedQuestions / totalQuestionsInTest) * 100) : 0;
    
    // Check if meets threshold for AI recommendations
    const meetsThreshold = completionRate >= MINIMUM_ATTEMPT_THRESHOLD;

    testSession.status = 'completed';
    testSession.endTime = new Date();
    testSession.timeTaken = Math.floor((testSession.endTime - testSession.startTime) / 1000);
    testSession.totalQuestions = totalQuestionsInTest;
    testSession.correctAnswers = correctAnswers;
    testSession.percentageScore = overallScore;
    testSession.overallScore = overallScore;

    await testSession.save();

    // Create detailed TestResult for AI analysis and answer review
    const testResultData = {
      userId: req.user._id,
      sessionId: testSession._id,
      testType: testSession.testType,
      field: testSession.field,
      targetRole: testSession.targetRole || req.user.targetRole,
      totalQuestions: totalQuestionsInTest,
      attemptedQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      overallScore,
      accuracyRate,
      completionRate,
      meetsThreshold,
      thresholdPercentage: MINIMUM_ATTEMPT_THRESHOLD,
      totalDuration: testSession.totalDuration,
      timeTaken: testSession.timeTaken,
      startedAt: testSession.startTime,
      completedAt: testSession.endTime,
      sections: testSession.sections.map(section => ({
        sectionId: section.sectionId,
        sectionName: section.sectionName,
        totalQuestions: section.answers?.length || section.questionsAttempted || 0,
        attemptedQuestions: section.answers?.filter(a => a.selectedOption !== -1).length || section.questionsAttempted || 0,
        correctAnswers: section.answers?.filter(a => a.isCorrect).length || section.correctAnswers || 0,
        score: section.score || 0,
        timeTaken: section.timeTaken || 0,
        questions: questionDetails?.[section.sectionId] || section.answers?.map(a => ({
          questionId: a.questionId,
          questionText: a.questionText || '',
          options: a.options || [],
          correctAnswer: a.correctAnswer || 0,
          selectedAnswer: a.selectedOption ?? -1,
          isCorrect: a.isCorrect || false,
          isAttempted: a.selectedOption !== -1 && a.selectedOption !== undefined,
          timeTaken: a.timeTaken || 0,
          difficulty: a.difficulty || 'medium',
          skill: section.sectionName,
          explanation: a.explanation || ''
        })) || []
      }))
    };
    
    const testResult = new TestResult(testResultData);
    await testResult.save();

    // Update user's placement readiness score and completion flags
    const user = await User.findById(req.user._id);
    if (user) {
      if (!user.placementReadinessScore || overallScore > user.placementReadinessScore) {
        user.placementReadinessScore = overallScore;
      }
      
      // Update specific completion flags and persistent storage
      const sectionSummaries = testSession.sections.map(s => ({
        name: s.sectionName,
        score: s.score,
        correct: s.correctAnswers,
        total: s.questionsAttempted
      }));

      if (testSession.testType === 'field_based') {
        user.isFieldTestComplete = true;
        user.fieldAssessmentResults = {
          score: overallScore,
          sections: sectionSummaries,
          completedAt: new Date()
        };
      } else if (testSession.testType === 'skill_based' || testSession.testType === 'skill') {
        user.isSkillTestComplete = true;
        user.skillAssessmentResults = {
          score: overallScore,
          sections: sectionSummaries,
          completedAt: new Date()
        };
      }
      
      // Check if fully qualified
      if (user.isFieldTestComplete && user.isSkillTestComplete) {
        user.isAssessmentComplete = true;
      }
      
      user.lastAssessmentAt = new Date();
      await user.save();
    }


    // Prepare response
    const responseData = {
      sessionId: testSession._id,
      testResultId: testResult._id,
      status: testSession.status,
      totalQuestions: totalQuestionsInTest,
      attemptedQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      overallScore,
      accuracyRate,
      completionRate,
      timeTaken: testSession.timeTaken,
      meetsThreshold,
      violations: testSession.violations,
      strongAreas: testResult.strongAreas,
      weakAreas: testResult.weakAreas,
      criticalGaps: testResult.criticalGaps,
      sections: testSession.sections.map(s => ({
        sectionId: s.sectionId,
        sectionName: s.sectionName,
        score: s.score,
        questionsAttempted: s.questionsAttempted,
        correctAnswers: s.correctAnswers
      }))
    };
    
    // Add threshold warning if not met
    if (!meetsThreshold) {
      responseData.thresholdWarning = {
        message: `Please attempt at least ${MINIMUM_ATTEMPT_THRESHOLD}% of questions (${Math.ceil(totalQuestionsInTest * MINIMUM_ATTEMPT_THRESHOLD / 100)} questions) to receive accurate AI recommendations.`,
        attemptedPercentage: completionRate,
        requiredPercentage: MINIMUM_ATTEMPT_THRESHOLD,
        eligibleForRecommendations: false
      };
    } else {
      responseData.eligibleForRecommendations = true;
    }

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error completing test:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing test',
      error: error.message
    });
  }
};

// @desc    Terminate test session
// @route   POST /api/test/:sessionId/terminate
// @access  Private
export const terminateTest = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reason } = req.body;

    const testSession = await TestSession.findOne({
      _id: sessionId,
      userId: req.user._id
    });

    if (!testSession) {
      return res.status(404).json({
        success: false,
        message: 'Test session not found'
      });
    }

    testSession.status = 'terminated';
    testSession.endTime = new Date();
    testSession.timeTaken = Math.floor((testSession.endTime - testSession.startTime) / 1000);
    testSession.terminationReason = reason || 'Test terminated by system';

    await testSession.save();

    res.json({
      success: true,
      data: {
        sessionId: testSession._id,
        status: 'terminated',
        terminationReason: testSession.terminationReason,
        violations: testSession.violations
      }
    });
  } catch (error) {
    console.error('Error terminating test:', error);
    res.status(500).json({
      success: false,
      message: 'Error terminating test',
      error: error.message
    });
  }
};

// @desc    Get test session details
// @route   GET /api/test/:sessionId
// @access  Private
export const getTestSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const testSession = await TestSession.findOne({
      _id: sessionId,
      userId: req.user._id
    });

    if (!testSession) {
      return res.status(404).json({
        success: false,
        message: 'Test session not found'
      });
    }

    res.json({
      success: true,
      data: testSession
    });
  } catch (error) {
    console.error('Error getting test session:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting test session',
      error: error.message
    });
  }
};

// @desc    Get user's test history
// @route   GET /api/test/user/history
// @access  Private
export const getTestHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const [tests, total] = await Promise.all([
      TestSession.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-sections.answers'),
      TestSession.countDocuments({ userId: req.user._id })
    ]);

    res.json({
      success: true,
      data: {
        tests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting test history:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting test history',
      error: error.message
    });
  }
};

// @desc    Get user's test statistics
// @route   GET /api/test/user/stats
// @access  Private
export const getTestStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      totalTests,
      completedTests,
      terminatedTests,
      avgScore,
      sectionStats
    ] = await Promise.all([
      TestSession.countDocuments({ userId }),
      TestSession.countDocuments({ userId, status: 'completed' }),
      TestSession.countDocuments({ userId, status: 'terminated' }),
      TestSession.aggregate([
        { $match: { userId, status: 'completed' } },
        { $group: { _id: null, avgScore: { $avg: '$percentageScore' } } }
      ]),
      TestSession.aggregate([
        { $match: { userId, status: 'completed' } },
        { $unwind: '$sections' },
        {
          $group: {
            _id: '$sections.sectionName',
            avgScore: { $avg: '$sections.score' },
            totalAttempts: { $sum: 1 }
          }
        },
        { $sort: { avgScore: -1 } }
      ])
    ]);

    // Get best score
    const bestTest = await TestSession.findOne({ userId, status: 'completed' })
      .sort({ percentageScore: -1 })
      .select('percentageScore createdAt field');

    // Get recent violations count
    const recentViolations = await TestSession.aggregate([
      { $match: { userId } },
      { $unwind: '$violations' },
      { $group: { _id: null, total: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalTests,
        completedTests,
        terminatedTests,
        averageScore: avgScore[0]?.avgScore?.toFixed(1) || 0,
        bestScore: bestTest?.percentageScore || 0,
        bestTestDate: bestTest?.createdAt,
        sectionWisePerformance: sectionStats,
        totalViolations: recentViolations[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error getting test stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting test stats',
      error: error.message
    });
  }
};

// @desc    Get answers for review after test completion
// @route   GET /api/test/:testResultId/answers
// @access  Private
export const getTestAnswers = async (req, res) => {
  try {
    const { testResultId } = req.params;
    
    const testResult = await TestResult.findOne({
      _id: testResultId,
      userId: req.user._id
    });
    
    if (!testResult) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found'
      });
    }
    
    // Get all questions with answers for review
    const answerReview = testResult.getAnswerReview();
    
    res.json({
      success: true,
      data: {
        testResultId: testResult._id,
        field: testResult.field,
        overallScore: testResult.overallScore,
        accuracyRate: testResult.accuracyRate,
        completionRate: testResult.completionRate,
        totalQuestions: testResult.totalQuestions,
        attemptedQuestions: testResult.attemptedQuestions,
        correctAnswers: testResult.correctAnswers,
        sections: testResult.sections.map(s => ({
          sectionName: s.sectionName,
          score: s.score,
          status: s.status,
          totalQuestions: s.totalQuestions,
          correctAnswers: s.correctAnswers
        })),
        questions: answerReview
      }
    });
  } catch (error) {
    console.error('Error getting test answers:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting test answers',
      error: error.message
    });
  }
};

// @desc    Check if user is eligible for AI recommendations
// @route   GET /api/test/:testResultId/eligibility
// @access  Private
export const checkRecommendationEligibility = async (req, res) => {
  try {
    const { testResultId } = req.params;
    
    const eligibility = await TestResult.checkThreshold(testResultId);
    
    res.json({
      success: true,
      data: eligibility
    });
  } catch (error) {
    console.error('Error checking eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking eligibility',
      error: error.message
    });
  }
};

// @desc    Trigger AI analysis for test result
// @route   POST /api/test/:testResultId/analyze
// @access  Private
export const triggerAIAnalysis = async (req, res) => {
  try {
    const { testResultId } = req.params;
    
    const testResult = await TestResult.findOne({
      _id: testResultId,
      userId: req.user._id
    });
    
    if (!testResult) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found'
      });
    }
    
    // Check threshold
    if (!testResult.meetsThreshold) {
      return res.status(400).json({
        success: false,
        message: `Please attempt at least ${testResult.thresholdPercentage}% of questions to receive AI recommendations.`,
        data: {
          attemptedPercentage: testResult.completionRate,
          requiredPercentage: testResult.thresholdPercentage
        }
      });
    }
    
    // Get user profile
    const user = await User.findById(req.user._id).lean();
    
    // Prepare data for AI service
    const analysisInput = testResult.getAIAnalysisInput();
    const studentProfile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      degree: user.degree || user.education?.degree,
      fieldOfStudy: user.fieldOfStudy || user.education?.fieldOfStudy || 'Computer Science',
      year: user.year || user.education?.year || '3rd Year',
      college: user.college || user.education?.institution,
      targetRole: user.targetRole || 'Software Engineer',
      targetCompanies: user.targetCompanies || [],
      knownTechnologies: user.knownTechnologies || []
    };
    
    // Call AI service for analysis
    let aiRecommendations = null;
    try {
      const isAvailable = await aiService.isServiceAvailable();
      if (isAvailable) {
        aiRecommendations = await aiService.generateRecommendations(
          studentProfile,
          analysisInput
        );
      }
    } catch (aiError) {
      console.warn('AI service error, will use fallback:', aiError.message);
    }
    
    // Mark test as analyzed
    testResult.isAnalyzed = true;
    await testResult.save();
    
    res.json({
      success: true,
      data: {
        testResultId: testResult._id,
        analyzed: true,
        recommendations: aiRecommendations,
        analysisInput
      }
    });
  } catch (error) {
    console.error('Error triggering AI analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error triggering AI analysis',
      error: error.message
    });
  }
};
