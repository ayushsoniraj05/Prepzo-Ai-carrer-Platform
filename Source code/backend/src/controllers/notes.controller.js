import Note from '../models/Note.model.js';
import catchAsync from '../utils/catchAsync.js';

/**
 * @desc    Get all note categories with sub-skills and counts
 * @route   GET /api/notes/categories
 */
export const getNoteCategories = catchAsync(async (req, res) => {
  const categories = await Note.aggregate([
    {
      $group: {
        _id: { category: '$category', subSkill: '$subSkill' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.category',
        subSkills: {
          $push: {
            name: '$_id.subSkill',
            noteCount: '$count'
          }
        },
        totalNotes: { $sum: '$count' }
      }
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        subSkills: 1,
        totalNotes: 1
      }
    },
    { $sort: { category: 1 } }
  ]);

  const totalNotes = await Note.countDocuments();

  res.status(200).json({
    status: 'success',
    totalNotes,
    data: categories
  });
});

/**
 * @desc    Get notes with filters
 * @route   GET /api/notes
 */
export const getNotes = catchAsync(async (req, res) => {
  const { category, subSkill, difficulty, search } = req.query;

  const query = {};
  if (category) query.category = category;
  if (subSkill) query.subSkill = subSkill;
  if (difficulty) query.difficulty = difficulty.toLowerCase();
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { summary: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const notes = await Note.find(query).sort({ category: 1, subSkill: 1, createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: notes.length,
    data: notes
  });
});

/**
 * @desc    Get a single note by ID
 * @route   GET /api/notes/:noteId
 */
export const getNoteById = catchAsync(async (req, res) => {
  const note = await Note.findOne({ noteId: req.params.noteId });

  if (!note) {
    return res.status(404).json({
      status: 'fail',
      message: 'Note not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: note
  });
});
