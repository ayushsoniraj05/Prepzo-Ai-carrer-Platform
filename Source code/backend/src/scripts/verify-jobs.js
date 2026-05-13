import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Job from '../models/Job.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const verify = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const jobs = await Job.find({});
    console.log(`Total jobs in DB: ${jobs.length}`);
    jobs.forEach(j => {
      console.log(`- ${j.title} | Status: ${j.status} | Approved: ${j.isApproved}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
verify();
