import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
import Note from './src/models/Note.model.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const notes = await Note.find({}).limit(5);
  console.log(JSON.stringify(notes, null, 2));
  process.exit(0);
}
check();
