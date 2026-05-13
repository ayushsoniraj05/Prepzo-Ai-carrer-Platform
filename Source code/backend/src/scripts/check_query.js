import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.model.js';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const query = {
    status: 'active',
    isApproved: true,
    $or: [
      { applicationDeadline: { $gte: new Date() } },
      { applicationDeadline: null },
    ],
  };

  const count = await Job.countDocuments(query);
  console.log('Count of jobs matching search query:', count);

  const allJobs = await Job.find({}).limit(5).select('title status isApproved applicationDeadline');
  console.log('All Jobs samples:', allJobs);

  process.exit(0);
}

check();
