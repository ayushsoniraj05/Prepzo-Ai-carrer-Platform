import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import InterviewQuestion from '../models/InterviewQuestion.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const checkAggregation = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    console.log('Running aggregation...');
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
    
    console.log('Aggregation Results:', JSON.stringify(categories, null, 2));
    
    const count = await InterviewQuestion.countDocuments();
    console.log('Total Documents:', count);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkAggregation();
