import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seeder } from '../backend/src/services/autonomousSeeder.service.js';
import User from '../backend/src/models/User.model.js';

dotenv.config();

async function runSeed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prepzo');
    console.log('Connected.');

    // Identify target skills (either from a user or common defaults)
    const skillsToSeed = ['React', 'Node.js', 'Docker', 'Python', 'AWS', 'JavaScript', 'MongoDB', 'SQL', 'Kubernetes'];
    
    console.log(`Targeting ${skillsToSeed.length} skills for seeding...`);

    for (const skill of skillsToSeed) {
      console.log(`Triggering boost for Topic: ${skill}`);
      // field and role are for metadata context in the seeder
      await seeder.boostTopic(skill, 'Computer Science', 'Software Engineer');
    }

    console.log('All seeding jobs queued. The Autonomous Seeder will now process them in the background.');
    console.log('To see progress, check the ModuleSeeder collection in MongoDB.');
    
    // Give it a moment to save jobs
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding Trigger Error:', error);
    process.exit(1);
  }
}

runSeed();
