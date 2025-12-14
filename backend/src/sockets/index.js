const { Server } = require('socket.io');
const { corsOptions } = require('../config/cors');
const { registerEmitters } = require('./events');

let io;

function initSockets(server) {
  io = new Server(server, { cors: corsOptions });
  registerEmitters(io);
  io.on('connection', (socket) => {
    socket.on('ping', () => socket.emit('pong'));
  });
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = { initSockets, getIO };
