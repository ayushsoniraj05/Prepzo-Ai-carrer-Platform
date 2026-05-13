/**
 * AI Dashboard Routes
 * 
 * Routes for AI monitoring, testing, and management dashboard.
 * All routes require admin authentication.
 */

import express from 'express';
import aiDashboard from '../controllers/aiDashboard.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// =============================================================================
// DASHBOARD ROUTES
// =============================================================================

// Get comprehensive dashboard data
router.get('/dashboard', protect, admin, aiDashboard.getDashboard);

// Health check (public for monitoring systems)
router.get('/health', aiDashboard.getHealth);

// =============================================================================
// ALERT ROUTES
// =============================================================================

// Get all alerts
router.get('/alerts', protect, admin, aiDashboard.getAlerts);

// Acknowledge an alert
router.patch('/alerts/:alertId/acknowledge', protect, admin, aiDashboard.acknowledgeAlert);

// =============================================================================
// PERFORMANCE ROUTES
// =============================================================================

// Get performance logs
router.get('/performance/logs', protect, admin, aiDashboard.getPerformanceLogs);

// Get performance trends
router.get('/performance/trends', protect, admin, aiDashboard.getPerformanceTrends);

// =============================================================================
// RECOMMENDATION TRACKING ROUTES
// =============================================================================

// Get recommendation effectiveness stats
router.get('/recommendations/stats', protect, admin, aiDashboard.getRecommendationStats);

// Track recommendation interaction (user route)
router.post('/recommendations/track', protect, aiDashboard.trackRecommendation);

// =============================================================================
// MODEL VERSION ROUTES
// =============================================================================

// Get all model versions
router.get('/models', protect, admin, aiDashboard.getModelVersions);

// Register new model version
router.post('/models', protect, admin, aiDashboard.registerModelVersion);

// Activate a model version
router.patch('/models/:version/activate', protect, admin, aiDashboard.activateModelVersion);

// Rollback to previous version
router.post('/models/rollback', protect, admin, aiDashboard.rollbackModel);

// =============================================================================
// TESTING ROUTES
// =============================================================================

// Run validation tests
router.get('/tests/validation', protect, admin, aiDashboard.runValidationTests);

// Run full test suite
router.get('/tests/full', protect, admin, aiDashboard.runFullTestSuite);

// Get test cases
router.get('/tests/cases', protect, admin, aiDashboard.getTestCases);

// =============================================================================
// VALIDATION ROUTES
// =============================================================================

// Get validation configuration
router.get('/validation/config', protect, admin, aiDashboard.getValidationConfig);

// Validate a sample response
router.post('/validation/test', protect, admin, aiDashboard.validateSampleResponse);

export default router;
