import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  startInterview,
  submitAnswer,
  getInterviewResults
} from '../controllers/interview.controller.js';

const router = express.Router();

// All interview routes require authentication
router.use(protect);

/**
 * @desc    Start a new AI mock interview session based on resume
 * @route   POST /api/interview/start
 */
router.post('/start', startInterview);

/**
 * @desc    Submit an answer to the current interview question
 * @route   POST /api/interview/submit
 */
router.post('/submit', submitAnswer);

/**
 * @desc    Get the final results of an interview session
 * @route   GET /api/interview/results/:sessionId
 */
router.get('/results/:sessionId', getInterviewResults);

export default router;
