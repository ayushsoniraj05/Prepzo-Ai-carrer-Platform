import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const InterviewQuestion = mongoose.model('InterviewQuestion', new mongoose.Schema({ 
    difficulty: String,
    category: String,
    subSkill: String
  }));
  
  const difficulties = await InterviewQuestion.aggregate([
    { $group: { _id: '$difficulty', count: { $sum: 1 } } }
  ]);
  
  const categories = await InterviewQuestion.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  console.log('--- DIFFICULTIES ---');
  console.log(difficulties);
  console.log('--- CATEGORIES ---');
  console.log(categories);
  
  process.exit(0);
}

check();
