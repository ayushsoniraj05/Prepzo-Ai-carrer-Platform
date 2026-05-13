import mongoose from 'mongoose';
import dotenv from 'dotenv';
import InterviewQuestion from '../models/InterviewQuestion.model.js';

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Simulate query for ALL REPOSITORIES + BEGINNER
    const query = {};
    const difficulty = 'Beginner';
    
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

    console.log('Executing Query:', JSON.stringify(query, null, 2));
    const questions = await InterviewQuestion.find(query).sort({ createdAt: -1 });
    console.log('Questions found:', questions.length);
    
    if (questions.length > 0) {
      console.log('First question difficulty:', questions[0].difficulty);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

check();
