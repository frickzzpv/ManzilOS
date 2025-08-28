import { Server, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';

let ioInstance: Server | null = null;

export const setupSocket = (io: Server) => {
  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Authenticate user and join room
    socket.on('authenticate', (token: string) => {
      try {
        const decoded = verify(token, process.env.NEXTAUTH_SECRET || '') as { userId: string };
        if (decoded.userId) {
          socket.join(decoded.userId);
          console.log(`User ${decoded.userId} authenticated and joined room`);
        }
      } catch (error) {
        console.error('Socket authentication error:', error);
      }
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
