import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Note from './src/models/Note.model.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NOTES_DIR = path.join(__dirname, '../uploads/Notes');

async function seedNotes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing notes
    await Note.deleteMany({});
    console.log('🗑️ Cleared existing notes');

    const categories = fs.readdirSync(NOTES_DIR);
    let seededCount = 0;

    for (const subSkillDir of categories) {
      const subSkillPath = path.join(NOTES_DIR, subSkillDir);
      
      if (fs.statSync(subSkillPath).isDirectory()) {
        const files = fs.readdirSync(subSkillPath);
        
        for (const file of files) {
          if (file.toLowerCase().endsWith('.pdf')) {
            // Rename file to remove spaces/special chars for web safety
            const safeFileName = file.replace(/[\s&]/g, '_').replace(/_+/g, '_');
            const oldFilePath = path.join(subSkillPath, file);
            const newFilePath = path.join(subSkillPath, safeFileName);
            
            if (oldFilePath !== newFilePath) {
              fs.renameSync(oldFilePath, newFilePath);
            }

            // Also safe subSkillDir
            const safeSubSkillDir = subSkillDir.replace(/[\s&]/g, '_').replace(/_+/g, '_');
            const oldSubSkillPath = path.join(NOTES_DIR, subSkillDir);
            const newSubSkillPath = path.join(NOTES_DIR, safeSubSkillDir);
            
            // Note: We need to handle directory renaming carefully if multiple files exist
            // but for this script we can assume we'll do it once or just use the current name
            
            const relativePath = `/uploads/notes/${subSkillDir}/${safeFileName}`;
            
            const cleanTitle = file.replace('.pdf', '').replace(/[-_]/g, ' ');
            const title = `${subSkillDir} - ${cleanTitle}`;

            const note = new Note({
              noteId: uuidv4(),
              title: title,
              category: getCategoryForSubSkill(subSkillDir),
              subSkill: subSkillDir,
              summary: `Comprehensive study guide for ${subSkillDir}. Detailed concepts, interview questions, and practice examples.`,
              content: relativePath,
              difficulty: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
              readTimeMinutes: Math.floor(Math.random() * 12) + 8,
              tags: [subSkillDir.toLowerCase().replace(/[\s&]+/g, '-'), 'pdf', 'notes']
            });

            await note.save();
            seededCount++;
            console.log(`+ Seeded: ${title}`);
          }
        }
      }
    }

    console.log(`\n🚀 Successfully seeded ${seededCount} notes with web-safe PDF paths!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

function getCategoryForSubSkill(subSkill) {
  const categories = {
    'Computer CS Fundamentals': ['OOPs', 'Operating System', 'DataBase Managment System', 'Computer Architecture', 'Network', 'Digital Logic', 'Data Structure and Algorithim'],
    'Software Engineering': ['SDLC and Agile'],
    'Electronics & Communication': ['Microcontrollers & Embedded Systems', 'Signal Processing', 'Circuit Analysis', 'Control Systems'],
    'Mechanical & Civil': ['Fluid Mechanics', 'Thermodynamics', 'Materials Science', 'CAD Fundamentals', 'Structural Analysis'],
    'Business & Management': ['Marketing', 'Financial Accounting', 'Corporate Ethics', 'Business Strategy', 'Operations & Supply Chain'],
    'Aptitude & Soft Skills': ['Logical Reasoning', 'Quantitative Aptitude', 'Data Interpretation', 'Verbal Communication']
  };

  for (const [category, subSkills] of Object.entries(categories)) {
    if (subSkills.includes(subSkill)) return category;
  }
  return 'General';
}

seedNotes();
