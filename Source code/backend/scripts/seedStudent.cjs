// Script to seed a sample student profile in MongoDB (CommonJS)
const mongoose = require('mongoose');
const User = require('../src/models/User.model.js');

async function seedStudent() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prepzo');
  const student = new User({
    fullName: 'Test Student',
    email: 'test.student@example.com',
    phone: '1234567890',
    dateOfBirth: '2002-01-01',
    gender: 'Male',
    password: 'TestPassword123!',
    collegeName: 'Prepzo University',
    degree: 'B.Tech',
    fieldOfStudy: 'Computer Science',
    yearOfStudy: '3rd Year',
    cgpa: '8.5',
    targetRole: 'Software Engineer',
    knownTechnologies: ['JavaScript', 'Python', 'React', 'Node.js'],
    preferredCompanies: ['Google', 'Microsoft', 'Amazon'],
    linkedin: 'https://linkedin.com/in/teststudent',
    github: 'https://github.com/teststudent',
    resumeUrl: '',
    role: 'student',
    isOnboarded: true,
    isAssessmentComplete: true,
    placementReadinessScore: 65,
  });
  await student.save();
  console.log('Sample student profile seeded.');
  await mongoose.disconnect();
}

seedStudent();
// Script to seed a sample student profile in MongoDB (CommonJS)
const mongoose = require('mongoose');
const User = require('../src/models/User.model.js').default || require('../src/models/User.model.js');

const MONGO_URI = 'mongodb+srv://cluster0.qhs1btd.mongodb.net/prepzo'; // Update with your actual connection string if needed

async function seedStudent() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const student = new User({
    fullName: 'Test Student',
    email: 'test.student@example.com',
    phone: '1234567890',
    dateOfBirth: '2002-01-01',
    gender: 'Male',
    password: 'TestPassword123!',
    collegeName: 'Prepzo University',
    degree: 'B.Tech',
    fieldOfStudy: 'Computer Science',
    yearOfStudy: '3rd Year',
    cgpa: '8.5',
    targetRole: 'Software Engineer',
    knownTechnologies: ['JavaScript', 'Python', 'React', 'Node.js'],
    preferredCompanies: ['Google', 'Microsoft', 'Amazon'],
    linkedin: 'https://linkedin.com/in/teststudent',
    github: 'https://github.com/teststudent',
    resumeUrl: '',
    role: 'student',
    isOnboarded: true,
    isAssessmentComplete: true,
    placementReadinessScore: 65,
  });
  await student.save();
  console.log('Sample student profile seeded.');
  await mongoose.disconnect();
}

seedStudent();
