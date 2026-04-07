const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  socketId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  color: {
    type: String
  },
  lastPosition: {
    x: Number,
    y: Number
  },
  connectedAt: {
    type: Date,
    default: Date.now
  },
  disconnectedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Session', sessionSchema);
