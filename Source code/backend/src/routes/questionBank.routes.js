import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getCategories,
  getQuestions
} from '../controllers/questionBank.controller.js';

const router = express.Router();

// All question bank routes are now public for better accessibility
// router.use(protect);

/**
 * @desc    Get all categories and sub-skills
 * @route   GET /api/question-bank/categories
 */
router.get('/categories', getCategories);

/**
 * @desc    Get questions with filters
 * @route   GET /api/question-bank/questions
 */
router.get('/questions', getQuestions);

export default router;
