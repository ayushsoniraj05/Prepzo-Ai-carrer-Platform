import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import InterviewQuestion from '../models/InterviewQuestion.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const checkStrings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB:', mongoose.connection.host);
    
    const count = await InterviewQuestion.countDocuments();
    console.log('Total Questions:', count);
    
    const sample = await InterviewQuestion.findOne();
    if (sample) {
      console.log('Sample Category:', sample.category);
      console.log('Sample SubSkill:', sample.subSkill);
    }
    
    const allCategories = await InterviewQuestion.distinct('category');
    console.log('Categories in DB:', JSON.stringify(allCategories));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkStrings();
