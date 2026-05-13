import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Question from '../models/Question.model.js';
import ModuleSeeder from '../models/ModuleSeeder.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB. Cleaning up excess mass_mock_seeder data to free up 512MB quota...');

    // Delete questions seeded by mass_mock_seeder
    const deleteResult = await Question.deleteMany({
      'metadata.generatedBy': 'mass_mock_seeder'
    });

    console.log(`Deleted ${deleteResult.deletedCount} massive mock questions.`);

    // Reset module counts that were bloated by the seeder just now
    await ModuleSeeder.updateMany(
      {},
      { $set: { status: 'pending', questionCount: 0 } }
    );
    console.log('Reset Module Seeder counts.');

    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up:', error);
    process.exit(1);
  }
}

cleanup();
