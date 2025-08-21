import { Server as SocketIOServer, Socket } from 'socket.io';
import logger from '../utils/logger';
import { ERROR_MESSAGES } from '../utils/errorMessages';

interface ProctorSocket extends Socket {
  userId?: number;
  userRole?: string;
}

const reconnectInterval = 5000; // 5 seconds

export const setupProctorSocket = (socket: any) => {
  socket.on('connect', () => {
    console.log('Connected to proctor WebSocket');
  });

  socket.on('disconnect', (reason: string) => {
    console.error('Disconnected from proctor WebSocket:', reason);
    if (reason !== 'io client disconnect') {
      setTimeout(() => {
        console.log('Attempting to reconnect to proctor WebSocket...');
        socket.connect();
      }, reconnectInterval);
    }
  });

  socket.on('error', (error: Error) => {
    console.error('Proctor WebSocket error:', error);
  });

  socket.on('connect_error', (error: Error) => {
    console.error('Connection error with proctor WebSocket:', error);
    setTimeout(() => {
      console.log('Retrying connection to proctor WebSocket...');
      socket.connect();
    }, reconnectInterval);
  });
};

export class ProctorSocketService {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: ProctorSocket) => {
      logger.info(`Proctor connected: ${socket.id}`);

      socket.on('joinProctorSession', (sessionId: string) => {
        if (socket.userRole === 'proctor' || socket.userRole === 'admin') {
          socket.join(`proctor-session-${sessionId}`);
          logger.info(`Proctor ${socket.userId} joined session ${sessionId}`);
        } else {
          logger.warn(`Unauthorized user tried to join proctor session: ${socket.id}`);
        }
      });

      socket.on('reportViolation', (data: { sessionId: string; type: string; evidence: any }) => {
        this.io.to(`proctor-session-${data.sessionId}`).emit('violationReported', {
          proctorId: socket.userId,
          type: data.type,
          evidence: data.evidence,
          timestamp: new Date(),
        });
        logger.info(`Violation reported by proctor ${socket.userId} in session ${data.sessionId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Proctor disconnected: ${socket.id}`);
      });
    });
  }
}

