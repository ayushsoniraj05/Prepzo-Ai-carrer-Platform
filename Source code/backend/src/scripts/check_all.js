import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.model.js';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('--- DATABASE COLLECTIONS ---');
  for (let col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`${col.name}: ${count}`);
  }

  const query = {
    status: 'active',
    isApproved: true,
  };

  const matchingJobs = await Job.find(query).limit(3);
  console.log('--- MATCHING JOBS SAMPLES ---');
  console.log(matchingJobs);

  process.exit(0);
}

check();
