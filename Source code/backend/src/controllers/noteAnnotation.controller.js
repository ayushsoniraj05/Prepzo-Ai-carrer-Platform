import NoteAnnotation from '../models/NoteAnnotation.model.js';
import catchAsync from '../utils/catchAsync.js';

/**
 * @desc    Get annotations for a specific note
 * @route   GET /api/notes/:noteId/annotations
 * @access  Private
 */
export const getAnnotations = catchAsync(async (req, res) => {
  const { noteId } = req.params;
  const userId = req.user._id;

  const annotation = await NoteAnnotation.findOne({ noteId, userId });

  res.status(200).json({
    status: 'success',
    data: annotation ? annotation.annotations : []
  });
});

/**
 * @desc    Save annotations for a specific note
 * @route   POST /api/notes/:noteId/annotations
 * @access  Private
 */
export const saveAnnotations = catchAsync(async (req, res) => {
  const { noteId } = req.params;
  const { annotations } = req.body;
  const userId = req.user._id;

  const updatedAnnotation = await NoteAnnotation.findOneAndUpdate(
    { noteId, userId },
    { annotations },
    { new: true, upsert: true }
  );

  res.status(200).json({
    status: 'success',
    data: updatedAnnotation.annotations
  });
});
