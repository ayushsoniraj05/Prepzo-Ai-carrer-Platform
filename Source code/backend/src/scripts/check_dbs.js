import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const checkDatabases = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Current DB:', mongoose.connection.name);
    
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('All Databases:', JSON.stringify(dbs.databases.map(d => d.name)));
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in current DB:', collections.map(c => c.name));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkDatabases();
