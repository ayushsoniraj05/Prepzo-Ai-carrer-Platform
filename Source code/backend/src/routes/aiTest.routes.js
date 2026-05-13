/**
 * AI Test Routes
 * Routes for AI-generated dynamic tests
 */

import express from 'express';
import {
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
  getAITestResults,
  generateFieldTest,
  generateSkillTest
} from '../controllers/aiTest.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ===== TEST GENERATION =====

// Generate Stage 1: Field-based Assessment (60 questions)
router.post('/generate/field-test', generateFieldTest);

// Generate Stage 2: Skill-based Assessment (10 questions per skill)
router.post('/generate/skill-test', generateSkillTest);

// Generate unique AI-powered test
router.post('/generate', generateAITest);

// Generate company-specific pattern test (Amazon, Google, TCS, etc.)
router.post('/generate-company', generateCompanyTest);

// Get list of supported companies for pattern tests
router.get('/companies', getSupportedCompanies);

// Get available test sections for a student's stream
router.get('/sections/:stream', getSectionsForStream);

// ===== ADAPTIVE TESTING =====

// Get next adaptive question during test
router.post('/:sessionId/next-question', getNextAdaptiveQuestion);

// Calculate new difficulty level based on performance
router.post('/adapt-difficulty', adaptDifficulty);

// ===== CODE EVALUATION =====

// Evaluate code submission with LeetCode-style judge
router.post('/evaluate-code', evaluateCode);

// Submit coding question during test
router.post('/:sessionId/submit-code', submitCodingQuestion);

// ===== REAL-TIME VALIDATION =====

// Validate answer in real-time (instant feedback mode)
router.post('/:sessionId/validate', validateAnswer);

// ===== TEST COMPLETION =====

// Complete AI-generated test with full evaluation
router.post('/:sessionId/complete', completeAITest);

// Get AI test results with detailed analysis
router.get('/results/:sessionId', getAITestResults);

export default router;
