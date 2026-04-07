const { PROXIMITY_RADIUS } = require('../config/constants');
const { getDistance } = require('../utils/distance');
const state = require('../store/state');
const User = require('../models/User'); // Updated to User model

function registerSocketHandlers(io, socket) {
  console.log(`User connected: ${socket.id}`);

  socket.on('join', async ({ name, color }) => {
    const x = Math.random() * 800 + 100;
    const y = Math.random() * 600 + 100;
    
    state.users[socket.id] = {
      id: socket.id,
      name,
      x,
      y,
      color,
      connectedWith: []
    };

    // Upsert user to MongoDB based on socket ID acting as userId for now
    try {
      await User.findOneAndUpdate(
        { userId: socket.id },
        {
          name,
          color,
          lastSeen: Date.now(),
          position: { x, y }
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.warn('MongoDB Session Warning:', err.message);
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
  });

  socket.on('chat_message', (msg) => {
    const user = state.users[socket.id];
    if (!user) return;

    const recipients = [...user.connectedWith, socket.id];
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

  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.id}`);
    const user = state.users[socket.id];
    
    if (user) {
      // Record disconnection in database
      try {
        await User.findOneAndUpdate(
          { userId: socket.id },
          { 
            lastSeen: Date.now(),
            position: { x: user.x, y: user.y }
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
