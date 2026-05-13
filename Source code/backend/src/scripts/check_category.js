import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import InterviewQuestion from '../models/InterviewQuestion.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const checkCategory = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const category = 'Management & Business';
    const subSkill = 'Business Strategy'; // Let's check a sub-skill
    
    const count = await InterviewQuestion.countDocuments({ category });
    console.log(`Questions in ${category}: ${count}`);
    
    const questions = await InterviewQuestion.find({ category }).limit(5);
    console.log('Sample questions:', JSON.stringify(questions, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkCategory();
