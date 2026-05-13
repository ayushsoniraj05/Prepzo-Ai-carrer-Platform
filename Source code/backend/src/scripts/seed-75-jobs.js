import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Job from '../models/Job.model.js';
import Company from '../models/Company.model.js';
import User from '../models/User.model.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_DB = process.env.DB_NAME || 'prepzo';
let MONGO_URI = process.env.MONGODB_URI;

// Ensure we are hitting the target DB
if (MONGO_URI.includes('.net/')) {
  const parts = MONGO_URI.split('/');
  const lastPart = parts.pop();
  const dbAndQuery = lastPart.split('?');
  dbAndQuery[0] = TARGET_DB;
  parts.push(dbAndQuery.join('?'));
  MONGO_URI = parts.join('/');
}

console.log(`🚀 Targeting Database: ${TARGET_DB}`);
const DATA_FILE = path.join(__dirname, '../../../', 'India_Hiring_Tracker_April2026.json');
const DEFAULT_ADMIN_ID = '69a590f221db2e23dc9e1e11';

// Normalization Mappings from seedHiringTracker.js
const industryMap = {
  'IT Services': 'Information Technology',
  'Consulting & Tech': 'Consulting',
  'Product & Engineering': 'Software Development',
  'E-Commerce / Cloud': 'E-commerce',
  'Fintech': 'Finance & Banking',
  'Quick Commerce': 'E-commerce',
  'Social Commerce': 'E-commerce',
  'EV / Deep Tech': 'Other',
  'SaaS / CRM': 'Software Development',
  'Creative / Cloud SaaS': 'Software Development',
  'Food Tech': 'Other',
  'EdTech': 'Education',
  'Beauty / E-Commerce': 'Retail',
  'Food Delivery': 'Other',
  'BFSI': 'Finance & Banking',
  'Telecom': 'Telecommunications',
  'FMCG / Retail': 'Retail',
  'Large Enterprise / Conglomerate': 'Other',
  'Tech': 'Information Technology'
};

const companyTypeMap = {
  'Large Enterprise': 'MNC',
  'MNC / Big Tech': 'MNC',
  'Startup (Growth)': 'Startup',
  'Startup (Unicorn)': 'Startup',
  'Startup': 'Startup',
  'MNC': 'MNC'
};

async function seed75Jobs() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // Ensure Admin User exists
    let admin = await User.findById(DEFAULT_ADMIN_ID);
    if (!admin) {
      console.log('Default admin not found, searching for any admin...');
      admin = await User.findOne({ role: 'admin' });
      if (!admin) {
        console.error('CRITICAL: No admin user found. Creating one...');
        admin = await User.create({
          _id: new mongoose.Types.ObjectId(DEFAULT_ADMIN_ID),
          fullName: 'System Admin',
          email: 'admin@prepzo.com',
          password: 'AdminPassword123!',
          role: 'admin',
          isOnboarded: true,
          targetRole: 'SDE',
          yearOfStudy: '4',
          fieldOfStudy: 'Computer Science',
          degree: 'B.Tech',
          collegeName: 'System University',
          gender: 'Other',
          dateOfBirth: new Date('2000-01-01'),
          phone: '0000000000'
        });
      }
    }
    console.log(`Attributing jobs to: ${admin.email}`);

    // Load JSON
    if (!fs.existsSync(DATA_FILE)) {
      console.error(`Data file not found at: ${DATA_FILE}`);
      process.exit(1);
    }
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    console.log(`Loaded ${data.listings.length} listings from ${data.title}`);

    // CLEAR EXISTING DATA
    console.log('Clearing existing jobs and companies...');
    await Job.deleteMany({});
    await Company.deleteMany({});
    console.log('Cleared.');

    let companyCount = 0;
    let jobCount = 0;

    const companyCache = new Map();

    for (const listing of data.listings) {
      // 1. Company Handling
      const companyName = listing.Company;
      let companyId;

      if (companyCache.has(companyName)) {
        companyId = companyCache.get(companyName);
      } else {
        const industry = industryMap[listing.Sector] || 'Other';
        const companyType = companyTypeMap[listing.Type] || 'Other';
        const city = listing.Location.split('/')[0].trim();

        const company = await Company.create({
          name: companyName,
          industry: industry,
          companyType: companyType,
          description: `Company in the ${listing.Sector} sector active in India hiring.`,
          status: 'approved',
          addedBy: admin._id,
          hiringStatus: 'actively_hiring',
          headquarters: { city: city === 'PAN India' ? 'Remote' : city, country: 'India' },
          logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random&size=200`
        });
        companyId = company._id;
        companyCache.set(companyName, companyId);
        companyCount++;
      }

      // 2. Job Creation
      const locationArr = listing.Location.split('/').map(l => ({
        city: l.trim() === 'PAN India' ? 'Remote' : l.trim(),
        country: 'India'
      }));

      await Job.create({
        title: listing.Role,
        company: companyId,
        description: listing.Description,
        jobType: 'full_time',
        workMode: (listing.Location.includes('Remote') || listing.Location.includes('PAN')) ? 'remote' : 'onsite',
        experienceLevel: 'entry',
        locations: locationArr,
        applicationLink: listing['Apply Link'] || 'https://prepzo.ai',
        applicationDeadline: null, // Always rolling for max visibility
        status: 'active',
        isApproved: true,
        postedBy: admin._id,
        approvedBy: admin._id,
        approvedAt: new Date(),
        salary: {
          min: 600000,
          max: 1200000,
          currency: 'INR',
          period: 'yearly'
        },
        requiredSkills: [
          { skill: listing.Section === 'Tech' ? 'Software Engineering' : 'Business Operations', importance: 'required' }
        ]
      });
      jobCount++;
    }

    console.log('\n✅ SEEDING COMPLETE!');
    console.log(`Summary: Created ${companyCount} companies and ${jobCount} jobs.`);
    
    // Update company job counts
    console.log('Updating job counts in companies...');
    for (const [name, id] of companyCache) {
      const count = await Job.countDocuments({ company: id });
      await Company.findByIdAndUpdate(id, { jobCount: count });
    }
    console.log('Update complete.');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed75Jobs();
