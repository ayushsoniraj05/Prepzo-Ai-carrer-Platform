/**
 * Job Routes
 * Handles job portal endpoints
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  searchJobs,
  getJobById,
  toggleSaveJob,
  getSavedJobs,
  updateSavedJob,
  getJobsByCompany,
  getJobRecommendations,
  getTrendingJobs,
  getUrgentJobs,
  getJobFilters,
  createJob,
  updateJob,
  deleteJob,
  getAllJobsAdmin,
  approveJob,
} from '../controllers/job.controller.js';

const router = express.Router();

// Public routes
router.get('/filters', getJobFilters);
router.get('/trending', getTrendingJobs);
router.get('/urgent', getUrgentJobs);
router.get('/company/:companyId', getJobsByCompany);
router.get('/search', searchJobs);
router.get('/:id', getJobById);
router.get('/', searchJobs);

// Authenticated routes
router.use(protect);

router.get('/user/saved', getSavedJobs);
router.get('/user/recommendations', getJobRecommendations);
router.post('/:id/save', toggleSaveJob);
router.put('/saved/:id', updateSavedJob);

// Admin routes
router.use(authorize('admin'));

router.get('/admin/all', getAllJobsAdmin);
router.put('/:id/approve', approveJob);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

export default router;
