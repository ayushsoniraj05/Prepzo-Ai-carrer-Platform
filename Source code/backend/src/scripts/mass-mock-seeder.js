import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import ModuleSeeder from '../models/ModuleSeeder.model.js';
import Question from '../models/Question.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const TARGET_COUNT = 300;
const BATCH_SIZE = 1000;

// Generic templates that can adapt to any field and role
const generateMockQuestions = (module, count) => {
  const questions = [];
  const difficulties = ['easy', 'medium', 'hard', 'advanced'];
  
  for (let i = 0; i < count; i++) {
    const diff = difficulties[i % 4];
    questions.push({
      moduleId: module.moduleId,
      field: module.field,
      targetRole: module.targetRole,
      type: 'mcq',
      questionText: `[${module.field} - ${module.targetRole}] Concept Validation Question #${i + 1}: Which of the following best describes the optimal approach for this scenario?`,
      options: [
        `Standard industry approach for ${module.targetRole}`,
        `Deprecated legacy method`,
        `Experimental unproven technique`,
        `Incorrect methodology`
      ],
      correctAnswer: `Standard industry approach for ${module.targetRole}`,
      explanation: `This is the industry standard practice for ${module.targetRole} in the ${module.field} field.`,
      difficulty: diff,
      topics: ['Core Concepts', 'Best Practices'],
      metadata: {
        generatedBy: 'mass_mock_seeder',
        modelUsed: 'mock-generator',
        seed: 'bulk-static'
      }
    });
  }
  return questions;
};

async function runMassSeeder() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const modules = await ModuleSeeder.find({ questionCount: { $lt: TARGET_COUNT } });
    console.log(`Found ${modules.length} modules needing questions to reach ${TARGET_COUNT}.`);
    
    let totalInserted = 0;
    
    for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        const needed = TARGET_COUNT - module.questionCount;
        
        if (needed <= 0) continue;
        
        const newQuestions = generateMockQuestions(module, needed);
        
        // Insert in bulk
        await Question.insertMany(newQuestions);
        
        // Update module
        module.questionCount += needed;
        module.status = module.questionCount >= 1000 ? 'completed' : 'pending';
        module.lastSeededAt = new Date();
        await module.save();
        
        totalInserted += needed;
        
        if (i % 100 === 0) {
            console.log(`Progress: Processed ${i}/${modules.length} modules. Inserted ${totalInserted} questions. (Current: ${module.moduleId})`);
        }
    }
    
    console.log(`\n✅ MASS SEEDING COMPLETE!`);
    console.log(`Successfully generated ${totalInserted} questions!`);
    console.log(`All targeted modules now have at least ${TARGET_COUNT} questions.`);
    process.exit(0);
  } catch (error) {
    console.error('Error during mass seeding:', error);
    process.exit(1);
  }
}

runMassSeeder();
