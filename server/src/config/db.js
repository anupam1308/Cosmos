const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/virtual-cosmos');
    console.log(`MongoDB Connected: ${conn.connection.host} (virtual-cosmos database)`);
  } catch (err) {
    console.warn(`MongoDB Connection Error: ${err.message}`);
    console.warn('The application will fall back to in-memory store until a local MongoDB instance is started.');
  }
};

module.exports = connectDB;
