import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import ModuleSeeder from '../models/ModuleSeeder.model.js';
import Question from '../models/Question.model.js';
import aiService from '../services/aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const CONCURRENCY = 3; // Number of modules to seed in parallel
const TARGET_COUNT = 1000;
const BATCH_SIZE = 20; // Python service limit is 25

async function seedModule(module) {
  console.log(`[SEED] Starting module: ${module.moduleId} (${module.questionCount}/${TARGET_COUNT})`);
  
  while (module.questionCount < TARGET_COUNT) {
    try {
      const studentProfile = {
        id: 'turbo_seeder_bot',
        name: 'Turbo Seeder',
        stream: String(module.field || 'Computer Science'),
        targetRole: String(module.targetRole || 'Software Engineer'),
        fieldOfStudy: String(module.field || 'Computer Science'),
        degree: 'B.Tech',
        year: '4',
        knownTechnologies: []
      };

      const remaining = TARGET_COUNT - module.questionCount;
      const count = Math.min(BATCH_SIZE, remaining);

      console.log(`  -> Generating ${count} questions for ${module.moduleId}...`);
      
      const aiResponse = await aiService.generateAITest(studentProfile, { 
        questionCount: count,
        isSeedingTask: true 
      });

      if (!aiResponse || !aiResponse.test || !aiResponse.test.sections || !aiResponse.test.sections[0].questions) {
        console.error(`  [!] AI returned invalid response for ${module.moduleId}`);
        break;
      }

      const aiQs = aiResponse.test.sections[0].questions;
      const questionsToInsert = aiQs.map(q => ({
        moduleId: module.moduleId,
        field: module.field,
        targetRole: module.targetRole,
        type: q.type || 'mcq',
        questionText: q.question || q.questionText,
        options: q.options || [],
        correctAnswer: q.correct !== undefined ? q.correct : q.correctAnswer,
        explanation: q.explanation || 'Seeded explanation',
        difficulty: q.difficulty || 'medium',
        topics: q.topics || [],
        metadata: {
          generatedBy: 'turbo_seeder',
          timestamp: new Date()
        }
      }));

      const results = await Question.insertMany(questionsToInsert);
      
      module.questionCount += results.length;
      module.lastSeededAt = new Date();
      module.status = module.questionCount >= TARGET_COUNT ? 'completed' : 'active';
      await module.save();

      console.log(`  [+] Success: ${results.length} added. Total: ${module.questionCount}/${TARGET_COUNT}`);
      
      // Small delay between batches for the same module to avoid AI overload
      await new Promise(r => setTimeout(r, 2000));
      
    } catch (error) {
      console.error(`  [!] Error seeding ${module.moduleId}:`, error.message);
      // Wait longer on error
      await new Promise(r => setTimeout(r, 10000));
    }
  }
}

async function startSeeding() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not found');

    await mongoose.connect(mongoUri);
    console.log('🚀 Accelerated Seeder Connected to MongoDB');

    while (true) {
      // Find modules that need questions
      const modules = await ModuleSeeder.find({
        questionCount: { $lt: TARGET_COUNT }
      })
      .sort({ priority: -1, lastSeededAt: 1 })
      .limit(CONCURRENCY);

      if (modules.length === 0) {
        console.log('✅ ALL MODULES FULLY SEEDED!');
        break;
      }

      console.log(`\n📦 Processing parallel batch of ${modules.length} modules...`);
      
      // Run in parallel
      await Promise.all(modules.map(m => seedModule(m)));
      
      console.log('--- Batch Complete ---\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('FATAL ERROR:', error);
    process.exit(1);
  }
}

startSeeding();
