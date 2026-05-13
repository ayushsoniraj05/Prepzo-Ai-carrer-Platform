import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Note from './src/models/Note.model.js';

const SOURCE_DIR = 'C:\\ai-career-platform-development\\uploads\\Notes';
const DEST_DIR = path.join(__dirname, 'uploads', 'notes');

const CATEGORY_MAPPING = {
  "Business Strategy": "Business & Management",
  "CAD Fundamentals": "Mechanical & Civil",
  "Circuit Analysis": "Electrical & Electronics",
  "Computer Architecture": "Computer Science Fundamentals",
  "Control Systems": "Electrical & Electronics",
  "Corporate Ethics": "Business & Management",
  "Data Interpretation": "Aptitude & Reasoning",
  "Data Structure and Algorithim": "Computer Science Fundamentals",
  "DataBase Managment System": "Computer Science Fundamentals",
  "Digital Logic": "Electrical & Electronics",
  "Financial Accounting": "Business & Management",
  "Fluid Mechanics": "Mechanical & Civil",
  "Logical Reasoning": "Aptitude & Reasoning",
  "Marketing": "Business & Management",
  "Materials Science": "Mechanical & Civil",
  "Microcontrollers & Embedded Systems": "Electrical & Electronics",
  "Network": "Computer Science Fundamentals",
  "OOPs": "Computer Science Fundamentals",
  "Operating System": "Computer Science Fundamentals",
  "Operations & Supply Chain": "Business & Management",
  "Quantitative Aptitude": "Aptitude & Reasoning",
  "SDLC and Agile": "Computer Science Fundamentals",
  "Signal Processing": "Electrical & Electronics",
  "Structural Analysis": "Mechanical & Civil",
  "Thermodynamics": "Mechanical & Civil",
  "Verbal Communication": "Aptitude & Reasoning"
};

const SUBSKILL_NAME_MAPPING = {
  "Data Structure and Algorithim": "Data Structures & Algorithms",
  "DataBase Managment System": "Database Management & SQL",
  "Network": "Networking",
  "OOPs": "Object-Oriented Programming",
  "Operating System": "Operating Systems",
  "SDLC and Agile": "SDLC & Agile"
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create destination directory if it doesn't exist
    if (!fs.existsSync(DEST_DIR)) {
      fs.mkdirSync(DEST_DIR, { recursive: true });
      console.log(`📁 Created destination directory: ${DEST_DIR}`);
    }

    // Clear existing notes
    await Note.deleteMany({});
    console.log('🗑️  Cleared existing notes');

    const folders = fs.readdirSync(SOURCE_DIR);
    const notesToInsert = [];

    for (const folderName of folders) {
      const sourceFolderPath = path.join(SOURCE_DIR, folderName);
      if (!fs.statSync(sourceFolderPath).isDirectory()) continue;

      const category = CATEGORY_MAPPING[folderName] || "General";
      const subSkill = SUBSKILL_NAME_MAPPING[folderName] || folderName;

      const files = fs.readdirSync(sourceFolderPath);
      const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));

      console.log(`Processing folder: ${folderName} -> ${subSkill} (${pdfFiles.length} PDFs)`);

      for (let i = 0; i < pdfFiles.length; i++) {
        const fileName = pdfFiles[i];
        const sourceFilePath = path.join(sourceFolderPath, fileName);
        
        // Create a unique filename for the destination
        const fileExt = path.extname(fileName);
        const destinationFileName = `${uuidv4()}${fileExt}`;
        const destinationFilePath = path.join(DEST_DIR, destinationFileName);

        // Copy file
        fs.copyFileSync(sourceFilePath, destinationFilePath);

        // Determine difficulty (cycling through them if multiple files)
        const diffs = ['beginner', 'intermediate', 'advanced'];
        const difficulty = diffs[i % 3];

        notesToInsert.push({
          noteId: uuidv4(),
          title: `${subSkill} - ${path.parse(fileName).name}`,
          category: category,
          subSkill: subSkill,
          summary: `Professional study material for ${subSkill}. High-quality PDF guide covering essential concepts and practical applications.`,
          content: `/uploads/notes/${destinationFileName}`, // Store relative path for frontend
          difficulty: difficulty,
          readTimeMinutes: 10 + (i * 5),
          tags: [subSkill.toLowerCase().replace(/ /g, '-'), 'pdf', 'study-material']
        });
      }
    }

    if (notesToInsert.length > 0) {
      await Note.insertMany(notesToInsert);
      console.log(`🚀 Successfully seeded ${notesToInsert.length} notes with PDF links!`);
    } else {
      console.warn('⚠️ No PDF notes found to seed.');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
