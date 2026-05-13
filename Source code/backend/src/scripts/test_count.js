import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.model.js';
import Company from '../models/Company.model.js';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const totalJobs = await Job.countDocuments({});
  const approvedJobs = await Job.countDocuments({ isApproved: true });
  
  const totalCompanies = await Company.countDocuments({});
  const approvedCompanies = await Company.countDocuments({ status: 'approved' });
  
  console.log('--- DATABASE CHECK ---');
  console.log('Total Jobs:', totalJobs);
  console.log('Approved Jobs:', approvedJobs);
  console.log('Total Companies:', totalCompanies);
  console.log('Approved Companies:', approvedCompanies);

  process.exit(0);
}

check();
