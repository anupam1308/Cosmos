const { PROXIMITY_RADIUS } = require('../config/constants');
const { getDistance } = require('../utils/distance');
const state = require('../store/state');
const User = require('../models/User'); // Updated to User model
const Message = require('../models/Message');
const Activity = require('../models/Activity');

function registerSocketHandlers(io, socket) {
  console.log(`User connected: ${socket.id}`);

  socket.on('join', async ({ name, color }) => {
    console.log(`Join request from: ${name} (${color})`);
    let x = Math.random() * 800 + 100;
    let y = Math.random() * 600 + 100;
    
    // Find user by name, load position if exists
    try {
      const existingUser = await User.findOneAndUpdate(
        { name },
        {
          socketId: socket.id,
          color,
          lastSeen: Date.now()
        },
        { upsert: true, new: true }
      );
      
      // Use previous position if available, else save new ones
      if (existingUser && existingUser.position && existingUser.position.x !== undefined) {
        x = existingUser.position.x;
        y = existingUser.position.y;
      } else {
        existingUser.position = { x, y };
        await existingUser.save();
      }
    } catch (err) {
      console.warn('MongoDB Session Warning:', err.message);
    }

    state.users[socket.id] = {
      id: socket.id,
      name,
      x,
      y,
      color,
      connectedWith: []
    };

    // Log join activity
    try {
      await Activity.create({
        text: `${name} joined the Cosmos`,
        type: 'join'
      });
    } catch (err) {
      console.warn('MongoDB Activity Error:', err.message);
    }

    const usersList = Object.values(state.users).map(u => ({...u, connectedWith: u.connectedWith}));
    socket.emit('init_state', usersList);
    socket.broadcast.emit('user_joined', state.users[socket.id]);
  });

  socket.on('move', ({ x, y }) => {
    const user = state.users[socket.id];
    if (!user) return;
    
    user.x = x;
    user.y = y;

    const allUserIds = Object.keys(state.users);
    
    allUserIds.forEach(otherId => {
      if (otherId === socket.id) return;
      const otherUser = state.users[otherId];
      
      const dist = getDistance(user, otherUser);
      const isNear = dist < PROXIMITY_RADIUS;
      const alreadyConnected = user.connectedWith.includes(otherId);

      if (isNear && !alreadyConnected) {
        user.connectedWith.push(otherId);
        otherUser.connectedWith.push(socket.id);
        
        io.to(socket.id).to(otherId).emit('proximity_change', {
          action: 'connected',
          users: [socket.id, otherId],
          timestamp: Date.now()
        });
      } else if (!isNear && alreadyConnected) {
        user.connectedWith = user.connectedWith.filter(i => i !== otherId);
        otherUser.connectedWith = otherUser.connectedWith.filter(i => i !== socket.id);
        
        io.to(socket.id).to(otherId).emit('proximity_change', {
          action: 'disconnected',
          users: [socket.id, otherId],
          timestamp: Date.now()
        });
      }
    });

    socket.broadcast.emit('user_moved', { id: socket.id, x, y });

    // Optional: periodic/throttled DB update for position persistence
    // For now, let's just make sure it's saved during movement to be safe
    User.findOneAndUpdate({ socketId: socket.id }, { position: { x, y } }).catch(() => {});
  });

  socket.on('chat_message', async (msg) => {
    const user = state.users[socket.id];
    if (!user) return;

    const recipients = [...user.connectedWith, socket.id];
    
    // Save to Database
    try {
      const recipientNames = recipients.map(id => state.users[id]?.name).filter(Boolean);
      // Ensure sender is always in the recipients list for easier unified querying
      if (!recipientNames.includes(user.name)) {
        recipientNames.push(user.name);
      }
      
      console.log(`Saving message from ${user.name} to ${recipientNames.join(', ')}`);
      await Message.create({
        senderName: user.name,
        text: msg,
        recipients: recipientNames
      });
    } catch (err) {
      console.warn('MongoDB Message Error:', err.message);
    }

    recipients.forEach(recId => {
      io.to(recId).emit('chat_message', {
        id: Math.random().toString(36).substring(7),
        senderId: socket.id,
        senderName: user.name,
        text: msg,
        timestamp: Date.now()
      });
    });
  });

  socket.on('get_recent_conversations', async (userName) => {
    console.log(`Fetching conversations for: ${userName}`);
    try {
      // Find messages where the user was the sender OR in the recipients list
      const messages = await Message.find({
        $or: [
          { senderName: userName },
          { recipients: userName }
        ]
      }).sort({ timestamp: -1 }).limit(50); // Get last 50 messages
      
      console.log(`Found ${messages.length} messages for ${userName}`);
      socket.emit('recent_conversations', messages);
    } catch (err) {
      console.warn('MongoDB Fetch Error:', err.message);
    }
  });

  socket.on('get_activities', async () => {
    try {
      const activities = await Activity.find().sort({ timestamp: -1 }).limit(20);
      socket.emit('activities_history', activities);
    } catch (err) {
      console.warn('MongoDB Activity Fetch Error:', err.message);
    }
  });

  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.id}`);
    const user = state.users[socket.id];
    
    if (user) {
      // Log leave activity
      try {
        await Activity.create({
          text: `${user.name} left the Cosmos`,
          type: 'leave'
        });
      } catch (err) {
        console.warn('MongoDB Activity Error:', err.message);
      }

      // Record disconnection in database by name
      try {
        await User.findOneAndUpdate(
          { name: user.name },
          { 
            lastSeen: Date.now(),
            position: { x: user.x, y: user.y },
            socketId: null
          }
        );
      } catch(err) {
        console.warn('MongoDB Update Error:', err.message);
      }

      user.connectedWith.forEach(otherId => {
        const otherUser = state.users[otherId];
        if (otherUser) {
          otherUser.connectedWith = otherUser.connectedWith.filter(i => i !== socket.id);
          io.to(otherId).emit('proximity_change', {
            action: 'disconnected',
            users: [socket.id, otherId],
            timestamp: Date.now()
          });
        }
      });
      delete state.users[socket.id];
      socket.broadcast.emit('user_left', socket.id);
    }
  });
}

module.exports = {
  registerSocketHandlers
};
