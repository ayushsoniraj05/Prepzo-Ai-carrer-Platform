import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ModuleSeeder from '../models/ModuleSeeder.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prepzo';

// Data from SearchableDropdown.tsx
const allFields = [
  // Engineering
  'Computer Science & Engineering', 'Information Technology', 'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering', 'Electrical Engineering', 'Mechanical Engineering',
  'Civil Engineering', 'Chemical Engineering', 'Aerospace Engineering', 'Biotechnology',
  'Automobile Engineering', 'Industrial Engineering', 'Metallurgical Engineering',
  'Mining Engineering', 'Textile Engineering', 'Production Engineering', 'Instrumentation Engineering',
  'Artificial Intelligence & Machine Learning', 'Data Science & Engineering', 'Robotics & Automation',
  'Mechatronics Engineering',
  
  // Science
  'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Zoology', 'Botany', 'Microbiology',
  'Biochemistry', 'Biotechnology', 'Statistics', 'Environmental Science', 'Geology', 'Forensic Science',
  
  // Computer / IT
  'Computer Science', 'Software Development', 'Web Development', 'Mobile App Development',
  'Database Management', 'Computer Networks', 'Cyber Security', 'Cloud Computing',
  'Artificial Intelligence & ML', 'Data Analytics',
  
  // Commerce
  'Accounting & Finance', 'Taxation', 'Banking & Insurance', 'Economics', 'Commerce (General)',
  'Cost Accounting', 'Auditing',
  
  // Management
  'Marketing Management', 'Finance', 'Human Resource Management', 'Operations Management',
  'IT Management', 'International Business', 'Entrepreneurship', 'Supply Chain Management',
  'Healthcare Management', 'Business Analytics', 'Retail Management',
  
  // Arts
  'English Literature', 'Hindi Literature', 'History', 'Political Science', 'Sociology',
  'Psychology', 'Philosophy', 'Geography', 'Economics', 'Journalism & Mass Communication',
  'Public Administration',
  
  // Design
  'Fashion Design', 'Interior Design', 'Graphic Design', 'Product Design', 'UI/UX Design',
  'Animation & VFX', 'Textile Design', 'Game Design',
  
  // Law
  'Corporate Law', 'Criminal Law', 'Constitutional Law', 'Civil Law', 'Intellectual Property Law',
  'International Law', 'Cyber Law',
  
  // Medical
  'General Medicine', 'Surgery', 'Pediatrics', 'Orthopedics', 'Cardiology', 'Dermatology',
  'Radiology', 'Psychiatry',
  
  // Pharmacy
  'Pharmaceutics', 'Pharmacology', 'Pharmaceutical Chemistry', 'Pharmacognosy', 'Clinical Pharmacy',
  
  // Architecture
  'Architecture', 'Urban Planning', 'Landscape Architecture', 'Sustainable Architecture'
];

const allRoles = [
  'Software Development Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'DevOps Engineer', 'Cloud Engineer', 'Security Engineer', 'QA / Automation Engineer',
  'Data Scientist', 'ML / AI Engineer', 'Data Analyst', 'Embedded Systems Engineer',
  'VLSI Design Engineer', 'Hardware Design Engineer', 'Control Systems Engineer',
  'Power Electronics Engineer', 'IoT Solutions Architect', 'Structural Engineer',
  'Site Engineer', 'Urban Planner', 'Project Architect', 'BIM Manager',
  'Mechanical Design Engineer', 'Automobile Engineer', 'Manufacturing Process Engineer',
  'Robotics & Automation Engineer', 'Process Engineer', 'Biotech Researcher',
  'Pharmaceutical Analyst', 'Product Manager', 'Business Analyst', 'Digital Marketing Lead',
  'Operations Manager', 'Strategy Consultant', 'HR & Talent Acquisition', 'Financial Analyst',
  'Investment Banker', 'UI/UX Designer', 'Graphic Designer', 'Content Strategist',
  'Media & Journalism', 'Corporate Lawyer', 'Legal Consultant', 'Medical Practitioner',
  'Healthcare Administrator'
];

async function initializeSeeder() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const totalModules = allFields.length * allRoles.length;
    console.log(`Starting initialization of ${totalModules} modules...`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const field of allFields) {
      for (const role of allRoles) {
        // Create a unique moduleId
        const moduleId = `${field.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${role.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        
        // Try to create the seeder job (upsert)
        const existing = await ModuleSeeder.findOne({ moduleId });
        
        if (!existing) {
          await ModuleSeeder.create({
            moduleId,
            field,
            targetRole: role,
            status: 'pending',
            questionCount: 0
          });
          createdCount++;
        } else {
          skippedCount++;
        }
        
        if ((createdCount + skippedCount) % 100 === 0) {
          console.log(`Progress: ${createdCount + skippedCount}/${totalModules}...`);
        }
      }
    }

    console.log('Initialization complete!');
    console.log(`Summary: Created ${createdCount}, Skipped ${skippedCount} (already existing).`);
    process.exit(0);
  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
}

initializeSeeder();
