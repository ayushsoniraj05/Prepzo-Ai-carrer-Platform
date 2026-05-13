const mongoose = require('mongoose');
require('dotenv').config();

const databases = ['ai-career-platform', 'prepzo', 'prepzo_ai', 'test'];
const baseUri = process.env.MONGODB_URI;

async function checkAllDatabases() {
  for (const dbName of databases) {
    try {
      // Replace the database name in the URI string
      // The URI usually looks like mongodb+srv://.../dbname?auth...
      const uriParts = baseUri.split('/');
      const lastPart = uriParts.pop();
      const dbAndQuery = lastPart.split('?');
      dbAndQuery[0] = dbName;
      uriParts.push(dbAndQuery.join('?'));
      const finalUri = uriParts.join('/');

      const conn = await mongoose.createConnection(finalUri).asPromise();
      const count = await conn.db.collection('jobs').countDocuments();
      console.log(`${dbName}: ${count} jobs`);
      await conn.close();
    } catch (error) {
      console.error(`Error checking ${dbName}:`, error.message);
    }
  }
  process.exit(0);
}

checkAllDatabases();
