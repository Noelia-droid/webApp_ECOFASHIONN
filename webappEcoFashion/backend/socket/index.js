const { Server } = require('socket.io');
const socketController = require('../controllers/socketController');

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:3001',
      methods: ['GET', 'POST']
    }
  });

  socketController(io); // ✅ Conecta el controlador
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO no ha sido inicializado');
  }
  return io;
}

module.exports = {
  initializeSocket,
  getIO
};
