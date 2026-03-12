/**
 * Socket.io configuration for real-time notifications
 */

const socketIO = require('socket.io');

let io;

// Initialize socket.io server
const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Connection event
  io.on('connection', (socket) => {
    console.log('New client connected', socket.id);
    
    // Join user to a personal room based on their ID
    socket.on('join', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their personal room`);
    });

    // Disconnect event
    socket.on('disconnect', () => {
      console.log('Client disconnected', socket.id);
    });
  });

  return io;
};

// Send notification to a specific user
const sendNotificationToUser = (userId, notification) => {
  if (io) {
    io.to(`user-${userId}`).emit('notification', notification);
    console.log(`Real-time notification sent to user ${userId}`);
  }
};

// Send notification to all users
const sendNotificationToAll = (notification) => {
  if (io) {
    io.emit('notification', notification);
    console.log('Real-time notification sent to all users');
  }
};

module.exports = {
  initSocket,
  sendNotificationToUser,
  sendNotificationToAll,
  getIO: () => io
};
