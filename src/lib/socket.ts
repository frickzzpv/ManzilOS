import { Server, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';

let ioInstance: Server | null = null;

export const setupSocket = (io: Server) => {
  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    socket.on('authenticate', (token: string) => {
      try {
        const decoded = verify(token, process.env.JWT_SECRET || '') as { userId: string };
        if (decoded.userId) {
          // Join a room for general notifications for this user
          socket.join(decoded.userId);
          console.log(`User ${decoded.userId} authenticated and joined user room`);
        }
      } catch (error) {
        console.error('Socket authentication error:', error);
      }
    });

    socket.on('join_conversation', (conversationId: string) => {
        socket.join(conversationId);
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(conversationId);
        console.log(`Socket ${socket.id} left conversation ${conversationId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

export const getSocketIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.IO not initialized!');
  }
  return ioInstance;
};
