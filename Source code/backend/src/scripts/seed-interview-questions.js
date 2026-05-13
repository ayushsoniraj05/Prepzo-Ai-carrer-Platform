import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import InterviewQuestion from '../models/InterviewQuestion.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const NEW_BANK_PATH = path.join(__dirname, '../../../question_bank.json');
const OLD_BANK_PATH = path.join(__dirname, '../../../frontend/src/data/interview_questions_bank.json');

const seedInterviewQuestions = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not found in .env');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Database:', mongoose.connection.name);
    console.log('Connected to Host:', mongoose.connection.host);

    // Clear existing interview questions
    await InterviewQuestion.deleteMany({});
    console.log('Cleared existing interview questions');

    const questionsToInsert = [];

    // 1. Process New Question Bank
    if (fs.existsSync(NEW_BANK_PATH)) {
      console.log('Processing new question bank...');
      const newData = JSON.parse(fs.readFileSync(NEW_BANK_PATH, 'utf8'));
      const categories = newData.question_bank.categories;

      for (const [categoryName, subSkills] of Object.entries(categories)) {
        for (const [subSkillName, questions] of Object.entries(subSkills)) {
          for (const q of questions) {
            questionsToInsert.push({
              questionId: q.id,
              category: categoryName,
              subSkill: subSkillName,
              question: q.question,
              answer: q.answer,
              difficulty: q.difficulty.toLowerCase(),
              keywords: [] // New bank doesn't have keywords
            });
          }
        }
      }
    }

    // 2. Process Old Question Bank (Migration)
    if (fs.existsSync(OLD_BANK_PATH)) {
      console.log('Processing old question bank for migration...');
      const oldData = JSON.parse(fs.readFileSync(OLD_BANK_PATH, 'utf8'));
      const bank = oldData.questionsBank;

      const processOldGroup = (group, categoryName) => {
        if (!group) return;
        for (const [skillKey, data] of Object.entries(group)) {
          const subSkillName = data.skillName || data.fieldName || skillKey;
          if (data.questions) {
            for (const q of data.questions) {
              // Avoid duplicates if IDs overlap
              if (!questionsToInsert.find(existing => existing.questionId === q.id)) {
                questionsToInsert.push({
                  questionId: q.id,
                  category: categoryName,
                  subSkill: subSkillName,
                  question: q.question,
                  answer: q.expectedAnswer || q.answer,
                  difficulty: q.difficulty.toLowerCase(),
                  keywords: q.keywords || []
                });
              }
            }
          }
        }
      };

      processOldGroup(bank.technicalSkills, 'Technical Skills');
      processOldGroup(bank.nonTechnicalSkills, 'Non-Technical Skills');
      processOldGroup(bank.fieldSpecific, 'Field Specific');
    }

    if (questionsToInsert.length > 0) {
      console.log(`📦 Final count to insert: ${questionsToInsert.length}`);
      await InterviewQuestion.insertMany(questionsToInsert);
      console.log(`✅ Successfully seeded ${questionsToInsert.length} unique interview questions`);
    } else {
      console.log('⚠️ No questions found to seed. Check your JSON files.');
    }

    const finalCount = await InterviewQuestion.countDocuments();
    console.log(`📊 Current total in database: ${finalCount}`);
    
    console.log('✨ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedInterviewQuestions();
