import express from 'express';
import { getPublicStats } from '../controllers/public.controller.js';

const router = express.Router();

// @desc    Get public platform statistics
// @route   GET /api/public/stats
// @access  Public
router.get('/stats', getPublicStats);

export default router;
