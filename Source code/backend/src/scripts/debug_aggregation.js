import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env is in the backend/ directory, which is 2 levels up from src/scripts/
dotenv.config({ path: path.join(__dirname, '../../.env') });

const interviewQuestionSchema = new mongoose.Schema({
  category: String,
  subSkill: String,
});

const InterviewQuestion = mongoose.models.InterviewQuestion || mongoose.model('InterviewQuestion', interviewQuestionSchema);

async function debug() {
  if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is not defined in .env');
    process.exit(1);
  }
  
  console.log('Connecting to:', process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@'));
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');
  
  const total = await InterviewQuestion.countDocuments();
  console.log('Total documents in InterviewQuestion:', total);

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

  console.log('Aggregation result length:', categories.length);
  console.log('Aggregation result:', JSON.stringify(categories, null, 2));
  process.exit(0);
}

debug().catch(err => {
  console.error(err);
  process.exit(1);
});
