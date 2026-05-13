import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const dropAndReseed = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.log('No MONGODB_URI found. Exiting.');
      return;
    }
    
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log(`Connected. Dropping notes collection...`);
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'notes' }).toArray();
    
    if (collections.length > 0) {
      await db.collection('notes').drop();
      console.log('Dropped notes collection successfully.');
    } else {
      console.log('Notes collection does not exist.');
    }

    console.log('Running autoSeedNotes...');
    const connectDB = (await import('./src/config/db.js')).default;
    // We already connected, so we just run the seed by calling the seed function directly if we can
    // Or we close and call connectDB
    await mongoose.connection.close();
    await connectDB();
    
    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

dropAndReseed();
