/**
 * AI Test Controller
 * Handles AI-generated dynamic test creation and evaluation
 */

import TestSession from '../models/TestSession.model.js';
import TestResult from '../models/TestResult.model.js';
import ProctoringSession from '../models/ProctoringSession.model.js';
import User from '../models/User.model.js';
import Question from '../models/Question.model.js';
import { seeder } from '../services/autonomousSeeder.service.js';
import aiService from '../services/aiService.js';

// =====================================================
// AI TEST GENERATION
// =====================================================

// @desc    Generate Stage 1: Field-based Assessment (60 questions)
// @route   POST /api/ai-test/generate/field-test
// @access  Private
export const generateFieldTest = async (req, res, next) => {
  try {
    const user = req.user;
    const { testConfig } = req.body;

    const studentProfile = {
      userId: user?._id?.toString() || 'unknown',
      id: user?._id?.toString() || 'unknown',
      name: user?.fullName || user?.name || 'Student',
      degree: user?.degree || 'Bachelor of Technology',
      stream: user?.fieldOfStudy || user?.stream || 'Computer Science',
      fieldOfStudy: user?.fieldOfStudy || user?.stream || 'Computer Science',
      year: user?.yearOfStudy || user?.year || 'Final Year',
      targetRole: user?.targetRole || 'Software Engineer',
      knownTechnologies: user?.knownTechnologies || user?.skills || [],
      careerGoals: user?.careerGoals || 'Prepare for top tech placements',
    };

    // Check if locked
    if (user.isAssessmentLocked) {
      return res.status(403).json({
        success: false,
        message: 'Assessment is locked. You can retake it after 3 days.',
        unlockDate: user.assessmentUnlockDate,
        lockedUntil: user.assessmentUnlockDate?.toLocaleString()
      });
    }


    console.log(`[aiTest] generateFieldTest start for user ${user._id}`);
    
    // 1. Generate Module ID
    const cleanField = studentProfile.stream.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const cleanRole  = studentProfile.targetRole.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const moduleId = `${cleanField}_${cleanRole}`;
    
    console.log(`[aiTest] Attempting seeded retrieval for module: ${moduleId}`);

    // 2. Fetch from Seeded Question Bank (Stage 1: Field-based, 60 questions)
    // Fuzzy match for field to handle "Computer Science" vs "Computer Science & Engineering"
    const fieldFuzzy = new RegExp(studentProfile.stream.split(' ')[0], 'i'); // Match first word (e.g. "Computer")

    let questions = await Question.aggregate([
      { $match: { moduleId, category: 'foundational' } },
      { $sample: { size: 60 } }
    ]);

    // Fallback 1: Module name variation (replace cse/cs/it abbreviations)
    if (questions.length < 60) {
      const altModuleId = moduleId.replace('computer_science___engineering', 'computer_science');
      if (altModuleId !== moduleId) {
        const altQuestions = await Question.aggregate([
          { $match: { moduleId: altModuleId, category: 'foundational' } },
          { $sample: { size: 60 - questions.length } }
        ]);
        questions = [...questions, ...altQuestions];
      }
    }

    // Fallback 2: Pull from any module within the same fuzzy field
    if (questions.length < 60) {
      console.log(`[aiTest] Module ${moduleId} thin. Pulling from fuzzy field: ${fieldFuzzy}`);
      const needed = 60 - questions.length;
      const fieldQuestions = await Question.aggregate([
        { 
          $match: { 
            field: { $regex: fieldFuzzy }, 
            category: 'foundational',
            _id: { $nin: questions.map(q => q._id) }
          } 
        },
        { $sample: { size: needed } }
      ]);
      questions = [...questions, ...fieldQuestions];
    }

    // Fallback 3: Universal Technical Core
    if (questions.length < 60) {
      const needed = 60 - questions.length;
      const universalQuestions = await Question.aggregate([
        { 
          $match: { 
            field: { $regex: /Computer Science|Information Technology|Engineering/i },
            category: 'foundational',
            _id: { $nin: questions.map(q => q._id) }
          } 
        },
        { $sample: { size: needed } }
      ]);
      questions = [...questions, ...universalQuestions];
    }

    if (questions.length === 0) {
       // Return 200 with recovery token so frontend silently triggers local fallback without browser 404 logs
       return res.status(200).json({
         success: true,
         message: 'Database seeding in progress, triggering fallback',
         data: {
           sessionId: 'recovery_database_seeding_' + Date.now(),
           test: null
         }
       });
    }

    console.log(`[aiTest] Successfully sourced ${questions.length} questions for Stage 1.`);
    
    // Construct test data
    const testData = {
      testId: `seeded_${moduleId}_${Date.now()}`,
      totalQuestions: questions.length,
      totalTime: questions.length * 60,
      sections: [
        {
          id: 'field_section',
          name: `${studentProfile.stream} Assessment`,
          questions: questions.map((q, idx) => ({
            id: q._id || `q_${idx}`,
            type: q.type || 'mcq',
            question: q.questionText || q.question,
            options: q.options,
            correct: q.correctAnswer !== undefined ? q.correctAnswer : q.correct,
            explanation: q.explanation,
            difficulty: q.difficulty,
            topics: q.topics
          }))
        }
      ]
    };

    // Ensure we trigger background seeding to reach the 1000 goal
    seeder.boostModule(studentProfile.stream, studentProfile.targetRole);

    const testSession = await TestSession.create({
      userId: user._id,
      testType: 'field_assessment',
      status: 'active',
      startTime: new Date(),
      totalQuestions: testData.totalQuestions,
      testData: testData,
      metadata: {
        stage: 1,
        field: studentProfile.stream
      }
    });

    res.status(201).json({
      success: true,
      data: {
        sessionId: testSession._id,
        test: testData
      }
    });
  } catch (error) {
    console.error('Field test generation error:', error);
    next(error);
  }
};

// @desc    Generate Stage 2: Skill-based Assessment (60 questions total, distributed across selected skills)
// @route   POST /api/ai-test/generate/skill-test
// @access  Private
export const generateSkillTest = async (req, res, next) => {
  try {
    const user = req.user;
    const { testConfig } = req.body;

    // Use skills selected by student from onboarding (skillRatings map or knownTechnologies)
    const selectedSkills = user.knownTechnologies || [];
    const skillMap = user.skillRatings || {};
    
    // Merge skills from both sources to be sure
    const skills = [...new Set([...selectedSkills, ...Object.keys(skillMap)])].filter(Boolean);

    if (!skills.length) {
      return res.status(400).json({
        success: false,
        message: 'No skills found in user profile. Please select skills in onboarding form to start Skill Precision Assessment.'
      });
    }

    const studentProfile = {
      userId: user._id.toString(),
      id: user._id.toString(),
      name: user.fullName || 'Student',
      degree: user.degree || 'B.Tech',
      stream: user.fieldOfStudy || 'Computer Science',
      fieldOfStudy: user.fieldOfStudy || 'Computer Science',
      year: user.yearOfStudy || 'Final Year',
      targetRole: user.targetRole || 'Software Engineer',
      careerGoals: user.careerGoals || `Success in ${user.targetRole || 'Technical'} role`,
      skillRatings: user.skillRatings || {},
      knownTechnologies: skills
    };

    // Check if locked
    if (user.isAssessmentLocked) {
      return res.status(403).json({
        success: false,
        message: 'Assessment is locked. You can retake it after 3 days.',
        unlockDate: user.assessmentUnlockDate,
        lockedUntil: user.assessmentUnlockDate?.toLocaleString()
      });
    }

    console.log(`[aiTest] generateSkillTest (Stage 2) start for user ${user._id} | Skills: ${skills.join(', ')}`);
    
    // 1. Generate Module ID
    const cleanField = studentProfile.stream.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const cleanRole  = studentProfile.targetRole.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const moduleId = `${cleanField}_${cleanRole}`;

    // Target: 10 questions per selected area of expertise
    const QUESTIONS_PER_SKILL = 10;
    const finalQuestions = [];
    const usedIds = new Set();

    console.log(`[aiTest] Sourcing 10 questions per skill for: ${skills.join(', ')}`);

    for (const skill of skills) {
      // 1. Fetch from Seeded Question Bank (Filter by specific topic/skill)
      let skillBatch = await Question.aggregate([
        { 
          $match: { 
            topics: { $in: [new RegExp(`^${skill}$`, 'i'), skill] },
            category: 'practical'
          } 
        },
        { $sample: { size: QUESTIONS_PER_SKILL } }
      ]);

      console.log(`[aiTest] Sourced ${skillBatch.length}/${QUESTIONS_PER_SKILL} for skill: ${skill}`);

      // Add to final pool tracking unique IDs
      skillBatch.forEach(q => {
        if (!usedIds.has(q._id.toString())) {
          finalQuestions.push(q);
          usedIds.add(q._id.toString());
        }
      });
    }

    const questions = finalQuestions;

    if (questions.length === 0) {
      return res.status(200).json({
         success: true,
         message: 'Database seeding in progress for your specific skills, triggering recovery fallback',
         data: {
           sessionId: 'recovery_database_seeding_' + Date.now(),
           test: null
         }
      });
    }

    console.log(`[aiTest] Successfully sourced ${questions.length} questions for Stage 2 Skill Precision.`);

    // Group questions into sections based on skills for better UI presentation
    const sections = skills.map(skill => {
      // Find questions that match this skill
      const skillQuestions = questions.filter(q => 
        q.topics && q.topics.some(t => t.toLowerCase() === skill.toLowerCase())
      );
      
      // If questions are low, trigger background seeding boost for this topic
      if (skillQuestions.length < 10) {
        seeder.boostTopic(skill, studentProfile.stream, studentProfile.targetRole);
      }

      if (skillQuestions.length === 0) return null;
      
      return {
        id: `skill_${skill.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        name: skill,
        questions: skillQuestions.map(q => ({
          id: q._id,
          type: q.type || 'mcq',
          question: q.questionText || q.question,
          options: q.options,
          correct: q.correctAnswer !== undefined ? q.correctAnswer : q.correct,
          explanation: q.explanation,
          difficulty: q.difficulty,
          topics: q.topics
        }))
      };
    }).filter(s => s !== null);

    // If sectioning failed to capture all questions, put them in a catch-all
    const capturedIds = new Set(sections.flatMap(s => s.questions.map(q => q.id.toString())));
    const remainingQuestions = questions.filter(q => !capturedIds.has(q._id.toString()));

    if (remainingQuestions.length > 0) {
      sections.push({
        id: 'skill_mix',
        name: 'Technical Depth',
        questions: remainingQuestions.map(q => ({
          id: q._id,
          type: q.type || 'mcq',
          question: q.questionText || q.question,
          options: q.options,
          correct: q.correctAnswer !== undefined ? q.correctAnswer : q.correct,
          explanation: q.explanation,
          difficulty: q.difficulty,
          topics: q.topics
        }))
      });
    }

    const testData = {
      testId: `seeded_skills_${moduleId}_${Date.now()}`,
      totalQuestions: questions.length,
      totalTime: questions.length * 60,
      sections: sections
    };

    const testSession = await TestSession.create({
      userId: user._id,
      testType: 'skill_assessment',
      status: 'active',
      startTime: new Date(),
      totalQuestions: testData.totalQuestions,
      testData: testData,
      metadata: {
        stage: 2,
        skillsCovered: skills,
        source: 'seeded_bank'
      }
    });

    res.status(201).json({
      success: true,
      data: {
        sessionId: testSession._id,
        test: testData
      }
    });
  } catch (error) {
    console.error('Skill test generation error:', error);
    next(error);
  }
};

// @desc    Generate unique AI-powered test for student
// @route   POST /api/ai-test/generate
// @access  Private
export const generateAITest = async (req, res, next) => {
  try {
    const { testConfig } = req.body;
    const user = req.user;

    // Build student profile from user data (User model fields: fullName, fieldOfStudy, yearOfStudy, knownTechnologies)
    const studentProfile = {
      userId: user._id.toString(),
      id: user._id.toString(),
      name: user.fullName || user.name || 'Student',
      degree: user.degree,
      stream: user.fieldOfStudy || user.stream || 'Computer Science',
      fieldOfStudy: user.fieldOfStudy || user.stream || 'Computer Science',
      year: user.yearOfStudy || user.year || 'Final Year',
      targetRole: testConfig?.targetRole || user.targetRole || 'Software Engineer',
      knownTechnologies: user.knownTechnologies || user.skills || [],
      careerGoals: user.careerGoals || `Become a ${user.targetRole || 'Software Engineer'} at a top company`,
    };
    
    // Check if locked
    if (user.isAssessmentLocked) {
      return res.status(403).json({
        success: false,
        message: 'Assessment is locked. You can retake it after 3 days.',
        unlockDate: user.assessmentUnlockDate,
        lockedUntil: user.assessmentUnlockDate?.toLocaleString()
      });
    }

    // Generate test using AI service (instrument timing for diagnostics)
    const start = Date.now();
    console.log(`[aiTest] generateAITest start for user ${user._id} at ${new Date(start).toISOString()}`);
    const result = await aiService.generateAITest(studentProfile, testConfig || {});
    const duration = Date.now() - start;
    console.log(`[aiTest] generateAITest completed for user ${user._id} in ${duration}ms`);
    console.log(`[aiTest] Result structure:`, {
      success: result.success,
      hasTest: !!result.test,
      sectionCount: result.test?.sections?.length,
      firstSectionName: result.test?.sections?.[0]?.name,
      firstSectionQCount: result.test?.sections?.[0]?.questions?.length
    });

    if (!result.success) {
      const error = new Error(result.error || 'Failed to generate AI test');
      error.code = 'AI_SERVICE_ERROR';
      throw error;
    }

    // Create a test session to track this test
    const testSession = await TestSession.create({
      userId: user._id,
      testType: 'ai_generated',
      testId: result.test.testId,
      field: studentProfile.stream || 'Computer Science',
      degree: studentProfile.degree,
      targetRole: studentProfile.targetRole,
      totalDuration: Math.round(result.test.totalTime / 60), // Convert seconds to minutes for DB
      totalQuestions: result.test.totalQuestions,
      isProctoringEnabled: testConfig?.enableProctoring !== false,
      aiGenerated: true,
      generatedTest: result.test,
      sections: result.test.sections.map(s => ({
        sectionId: s.id,
        sectionName: s.name,
        questionsAttempted: 0,
        correctAnswers: 0,
        score: 0,
        timeTaken: 0,
        answers: []
      })),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      proctoringData: {
        cameraEnabled: false,
        microphoneEnabled: false,
        screenSharingEnabled: false,
        fullscreenEnabled: false
      }
    });

    // Create proctoring session if enabled
    if (testConfig?.enableProctoring !== false) {
      await ProctoringSession.create({
        testSession: testSession._id,
        user: user._id,
        status: 'active',
        violations: [],
        recordings: {}
      });
    }

    console.log(`[aiTest] Successfully generated and stored test session: ${testSession._id}`);
    res.status(201).json({
      success: true,
      data: {
        sessionId: testSession._id,
        testId: result.test.testId,
        test: result.test,
        message: result.message
      }
    });
  } catch (error) {
    console.error(`[aiTest] CRITICAL_ERROR: ${error.message}`);
    if (error.stack) console.error(error.stack);
    // Explicitly set code for failsafe targeting
    if (!error.code) error.code = 'AI_SERVICE_ERROR';
    next(error);
  }
};

// @desc    Generate company-specific pattern test
// @route   POST /api/ai-test/generate-company
// @access  Private
export const generateCompanyTest = async (req, res, next) => {
  try {
    const { company, testConfig } = req.body;
    const user = req.user;

    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    // Build student profile (using correct User model field names)
    const studentProfile = {
      userId: user._id.toString(),
      id: user._id.toString(),
      name: user.fullName || user.name || 'Student',
      degree: user.degree,
      stream: user.fieldOfStudy || user.stream || 'Computer Science',
      fieldOfStudy: user.fieldOfStudy || user.stream || 'Computer Science',
      year: user.yearOfStudy || user.year || 'Final Year',
      targetRole: testConfig?.targetRole || user.targetRole || 'Software Engineer',
      knownTechnologies: user.knownTechnologies || user.skills || [],
      careerGoals: user.careerGoals || `Become a ${user.targetRole || 'Software Engineer'} at a top company`,
    };

    // Check if locked
    if (user.isAssessmentLocked) {
      return res.status(403).json({
        success: false,
        message: 'Assessment is locked. You can retake it after 3 days.',
        unlockDate: user.assessmentUnlockDate,
        lockedUntil: user.assessmentUnlockDate?.toLocaleString()
      });
    }

    // Generate company-specific test
    const result = await aiService.generateCompanyTest(studentProfile, company, testConfig || {});

    if (!result.success) {
      const error = new Error(result.error || `Failed to generate ${company} pattern test`);
      error.code = 'AI_SERVICE_ERROR';
      throw error;
    }

    // Create test session
    const testSession = await TestSession.create({
      userId: user._id,
      testType: 'company_pattern',
      testId: result.test.testId,
      company: company.toUpperCase(),
      field: studentProfile.stream || 'Computer Science',
      degree: studentProfile.degree,
      targetRole: studentProfile.targetRole,
      totalDuration: Math.round(result.test.totalTime / 60), // Convert seconds to minutes for DB
      totalQuestions: result.test.totalQuestions,
      isProctoringEnabled: testConfig?.enableProctoring !== false,
      aiGenerated: true,
      generatedTest: result.test,
      sections: result.test.sections.map(s => ({
        sectionId: s.id,
        sectionName: s.name,
        questionsAttempted: 0,
        correctAnswers: 0,
        score: 0,
        timeTaken: 0,
        answers: []
      })),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Create proctoring session if enabled
    if (testConfig?.enableProctoring !== false) {
      await ProctoringSession.create({
        testSession: testSession._id,
        user: user._id,
        status: 'active',
        violations: [],
        recordings: {}
      });
    }

    res.status(201).json({
      success: true,
      data: {
        sessionId: testSession._id,
        testId: result.test.testId,
        company: result.company,
        test: result.test,
        message: result.message
      }
    });
  } catch (error) {
    console.error('Error generating company test:', error.message);
    // Explicitly set code for failsafe targeting
    error.code = 'AI_SERVICE_ERROR';
    next(error);
  }
};

// @desc    Get supported companies for pattern tests
// @route   GET /api/ai-test/companies
// @access  Private
export const getSupportedCompanies = async (req, res) => {
  try {
    const result = await aiService.getSupportedCompanies();

    res.json({
      success: true,
      data: result.companies
    });
  } catch (error) {
    console.error('Error fetching supported companies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching supported companies',
      error: error.message
    });
  }
};

// @desc    Get available sections for student's stream
// @route   GET /api/ai-test/sections/:stream
// @access  Private
export const getSectionsForStream = async (req, res) => {
  try {
    const { stream } = req.params;
    const result = await aiService.getSectionsForStream(stream);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sections',
      error: error.message
    });
  }
};

// =====================================================
// ADAPTIVE TESTING
// =====================================================

// @desc    Get next adaptive question based on performance
// @route   POST /api/ai-test/:sessionId/next-question
// @access  Private
export const getNextAdaptiveQuestion = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { section, currentPerformance, questionsAnswered } = req.body;
    const user = req.user;

    const testSession = await TestSession.findOne({
      _id: sessionId,
      userId: user._id
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

    const studentProfile = {
      userId: user._id.toString(),
      id: user._id.toString(),
      name: user.name,
      targetRole: testSession.targetRole || user.targetRole,
      knownTechnologies: user.skills || []
    };

    const result = await aiService.getNextAdaptiveQuestion(
      studentProfile,
      section,
      currentPerformance,
      questionsAnswered || []
    );

    res.json({
      success: true,
      data: {
        question: result.question,
        difficulty: result.difficulty,
        questionNumber: result.questionNumber
      }
    });
  } catch (error) {
    console.error('Error getting next adaptive question:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting next adaptive question',
      error: error.message
    });
  }
};

// @desc    Adapt difficulty based on performance
// @route   POST /api/ai-test/adapt-difficulty
// @access  Private
export const adaptDifficulty = async (req, res) => {
  try {
    const { currentPerformance, currentDifficulty } = req.body;

    const result = await aiService.adaptDifficulty(currentPerformance, currentDifficulty);

    res.json({
      success: true,
      data: {
        previousDifficulty: result.previousDifficulty,
        newDifficulty: result.newDifficulty,
        performance: result.performance
      }
    });
  } catch (error) {
    console.error('Error adapting difficulty:', error);
    res.status(500).json({
      success: false,
      message: 'Error adapting difficulty',
      error: error.message
    });
  }
};

// =====================================================
// CODE EVALUATION WITH JUDGE
// =====================================================

// @desc    Evaluate code using LeetCode-style judge
// @route   POST /api/ai-test/evaluate-code
// @access  Private
export const evaluateCode = async (req, res) => {
  try {
    const { code, language, testCases, hiddenTestCases, options } = req.body;

    if (!code || !language || !testCases) {
      return res.status(400).json({
        success: false,
        message: 'code, language, and testCases are required'
      });
    }

    const result = await aiService.evaluateCodeWithJudge(
      code,
      language,
      testCases,
      hiddenTestCases || [],
      options || {}
    );

    res.json({
      success: true,
      data: result.result
    });
  } catch (error) {
    console.error('Error evaluating code:', error);
    res.status(500).json({
      success: false,
      message: 'Error evaluating code',
      error: error.message
    });
  }
};

// @desc    Submit coding question during test
// @route   POST /api/ai-test/:sessionId/submit-code
// @access  Private
export const submitCodingQuestion = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, code, language, question } = req.body;
    const user = req.user;

    const testSession = await TestSession.findOne({
      _id: sessionId,
      userId: user._id
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

    // Get test cases from question
    const visibleTestCases = question.examples?.map(ex => ({
      input: ex.input,
      output: ex.output
    })) || [];

    const hiddenTestCases = question.hiddenTestCases?.map(tc => ({
      input: tc.input,
      output: tc.output
    })) || [];

    // Evaluate code
    const result = await aiService.evaluateCodeWithJudge(
      code,
      language,
      visibleTestCases,
      hiddenTestCases,
      {
        timeLimit: question.timeLimit || 5.0,
        memoryLimit: question.memoryLimit,
        expectedComplexity: question.expectedComplexity
      }
    );

    // Store the submission in the session
    const evaluationResult = result.result;
    const isAccepted = evaluationResult.status === 'Accepted';
    const score = evaluationResult.score;

    // Update session with code submission
    const codingSubmission = {
      questionId,
      code,
      language,
      status: evaluationResult.status,
      score,
      passedTestCases: evaluationResult.passed_test_cases,
      totalTestCases: evaluationResult.total_test_cases,
      executionTime: evaluationResult.execution_time,
      memoryUsed: evaluationResult.memory_used,
      feedback: evaluationResult.feedback,
      submittedAt: new Date()
    };

    // Find or create coding submissions array
    if (!testSession.codingSubmissions) {
      testSession.codingSubmissions = [];
    }
    
    // Check if already submitted this question
    const existingIdx = testSession.codingSubmissions.findIndex(s => s.questionId === questionId);
    if (existingIdx !== -1) {
      // Keep best score
      if (score > testSession.codingSubmissions[existingIdx].score) {
        testSession.codingSubmissions[existingIdx] = codingSubmission;
      }
    } else {
      testSession.codingSubmissions.push(codingSubmission);
    }

    await testSession.save();

    res.json({
      success: true,
      data: {
        questionId,
        ...evaluationResult,
        isAccepted
      }
    });
  } catch (error) {
    console.error('Error submitting code:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting code',
      error: error.message
    });
  }
};

// =====================================================
// REAL-TIME VALIDATION
// =====================================================

// @desc    Validate answer in real-time (instant feedback mode)
// @route   POST /api/ai-test/:sessionId/validate
// @access  Private
export const validateAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, questionType, question, studentAnswer, timeTaken } = req.body;
    const user = req.user;

    const testSession = await TestSession.findOne({
      _id: sessionId,
      userId: user._id
    });

    if (!testSession) {
      return res.status(404).json({
        success: false,
        message: 'Test session not found'
      });
    }

    // For MCQ, validate locally for speed
    if (questionType === 'mcq') {
      const correct = question.correct;
      const isCorrect = studentAnswer === correct;

      return res.json({
        success: true,
        data: {
          questionId,
          isCorrect,
          correctAnswer: correct,
          explanation: question.explanation || '',
          timeTaken
        }
      });
    }

    // For coding and short answer, use AI service
    if (questionType === 'coding') {
      const result = await aiService.evaluateCodeWithJudge(
        studentAnswer,
        question.language || 'python',
        question.examples?.map(ex => ({ input: ex.input, output: ex.output })) || [],
        question.hiddenTestCases?.map(tc => ({ input: tc.input, output: tc.output })) || []
      );

      return res.json({
        success: true,
        data: {
          questionId,
          isCorrect: result.result.status === 'Accepted',
          result: result.result,
          timeTaken
        }
      });
    }

    // For short answer, use text evaluation
    const result = await aiService.evaluateTextAnswer(
      question.question,
      studentAnswer,
      question.expectedAnswer || '',
      question.topic || 'general'
    );

    res.json({
      success: true,
      data: {
        questionId,
        score: result.score,
        feedback: result.feedback,
        timeTaken
      }
    });
  } catch (error) {
    console.error('Error validating answer:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating answer',
      error: error.message
    });
  }
};

// =====================================================
// TEST COMPLETION & RESULTS
// =====================================================

// @desc    Complete AI-generated test with full evaluation
// @route   POST /api/ai-test/:sessionId/complete
// @access  Private
export const completeAITest = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { sections, codingSubmissions } = req.body;
    const user = req.user;

    const testSession = await TestSession.findOne({
      _id: sessionId,
      userId: user._id
    });

    if (!testSession) {
      return res.status(404).json({
        success: false,
        message: 'Test session not found'
      });
    }

      // Update sections
      if (sections) {
        sections.forEach(section => {
          const idx = testSession.sections.findIndex(s => s.sectionId === section.sectionId);
          if (idx !== -1) {
            testSession.sections[idx] = { ...testSession.sections[idx]._doc || testSession.sections[idx], ...section };
          }
        });
      }

      // Calculate comprehensive results (always allow recommendations)
      let totalMCQQuestions = 0;
      let correctMCQ = 0;
      let totalCodingQuestions = 0;
      let codingScore = 0;
      let totalShortAnswerQuestions = 0;
      let shortAnswerScore = 0;

      // Process MCQ answers
      testSession.sections.forEach(section => {
        if (section.answers) {
          section.answers.forEach(answer => {
            if (answer.questionType === 'mcq' || !answer.questionType) {
              totalMCQQuestions++;
              if (answer.isCorrect) correctMCQ++;
            }
          });
        }
      });

      // Process coding submissions
      if (testSession.codingSubmissions || codingSubmissions) {
        const submissions = codingSubmissions || testSession.codingSubmissions;
        totalCodingQuestions = submissions.length;
        codingScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
      }

      // Calculate overall score
      const mcqWeight = 0.4;
      const codingWeight = 0.5;
      const shortAnswerWeight = 0.1;

      const mcqScorePercent = totalMCQQuestions > 0 ? (correctMCQ / totalMCQQuestions) * 100 : 0;
      const codingScorePercent = totalCodingQuestions > 0 ? codingScore / totalCodingQuestions : 0;
      const shortAnswerScorePercent = totalShortAnswerQuestions > 0 ? shortAnswerScore / totalShortAnswerQuestions : 0;

      let overallScore = 0;
      let totalWeight = 0;

      if (totalMCQQuestions > 0) {
        overallScore += mcqScorePercent * mcqWeight;
        totalWeight += mcqWeight;
      }
      if (totalCodingQuestions > 0) {
        overallScore += codingScorePercent * codingWeight;
        totalWeight += codingWeight;
      }
      if (totalShortAnswerQuestions > 0) {
        overallScore += shortAnswerScorePercent * shortAnswerWeight;
        totalWeight += shortAnswerWeight;
      }

      if (totalWeight > 0) {
        overallScore = overallScore / totalWeight;
      }

      overallScore = Math.round(overallScore);

    // Update session status
    testSession.status = 'completed';
    testSession.endTime = new Date();
    testSession.timeTaken = Math.floor((testSession.endTime - testSession.startTime) / 1000);
    testSession.percentageScore = overallScore;
    testSession.overallScore = overallScore;

    await testSession.save();

    // Create detailed TestResult
    const testResult = new TestResult({
      userId: user._id,
      sessionId: testSession._id,
      testType: testSession.testType,
      field: testSession.field,
      targetRole: testSession.targetRole,
      company: testSession.company,
      aiGenerated: true,
      totalQuestions: totalMCQQuestions + totalCodingQuestions + totalShortAnswerQuestions,
      overallScore,
      scores: {
        mcq: mcqScorePercent,
        coding: codingScorePercent,
        shortAnswer: shortAnswerScorePercent
      },
      totalDuration: testSession.totalDuration,
      timeTaken: testSession.timeTaken,
      startedAt: testSession.startTime,
      completedAt: testSession.endTime,
      sections: testSession.sections,
      codingSubmissions: testSession.codingSubmissions || [],
      violations: testSession.violations || [],
      proctoringEnabled: testSession.isProctoringEnabled
    });

    await testResult.save();

    // Update proctoring session
    if (testSession.isProctoringEnabled) {
      await ProctoringSession.findOneAndUpdate(
        { sessionId: testSession._id },
        { status: 'completed', endTime: new Date() }
      );
    }

    // Update user's placement readiness and assessment flags
    const userUpdate = await User.findById(user._id);
    if (userUpdate) {
      if (!userUpdate.placementReadinessScore || overallScore > userUpdate.placementReadinessScore) {
        userUpdate.placementReadinessScore = overallScore;
      }
      
      // Update new two-stage assessment flags
      if (testSession.testType === 'field_assessment') {
        userUpdate.isFieldTestComplete = true;
        console.log(`[aiTest] Stage 1 (Field) complete for user ${user._id}`);
      } else if (testSession.testType === 'skill_assessment') {
        userUpdate.isSkillTestComplete = true;
        console.log(`[aiTest] Stage 2 (Skill) complete for user ${user._id}`);
      }
      
      await userUpdate.save();
    }

    // Generate AI recommendations based on performance
    let recommendations = null;
    try {
      const studentProfile = {
        userId: user._id.toString(),
        currentSkills: user.skills || [],
        targetRole: testSession.targetRole || user.targetRole,
        assessmentScores: {
          overall: overallScore,
          mcq: mcqScorePercent,
          coding: codingScorePercent
        }
      };
      recommendations = await aiService.generateRecommendations(studentProfile);
    } catch (recError) {
      console.warn('Failed to generate recommendations:', recError.message);
    }

    res.json({
      success: true,
      data: {
        sessionId: testSession._id,
        testResultId: testResult._id,
        status: 'completed',
        overallScore,
        scores: {
          mcq: Math.round(mcqScorePercent),
          coding: Math.round(codingScorePercent),
          shortAnswer: Math.round(shortAnswerScorePercent)
        },
        totalQuestions: totalMCQQuestions + totalCodingQuestions + totalShortAnswerQuestions,
        timeTaken: testSession.timeTaken,
        violations: testSession.violations?.length || 0,
        recommendations: recommendations?.recommendations || null
      }
    });
  } catch (error) {
    console.error('Error completing AI test:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing AI test',
      error: error.message
    });
  }
};

// @desc    Get AI test results with detailed analysis
// @route   GET /api/ai-test/results/:sessionId
// @access  Private
export const getAITestResults = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const user = req.user;

    const testResult = await TestResult.findOne({
      sessionId,
      userId: user._id
    });

    if (!testResult) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found'
      });
    }

    const testSession = await TestSession.findById(sessionId);

    res.json({
      success: true,
      data: {
        result: testResult,
        generatedTest: testSession?.generatedTest || null,
        violations: testSession?.violations || []
      }
    });
  } catch (error) {
    console.error('Error fetching AI test results:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching AI test results',
      error: error.message
    });
  }
};

export default {
  generateAITest,
  generateCompanyTest,
  getSupportedCompanies,
  getSectionsForStream,
  getNextAdaptiveQuestion,
  adaptDifficulty,
  evaluateCode,
  submitCodingQuestion,
  validateAnswer,
  completeAITest,
  getAITestResults
};
