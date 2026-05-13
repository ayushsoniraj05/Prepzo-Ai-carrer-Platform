import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mongoServer = null;

/**
 * Auto-seed interview questions if the collection is empty.
 * This ensures production (Render) always has data without manual scripts.
 */
const autoSeedInterviewQuestions = async () => {
  try {
    const InterviewQuestion = (await import('../models/InterviewQuestion.model.js')).default;
    const existingCount = await InterviewQuestion.countDocuments();
    
    if (existingCount > 0) {
      console.log(`📊 Interview questions already present: ${existingCount} documents. Skipping seed.`);
      return;
    }

    console.log('🌱 No interview questions found. Auto-seeding from question_bank.json...');
    
    const questionsToInsert = [];

    // 1. Process New Question Bank
    const NEW_BANK_PATH = path.join(__dirname, '../../../question_bank.json');
    if (fs.existsSync(NEW_BANK_PATH)) {
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
              difficulty: (q.difficulty || 'medium').toLowerCase(),
              keywords: []
            });
          }
        }
      }
    }

    // 2. Process Old Question Bank (Migration)
    const OLD_BANK_PATH = path.join(__dirname, '../../../frontend/src/data/interview_questions_bank.json');
    if (fs.existsSync(OLD_BANK_PATH)) {
      const oldData = JSON.parse(fs.readFileSync(OLD_BANK_PATH, 'utf8'));
      const bank = oldData.questionsBank;

      const processOldGroup = (group, categoryName) => {
        if (!group) return;
        for (const [skillKey, data] of Object.entries(group)) {
          const subSkillName = data.skillName || data.fieldName || skillKey;
          if (data.questions) {
            for (const q of data.questions) {
              if (!questionsToInsert.find(existing => existing.questionId === q.id)) {
                questionsToInsert.push({
                  questionId: q.id,
                  category: categoryName,
                  subSkill: subSkillName,
                  question: q.question,
                  answer: q.expectedAnswer || q.answer,
                  difficulty: (q.difficulty || 'medium').toLowerCase(),
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
      await InterviewQuestion.insertMany(questionsToInsert);
      console.log(`✅ Auto-seeded ${questionsToInsert.length} interview questions successfully!`);
    } else {
      console.warn('⚠️ No question bank JSON files found to seed from.');
    }
  } catch (err) {
    console.warn('⚠️ Auto-seed interview questions failed:', err.message);
  }
};

/**
 * Auto-seed study notes if the collection is empty.
 */
const autoSeedNotes = async () => {
  try {
    const Note = (await import('../models/Note.model.js')).default;
    const existingCount = await Note.countDocuments();
    
    // Check if we have old dummy data (titles containing "Comprehensive Guide Part")
    const hasOldData = await Note.findOne({ title: /Comprehensive Guide Part/i });
    
    if (existingCount > 0 && !hasOldData) {
      console.log(`📊 Study notes already present: ${existingCount} documents. Skipping seed.`);
      return;
    }

    if (hasOldData) {
      console.log('🧹 Old dummy notes detected. Clearing and re-seeding with real HTML content...');
      await Note.deleteMany({});
    } else {
      console.log('🌱 No study notes found. Auto-seeding from question_bank.json...');
    }
    const { v4: uuidv4 } = await import('uuid');
    
    const notesToInsert = [];
    const NEW_BANK_PATH = path.join(__dirname, '../../../question_bank.json');

    const generateNoteHTML = (skill, difficulty) => {
      const levelLabel = difficulty === 'beginner' ? 'Introduction & Fundamentals' : difficulty === 'intermediate' ? 'Core Concepts & Applications' : 'Advanced Topics & Problem Solving';
      return `<h1>${skill} — ${levelLabel}</h1><p>Comprehensive ${difficulty} level study notes for <strong>${skill}</strong>. These notes cover essential concepts, principles, and applications needed for interview preparation.</p><div class="key-concept"><h3>📚 What You Will Learn</h3><ul><li>Core definitions and terminology</li><li>Key principles and theorems</li><li>Problem-solving techniques</li><li>Interview-relevant concepts</li></ul></div><hr/><h2>Key Concepts</h2><p>This section covers the fundamental building blocks of ${skill} that every student must master.</p><div class="tip-box"><strong>💡 Study Tip:</strong> Focus on understanding the underlying principles rather than memorizing formulas. This will help you tackle unfamiliar problems in interviews.</div>`;
    };

    if (fs.existsSync(NEW_BANK_PATH)) {
      const data = JSON.parse(fs.readFileSync(NEW_BANK_PATH, 'utf8'));
      const categories = data.question_bank.categories;

      for (const [categoryName, subSkills] of Object.entries(categories)) {
        for (const subSkillName of Object.keys(subSkills)) {
          for (let i = 1; i <= 3; i++) {
            const difficulties = ['beginner', 'intermediate', 'advanced'];
            const difficulty = difficulties[i - 1];
            
            notesToInsert.push({
              noteId: uuidv4(),
              title: `${subSkillName} — ${difficulty === 'beginner' ? 'Fundamentals' : difficulty === 'intermediate' ? 'Core Concepts' : 'Advanced Guide'}`,
              category: categoryName,
              subSkill: subSkillName,
              summary: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} level study notes covering ${subSkillName}. Ideal for interview preparation.`,
              content: generateNoteHTML(subSkillName, difficulty),
              difficulty: difficulty,
              readTimeMinutes: difficulty === 'beginner' ? 8 : difficulty === 'intermediate' ? 12 : 18,
              tags: [subSkillName.toLowerCase().replace(/ /g, '-'), 'study-material', 'interview-prep', difficulty]
            });
          }
        }
      }
    }

    if (notesToInsert.length > 0) {
      await Note.insertMany(notesToInsert);
      console.log(`✅ Auto-seeded ${notesToInsert.length} study notes successfully!`);
    } else {
      console.warn('⚠️ No subskills found to generate notes for.');
    }
  } catch (err) {
    console.warn('⚠️ Auto-seed study notes failed:', err.message);
  }
};

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;
    
    // In development, use in-memory MongoDB if local connection fails
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log(`🔍 Attempting to connect to MongoDB: ${mongoUri.split('@')[1] || mongoUri}`);
        // Try connecting to the configured URI first
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
        // Auto-seed if empty
        await autoSeedInterviewQuestions();
        await autoSeedNotes();
        return;
      } catch (localError) {
        console.warn(`⚠️ Connection to ${mongoUri.split('@')[1] || 'remote'} failed, starting in-memory server...`);
        console.warn(`Details: ${localError.message}`);
        
        try {
          // Dynamically import mongodb-memory-server
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          mongoServer = await MongoMemoryServer.create({
            instance: {
              dbName: 'prepzo'
            }
          });
          mongoUri = mongoServer.getUri();
          console.log(`📦 In-memory MongoDB started at: ${mongoUri}`);
          
          await mongoose.connect(mongoUri);
          console.log(`✅ Connected to In-memory MongoDB`);
          
          // Auto-seed the in-memory DB
          await autoSeedInterviewQuestions();
          await autoSeedNotes();
          return;
        } catch (memError) {
          console.error(`❌ Failed to start In-memory MongoDB: ${memError.message}`);
          // Fall through to final catch
        }
      }
    }
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    // Auto-seed if empty (critical for Render/production)
    await autoSeedInterviewQuestions();
    await autoSeedNotes();
  } catch (error) {
    console.error(`❌ Critical MongoDB Connection Error: ${error.message}`);
    console.error(`NODE_ENV is ${process.env.NODE_ENV}`);
    // Only exit in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️ Server will continue in a degraded state (No DB)');
    }
  }
};

// Cleanup function for graceful shutdown
export const closeDB = async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

export default connectDB;
