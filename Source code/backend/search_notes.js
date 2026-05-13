import mongoose from 'mongoose';
import Note from './src/models/Note.model.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const notes = await Note.find({ title: /Data Structures/i });
    console.log('Found notes:', JSON.stringify(notes, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

check();
