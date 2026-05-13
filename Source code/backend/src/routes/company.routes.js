/**
 * Company Routes
 * Routes for company directory and management
 */

import express from 'express';
import { protect, optionalAuth, authorize } from '../middleware/auth.middleware.js';
import {
  getCompanies,
  getCompanyById,
  suggestCompany,
  toggleFollowCompany,
  getFollowedCompanies,
  getFeaturedCompanies,
  getHiringCompanies,
  getIndustries,
  createCompany,
  updateCompany,
  deleteCompany,
  getPendingCompanies,
  approveCompany,
  rejectCompany,
} from '../controllers/company.controller.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getCompanies);
router.get('/featured', getFeaturedCompanies);
router.get('/hiring', getHiringCompanies);
router.get('/industries', getIndustries);
router.get('/:identifier', optionalAuth, getCompanyById);

// Authenticated routes
router.post('/suggest', protect, suggestCompany);
router.post('/:id/follow', protect, toggleFollowCompany);
router.get('/user/following', protect, getFollowedCompanies);

// Admin routes
router.post('/', protect, authorize('admin'), createCompany);
router.put('/:id', protect, authorize('admin'), updateCompany);
router.delete('/:id', protect, authorize('admin'), deleteCompany);
router.get('/admin/pending', protect, authorize('admin'), getPendingCompanies);
router.put('/:id/approve', protect, authorize('admin'), approveCompany);
router.put('/:id/reject', protect, authorize('admin'), rejectCompany);

export default router;
