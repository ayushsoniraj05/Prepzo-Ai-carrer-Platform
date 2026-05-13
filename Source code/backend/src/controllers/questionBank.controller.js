import InterviewQuestion from '../models/InterviewQuestion.model.js';
import catchAsync from '../utils/catchAsync.js';

/**
 * @desc    Get all categories and sub-skills for filtering
 * @route   GET /api/question-bank/categories
 * @access  Private
 */
export const getCategories = catchAsync(async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  console.log('Fetching categories for question bank...');
  console.log('Using collection:', InterviewQuestion.collection.name);
  console.time('getCategories');
  const categories = await InterviewQuestion.aggregate([
    {
      $group: {
        _id: '$category',
        subSkills: { $addToSet: '$subSkill' }
      }
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        subSkills: 1
      }
    },
    { $sort: { category: 1 } }
  ]);
  const totalQuestions = await InterviewQuestion.countDocuments();
  console.timeEnd('getCategories');
  console.log(`📊 Category Aggregation found ${categories.length} entries. Total questions: ${totalQuestions}`);
  
  if (categories.length === 0 && totalQuestions > 0) {
    console.warn('⚠️ Questions exist but aggregation returned no categories. Checking first 5 documents:');
    const samples = await InterviewQuestion.find({}).limit(5);
    samples.forEach((s, i) => console.log(`  Sample ${i+1}: ID=${s.questionId}, Cat=${s.category}, Skill=${s.subSkill}`));
  } else if (categories.length === 0) {
    console.log(`❌ DB Collection check: ${totalQuestions} total documents in InterviewQuestion.`);
  }

  res.status(200).json({
    status: 'success',
    totalQuestions,
    data: categories
  });
});

/**
 * @desc    Get questions based on filters
 * @route   GET /api/question-bank/questions
 * @access  Private
 */
export const getQuestions = catchAsync(async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  const { category, subSkill, difficulty, search, limit } = req.query;

  const query = {};

  if (category) query.category = category;
  if (subSkill) query.subSkill = subSkill;
  if (difficulty) {
    const diff = difficulty.toLowerCase();
    if (diff === 'beginner' || diff === 'easy') {
      query.difficulty = { $in: ['beginner', 'easy'] };
    } else if (diff === 'intermediate' || diff === 'medium') {
      query.difficulty = { $in: ['intermediate', 'medium'] };
    } else if (diff === 'advanced' || diff === 'hard') {
      query.difficulty = { $in: ['advanced', 'hard'] };
    } else {
      query.difficulty = diff;
    }
  }
  
  if (search) {
    query.$or = [
      { question: { $regex: search, $options: 'i' } },
      { answer: { $regex: search, $options: 'i' } },
      { keywords: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  console.log('🔍 Executing Question Query:', JSON.stringify(query, null, 2));

  let mongoQuery = InterviewQuestion.find(query).sort({ createdAt: -1 });
  
  if (limit) {
    mongoQuery = mongoQuery.limit(parseInt(limit));
  }

  const questions = await mongoQuery;

  console.log(`✅ Found ${questions.length} questions matching query.`);

  if (questions.length === 0) {
    const totalDocs = await InterviewQuestion.countDocuments();
    console.log(`❌ Empty result. Collection check: ${totalDocs} total documents.`);
  }

  res.status(200).json({
    status: 'success',
    results: questions.length,
    data: questions
  });
});
