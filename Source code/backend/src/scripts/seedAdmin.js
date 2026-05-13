import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import User model
import User from '../models/User.model.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@prepzo.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';

const TEST_STUDENT_EMAIL = 'student@prepzo.com';
const TEST_STUDENT_PASSWORD = 'Student@123';

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (existingAdmin) {
      // Reset admin password and ensure proper role
      existingAdmin.password = ADMIN_PASSWORD; // Will be hashed by pre-save hook
      existingAdmin.role = 'admin';
      existingAdmin.accountStatus = 'active';
      existingAdmin.isEmailVerified = true;
      existingAdmin.isOnboarded = true;
      await existingAdmin.save();
      console.log(`✅ Admin user updated with new password: ${ADMIN_EMAIL}`);
    } else {
      // Create admin user (password will be hashed by pre-save hook)
      const adminUser = new User({
        fullName: ADMIN_NAME,
        email: ADMIN_EMAIL,
        phone: '1234567890',
        dateOfBirth: '1990-01-01',
        gender: 'Other',
        password: ADMIN_PASSWORD, // Let User model hash this
        collegeName: 'Admin College',
        degree: 'B.Tech',
        fieldOfStudy: 'Computer Science',
        yearOfStudy: '4th Year',
        targetRole: 'Software Engineer',
        role: 'admin',
        accountStatus: 'active',
        isEmailVerified: true,
        isOnboarded: true,
        isAssessmentComplete: true,
        placementReadinessScore: 100,
      });

      await adminUser.save();
      console.log(`✅ Admin user created:`);
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
    }

    // Create test student if not exists
    const existingStudent = await User.findOne({ email: TEST_STUDENT_EMAIL });
    if (!existingStudent) {
      const studentUser = new User({
        fullName: 'Test Student',
        email: TEST_STUDENT_EMAIL,
        phone: '9876543210',
        dateOfBirth: '2000-01-01',
        gender: 'Male',
        password: TEST_STUDENT_PASSWORD,
        collegeName: 'Test University',
        degree: 'B.Tech',
        fieldOfStudy: 'Computer Science',
        yearOfStudy: '4th Year',
        targetRole: 'Software Engineer',
        knownTechnologies: ['JavaScript', 'Python', 'React'],
        role: 'student',
        accountStatus: 'active',
        isEmailVerified: true,
        isOnboarded: true,
      });
      await studentUser.save();
      console.log(`✅ Test student created:`);
      console.log(`   Email: ${TEST_STUDENT_EMAIL}`);
      console.log(`   Password: ${TEST_STUDENT_PASSWORD}`);
    } else {
      console.log(`ℹ️  Test student already exists: ${TEST_STUDENT_EMAIL}`);
    }

    console.log('\n📋 Admin Login Credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run if called directly
seedAdmin();
