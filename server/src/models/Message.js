const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  recipients: [{
    type: String
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);
