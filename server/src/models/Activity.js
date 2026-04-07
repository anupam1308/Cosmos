const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  type: {
    type: String, // 'join' or 'leave'
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', activitySchema);
