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

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prepzo';
const DATA_FILE = path.join(__dirname, '../../..', 'India_Hiring_Tracker_April2026.json');
const DEFAULT_ADMIN_ID = '69a590f221db2e23dc9e1e11'; // admin@prepzo.com

// Normalization Mappings
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

async function seedData() {
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
        console.error('CRITICAL: No admin user found to attribute jobs. Please create an admin first.');
        process.exit(1);
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

    let companyCreated = 0;
    let jobsCreated = 0;

    for (const listing of data.listings) {
      // 1. Normalize Company Data
      const companyName = listing.Company;
      const industry = industryMap[listing.Sector] || 'Other';
      const companyType = companyTypeMap[listing.Type] || 'Other';

      let company = await Company.findOne({ name: companyName });
      if (!company) {
        company = await Company.create({
          name: companyName,
          industry: industry,
          companyType: companyType,
          description: `Company in the ${listing.Sector} sector active in India hring.`,
          status: 'approved',
          addedBy: admin._id,
          hiringStatus: 'actively_hiring',
          headquarters: { city: listing.Location.split('/')[0].trim(), country: 'India' }
        });
        companyCreated++;
      }

      // 2. Normalize Job Data
      const locationArr = listing.Location.split('/').map(l => ({
        city: l.trim() === 'PAN India' ? 'Remote' : l.trim(),
        country: 'India'
      }));

      // Avoid duplicates
      const existingJob = await Job.findOne({
        title: listing.Role,
        company: company._id,
        applicationLink: listing['Apply Link']
      });

      if (!existingJob) {
        await Job.create({
          title: listing.Role,
          company: company._id,
          description: listing.Description,
          jobType: 'full_time', // default
          workMode: (listing.Location.includes('Remote') || listing.Location.includes('PAN')) ? 'remote' : 'onsite',
          experienceLevel: 'entry', // default
          locations: locationArr,
          applicationLink: listing['Apply Link'],
          applicationDeadline: listing.Deadline.includes('Rolling') ? null : new Date(listing.Deadline),
          status: 'active',
          isApproved: true,
          postedBy: admin._id
        });
        jobsCreated++;
      } else if (!existingJob.isApproved) {
        // Force approval for existing tracker jobs
        existingJob.isApproved = true;
        existingJob.status = 'active';
        await existingJob.save();
        jobsCreated++;
      }
    }

    console.log('Seeding complete!');
    console.log(`Summary: Created ${companyCreated} new companies and ${jobsCreated} new jobs.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedData();
