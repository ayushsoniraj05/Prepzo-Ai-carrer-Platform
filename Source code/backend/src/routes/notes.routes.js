import express from 'express';
import {
  getNoteCategories,
  getNotes,
  getNoteById
} from '../controllers/notes.controller.js';

import { protect } from '../middleware/auth.middleware.js';
import {
  getAnnotations,
  saveAnnotations
} from '../controllers/noteAnnotation.controller.js';

const router = express.Router();

// Public routes
router.get('/categories', getNoteCategories);
router.get('/', getNotes);
router.get('/:noteId', getNoteById);

// Protected annotation routes
router.get('/:noteId/annotations', protect, getAnnotations);
router.post('/:noteId/annotations', protect, saveAnnotations);

export default router;
