require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const connectDB = require('./src/config/db');
const { PORT } = require('./src/config/constants');
const { registerSocketHandlers } = require('./src/handlers/socketHandlers');

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  registerSocketHandlers(io, socket);
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
