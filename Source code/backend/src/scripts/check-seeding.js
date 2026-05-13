import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import ModuleSeeder from '../models/ModuleSeeder.model.js';
import Question from '../models/Question.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const totalModules = await ModuleSeeder.countDocuments();
    const completedModules = await ModuleSeeder.countDocuments({ status: 'completed' });
    const pendingModules = await ModuleSeeder.countDocuments({ status: 'pending' });
    const activeModules = await ModuleSeeder.countDocuments({ status: 'active' });
    const failedModules = await ModuleSeeder.countDocuments({ status: 'failed' });
    const totalQuestions = await Question.countDocuments();
    
    console.log('--- SEEDING STATUS ---');
    console.log(`Total Modules Configured: ${totalModules}`);
    console.log(`Completed Modules: ${completedModules}`);
    console.log(`Pending Modules: ${pendingModules}`);
    console.log(`Active (Seeding) Modules: ${activeModules}`);
    console.log(`Failed Modules: ${failedModules}`);
    console.log(`Total Questions in DB: ${totalQuestions}`);
    
    // Check distribution
    const distr = await Question.aggregate([
      { $group: { _id: "$moduleId", count: { $sum: 1 } } },
      { $group: { _id: "$count", numModules: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n--- QUESTIONS PER MODULE DISTRIBUTION ---');
    distr.forEach(d => {
      console.log(`${d.numModules} modules have exactly ${d._id} questions`);
    });
    
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

check();
