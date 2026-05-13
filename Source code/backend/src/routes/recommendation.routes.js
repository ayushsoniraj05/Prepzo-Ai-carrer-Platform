/**
 * AI Recommendation Routes
 * All endpoints for AI-powered personalized recommendations
 */

import express from 'express';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import aiValidation from '../middleware/aiValidation.middleware.js';
import { aiRateLimiter, validateAIRequest, logAIUsage } from '../middleware/aiSecurity.middleware.js';
import {
  generateRecommendations,
  getLatestRecommendations,
  getRecommendationHistory,
  getRecommendationById,
  markCourseCompleted,
  markProjectCompleted,
  getRecommendationProgress,
  submitFeedback,
  getQuickInsights,
  regenerateRecommendations,
} from '../controllers/recommendation.controller.js';

const router = express.Router();

// AI validation middleware for recommendation routes
const aiMiddleware = [
  aiRateLimiter,
  validateAIRequest(['assessmentResults', 'assessmentData', 'studentProfile', 'targetRole', 'assessmentId', 'testId', 'testResultId', 'resumeData', 'sessionId']),
  logAIUsage,
  aiValidation.markAIRequest(),
  aiValidation.validateAIRecommendations(),
];

// Generate new recommendations (after test completion) - requires auth
router.post('/generate', protect, ...aiMiddleware, generateRecommendations);

// Regenerate recommendations with updated data - requires auth
router.post('/regenerate', protect, ...aiMiddleware, regenerateRecommendations);

// Get latest recommendations for current user (optional auth - returns empty for unauthenticated)
router.get('/latest', optionalAuth, getLatestRecommendations);

// Get quick insights for dashboard (optional auth)
router.get('/insights', optionalAuth, getQuickInsights);

// Get recommendation history (requires auth)
router.get('/history', protect, getRecommendationHistory);

// Get specific recommendation by ID - requires auth
router.get('/:id', protect, getRecommendationById);

// Get progress on recommendations - requires auth
router.get('/:id/progress', protect, getRecommendationProgress);

// Mark course as completed - requires auth
router.post('/:id/course/:courseIndex/complete', protect, markCourseCompleted);

// Mark project as completed - requires auth
router.post('/:id/project/:projectIndex/complete', protect, markProjectCompleted);

// Submit feedback on recommendations - requires auth
router.post('/:id/feedback', protect, submitFeedback);

export default router;
