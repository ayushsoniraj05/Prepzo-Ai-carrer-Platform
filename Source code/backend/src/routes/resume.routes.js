/**
 * Resume Analysis Routes
 * All endpoints for AI-powered resume analysis and mentoring
 */

import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import aiValidation from '../middleware/aiValidation.middleware.js';
import { aiRateLimiter, validateAIRequest, logAIUsage } from '../middleware/aiSecurity.middleware.js';
import {
  analyzeResume,
  getResumeAnalysis,
  askMentor,
  getQuickTip,
  getChecklist,
  getRoleSkills,
  getActionVerbs,
  reanalyzeResume,
  clearAnalysis,
  generateResume
} from '../controllers/resume.controller.js';

const router = express.Router();

// AI validation middleware for resume analysis
const analyzeMiddleware = [
  aiRateLimiter,
  validateAIRequest(['resumeText', 'targetRole', 'jobDescription', 'demoJobId']),
  logAIUsage,
  aiValidation.markAIRequest(),
];

// Reanalysis only needs targetRole; resume text is loaded from user profile.
const reanalyzeMiddleware = [
  aiRateLimiter,
  validateAIRequest(['targetRole', 'jobDescription', 'demoJobId']),
  logAIUsage,
  aiValidation.markAIRequest(),
];

// Lighter middleware for quick queries
const lightAIMiddleware = [
  aiRateLimiter,
  logAIUsage,
];

// =====================================================
// RESUME ANALYSIS ENDPOINTS
// =====================================================

/**
 * Analyze resume and store results in user profile
 * POST /api/resume/analyze
 */
router.post('/analyze', protect, ...analyzeMiddleware, analyzeResume);

/**
 * Get user's stored resume analysis
 * GET /api/resume/analysis
 */
router.get('/analysis', protect, getResumeAnalysis);

/**
 * Re-analyze resume with different target role
 * POST /api/resume/reanalyze
 */
router.post('/reanalyze', protect, ...reanalyzeMiddleware, reanalyzeResume);

/**
 * Clear user's resume analysis
 * DELETE /api/resume/analysis
 */
router.delete('/analysis', protect, clearAnalysis);

/**
 * Generate resume using pure AI
 * POST /api/resume/generate
 */
router.post('/generate', protect, ...lightAIMiddleware, generateResume);

// =====================================================
// AI MENTOR ENDPOINTS (Prepzo AI Mentor)
// =====================================================

/**
 * Ask AI Resume Mentor a question
 * POST /api/resume/mentor/ask
 */
router.post('/mentor/ask', protect, ...lightAIMiddleware, askMentor);

/**
 * Get quick tip from AI Mentor
 * GET /api/resume/mentor/quick-tip
 */
router.get('/mentor/quick-tip', protect, ...lightAIMiddleware, getQuickTip);

/**
 * Get improvement checklist from AI Mentor
 * GET /api/resume/mentor/checklist
 */
router.get('/mentor/checklist', protect, ...lightAIMiddleware, getChecklist);

// =====================================================
// RESOURCE ENDPOINTS
// =====================================================

/**
 * Get role-specific skill requirements
 * GET /api/resume/skills/:role
 */
router.get('/skills/:role', protect, getRoleSkills);

/**
 * Get action verb suggestions
 * GET /api/resume/action-verbs
 */
router.get('/action-verbs', protect, getActionVerbs);

export default router;
