const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  socketId: {
    type: String
  },
  color: {
    type: String
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  position: {
    x: Number,
    y: Number
  }
});

// The third argument explicitly sets the collection name to 'users'
module.exports = mongoose.model('User', userSchema, 'users');
