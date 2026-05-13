/**
 * AI Mentor Routes
 */

import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  chat,
  getHistory,
  getSessions,
  startInterview,
  explainConcept,
  getStatus
} from '../controllers/mentor.controller.js';

const router = express.Router();

// Public route - check service status
router.get('/status', getStatus);

// Protected routes
router.use(protect);

// Chat with AI mentor
router.post('/chat', chat);

// Get conversation history
router.get('/history/:sessionId', getHistory);

// Get all sessions for user
router.get('/sessions', getSessions);

// Mock interview
router.post('/interview/start', startInterview);

// Concept explanation
router.post('/explain', explainConcept);

export default router;
