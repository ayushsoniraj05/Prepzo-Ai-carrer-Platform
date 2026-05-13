import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import InterviewQuestion from './src/models/InterviewQuestion.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function check() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');
    console.log('Using collection:', InterviewQuestion.collection.name);
    
    const count = await InterviewQuestion.countDocuments({});
    console.log('Total Interview Questions in DB:', count);
    
    const stats = await InterviewQuestion.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    console.log('Stats per category:', stats);
    
    const categories = await InterviewQuestion.distinct('category');
    console.log('Categories:', categories);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

check();
