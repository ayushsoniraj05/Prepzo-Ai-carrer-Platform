/**
 * Application Routes
 * Handles job application endpoints
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  applyForJob,
  getUserApplications,
  getApplication,
  withdrawApplication,
  getApplicationStats,
  getCompanyApplications,
  updateApplicationStatus,
  addInterview,
  updateInterview,
  addRecruiterNote,
  extendOffer,
} from '../controllers/application.controller.js';

const router = express.Router();

// All application routes require authentication
router.use(protect);

// User routes
router.post('/', applyForJob);
router.get('/', getUserApplications);
router.get('/stats', getApplicationStats);
router.get('/:id', getApplication);
router.put('/:id/withdraw', withdrawApplication);

// Admin routes
router.use(authorize('admin'));

router.get('/company/:companyId', getCompanyApplications);
router.put('/:id/status', updateApplicationStatus);
router.post('/:id/interview', addInterview);
router.put('/:id/interview/:interviewId', updateInterview);
router.post('/:id/notes', addRecruiterNote);
router.post('/:id/offer', extendOffer);

export default router;
