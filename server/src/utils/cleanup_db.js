const mongoose = require('mongoose');

async function cleanupIndexes() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/virtual-cosmos');
    console.log('Connected to MongoDB');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    const userCollection = collections.find(c => c.name === 'users');

    if (userCollection) {
      console.log('Collection "users" found. Dropping indexes...');
      
      // Drop all indexes except _id
      try {
        await mongoose.connection.db.collection('users').dropIndexes();
        console.log('All indexes dropped successfully (Mongoose will recreate current ones on restart)');
      } catch (err) {
        if (err.codeName === 'IndexNotFound') {
          console.log('No indexes found to drop.');
        } else {
          throw err;
        }
      }
    } else {
      console.log('Collection "users" not found.');
    }

    await mongoose.disconnect();
    console.log('Disconnected');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup Error:', err.message);
    process.exit(1);
  }
}

cleanupIndexes();
