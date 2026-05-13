import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import InterviewQuestion from '../models/InterviewQuestion.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const checkDifficulty = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const difficulties = await InterviewQuestion.distinct('difficulty');
    console.log('Difficulties in DB:', difficulties);
    
    const count = await InterviewQuestion.countDocuments();
    console.log('Total Docs:', count);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkDifficulty();
