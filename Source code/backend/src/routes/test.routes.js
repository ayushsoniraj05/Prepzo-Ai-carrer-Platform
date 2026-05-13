import express from 'express';
import {
  startTestSession,
  addViolation,
  submitSection,
  completeTest,
  terminateTest,
  getTestSession,
  getTestHistory,
  getTestStats,
  getTestAnswers,
  checkRecommendationEligibility,
  triggerAIAnalysis
} from '../controllers/test.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Start a new test session
router.post('/start', startTestSession);

// Add a violation to current test
router.post('/:sessionId/violation', addViolation);

// Submit a section's answers
router.post('/:sessionId/section', submitSection);

// Complete a test
router.post('/:sessionId/complete', completeTest);

// Terminate a test (due to violations)
router.post('/:sessionId/terminate', terminateTest);

// Get a specific test session
router.get('/:sessionId', getTestSession);

// Get user's test history
router.get('/user/history', getTestHistory);

// Get user's test statistics
router.get('/user/stats', getTestStats);

// Get test answers for review (after completion)
router.get('/result/:testResultId/answers', getTestAnswers);

// Check if user is eligible for AI recommendations
router.get('/result/:testResultId/eligibility', checkRecommendationEligibility);

// Trigger AI analysis for a completed test
router.post('/result/:testResultId/analyze', triggerAIAnalysis);

export default router;
