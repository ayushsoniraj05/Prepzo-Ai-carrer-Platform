import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Note from '../models/Note.model.js';
import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const NEW_BANK_PATH = path.join(__dirname, '../../../question_bank.json');
const UPLOADS_DIR = path.join(__dirname, '../../uploads/notes');

const generateNoteHTML = (skill, difficulty) => {
  const levelLabel = difficulty === 'beginner' ? 'Introduction & Fundamentals' : difficulty === 'intermediate' ? 'Core Concepts & Applications' : 'Advanced Topics & Problem Solving';
  
  const sections = [
    {
      title: "1. Core Overview",
      content: `At the ${difficulty} level, <strong>${skill}</strong> focuses on building a solid foundation. Understanding the basic principles, terminology, and architecture is essential for any technical role.`
    },
    {
      title: "2. Key Implementation Patterns",
      content: `In modern development, ${skill} is implemented using standard design patterns. For ${difficulty} level interviews, expect questions on: <ul><li>Best practices for efficient execution</li><li>Common pitfalls and how to avoid them</li><li>Scalability considerations</li></ul>`
    },
    {
      title: "3. Interview Focus Areas",
      content: `Interviewers often test ${skill} by asking for real-world examples. Be prepared to discuss: <ul><li>Memory management and performance</li><li>Security implications</li><li>Comparative analysis with alternative technologies</li></ul>`
    }
  ];

  return `
    <div class="note-container">
      <h1>${skill} — ${levelLabel}</h1>
      <p class="intro-text">Comprehensive ${difficulty} level study notes for <strong>${skill}</strong>. These notes cover essential concepts, principles, and applications needed for interview preparation.</p>
      
      <div class="key-concept">
        <h3>📚 What You Will Learn</h3>
        <ul>
          <li>Core definitions and terminology</li>
          <li>Key principles and theorems</li>
          <li>Problem-solving techniques</li>
          <li>Interview-relevant concepts</li>
        </ul>
      </div>
      
      <hr/>
      
      ${sections.map(s => `
        <section class="note-section">
          <h2>${s.title}</h2>
          <p>${s.content}</p>
        </section>
      `).join('')}
      
      <div class="tip-box">
        <strong>💡 Pro Tip:</strong> Focus on understanding the underlying principles rather than memorizing formulas. This will help you tackle unfamiliar problems in interviews.
      </div>
      
      <div class="summary-box">
        <h3>📝 Summary & Key Takeaways</h3>
        <ul>
          <li>Mastering ${skill} requires both theoretical knowledge and practical application.</li>
          <li>Always consider performance and security trade-offs.</li>
          <li>Review these notes regularly as part of your interview prep routine.</li>
        </ul>
      </div>
    </div>
  `;
};

const seedNotes = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not found in .env');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Database:', mongoose.connection.name);

    await Note.deleteMany({});
    console.log('Cleared existing notes');

    const notesToInsert = [];

    if (fs.existsSync(NEW_BANK_PATH)) {
      console.log('Processing question bank to generate high-quality HTML notes...');
      const data = JSON.parse(fs.readFileSync(NEW_BANK_PATH, 'utf8'));
      const categories = data.question_bank.categories;

      for (const [categoryName, subSkills] of Object.entries(categories)) {
        for (const subSkillName of Object.keys(subSkills)) {
          // Generate 3 notes for each subskill (Beginner, Intermediate, Advanced)
          for (let i = 1; i <= 3; i++) {
            const difficulties = ['beginner', 'intermediate', 'advanced'];
            const difficulty = difficulties[i - 1];
            const noteId = uuidv4();
            
            notesToInsert.push({
              noteId: noteId,
              title: `${subSkillName} — ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Guide`,
              category: categoryName,
              subSkill: subSkillName,
              summary: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} level study material for ${subSkillName}. Covers core concepts, interview patterns, and practical applications.`,
              content: generateNoteHTML(subSkillName, difficulty),
              difficulty: difficulty,
              readTimeMinutes: i * 7,
              tags: [subSkillName.toLowerCase().replace(/ /g, '-'), 'study-material', 'interview-prep', difficulty]
            });
          }
        }
      }
    }

    if (notesToInsert.length > 0) {
      await Note.insertMany(notesToInsert);
      console.log(`✅ Successfully seeded ${notesToInsert.length} HTML study notes!`);
    } else {
      console.log('⚠️ No subskills found to generate notes for.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedNotes();
