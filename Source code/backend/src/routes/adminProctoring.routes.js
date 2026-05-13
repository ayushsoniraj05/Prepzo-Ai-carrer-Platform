/**
 * Admin Proctoring Routes
 * Routes for admin monitoring and management of proctored tests
 */

import express from 'express';
import {
  getLiveTests,
  getLiveSessionDetails,
  getAllViolations,
  getSessionViolations,
  terminateSession,
  allowRetest,
  getAdminTestResults,
  getProctoringStats,
  getStudentTestHistory
} from '../controllers/adminProctoring.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(admin);

// ===== LIVE MONITORING =====

// Get all currently active test sessions
router.get('/live', getLiveTests);

// Get live updates for a specific session
router.get('/live/:sessionId', getLiveSessionDetails);

// ===== VIOLATION MANAGEMENT =====

// Get all violations with filtering
router.get('/violations', getAllViolations);

// Get violations for a specific session
router.get('/violations/:sessionId', getSessionViolations);

// ===== TEST MANAGEMENT =====

// Terminate a test session
router.post('/:sessionId/terminate', terminateSession);

// Allow a student to retest
router.post('/:sessionId/allow-retest', allowRetest);

// Get detailed test results for admin review
router.get('/results/:sessionId', getAdminTestResults);

// ===== STATISTICS =====

// Get proctoring statistics dashboard
router.get('/stats', getProctoringStats);

// Get student's test history (admin view)
router.get('/student/:userId/history', getStudentTestHistory);

export default router;
