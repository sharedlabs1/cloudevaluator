import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { AuthToken } from '../types/auth';
import logger from '../utils/logger';
import { query } from '../config/database';
import { evaluationService } from '../services/evaluationService';

interface AuthSocket extends Socket {
  userId?: number;
  userRole?: string;
}

export class SocketService {
  private io: SocketIOServer;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3001",
        methods: ["GET", "POST"]
      }
    });

    this.setupSocketAuth();
    this.setupSocketHandlers();
  }

  private setupSocketAuth(): void {
    this.io.use((socket: AuthSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthToken;
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        next();
      } catch (err) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: AuthSocket) => {
      logger.info(`User ${socket.userId} connected to socket`);

      // Join user-specific room
      socket.join(`user-${socket.userId}`);

      // Assessment-related handlers
      socket.on('joinAssessment', async (assessmentId: number) => {
        socket.join(`assessment-${assessmentId}`);
        logger.info(`User ${socket.userId} joined assessment ${assessmentId}`);
        
        // Send current assessment status
        const status = await this.getAssessmentStatus(socket.userId!, assessmentId);
        socket.emit('assessmentStatus', status);
      });

      socket.on('leaveAssessment', (assessmentId: number) => {
        socket.leave(`assessment-${assessmentId}`);
        logger.info(`User ${socket.userId} left assessment ${assessmentId}`);
      });

      // Evaluation request
      socket.on('requestEvaluation', async (data: { studentAssessmentId: number; taskId?: number }) => {
        try {
          if (data.taskId) {
            // Evaluate specific task
            const taskResult = await query(`
              SELECT at.* FROM assessment_tasks at
              JOIN assessment_allocations aa ON at.assessment_id = aa.assessment_id
              JOIN student_assessments sa ON aa.id = sa.allocation_id
              WHERE sa.id = $1 AND at.id = $2 AND sa.student_id = $3
            `, [data.studentAssessmentId, data.taskId, socket.userId]);

            if (taskResult.rows.length > 0) {
              evaluationService.evaluateTask(data.studentAssessmentId, taskResult.rows[0])
                .catch((error: unknown) => logger.error('Error in task evaluation:', error));
            }
          } else {
            // Evaluate entire assessment
            evaluationService.evaluateStudentAssessment(data.studentAssessmentId)
              .catch((error: unknown) => logger.error('Error in assessment evaluation:', error));
          }
        } catch (error) {
          socket.emit('evaluationError', { message: 'Failed to start evaluation' });
        }
      });

      // Proctoring handlers
      socket.on('joinProctoring', (sessionId: number) => {
        if (socket.userRole === 'proctor' || socket.userRole === 'admin') {
          socket.join(`proctor-${sessionId}`);
          logger.info(`Proctor ${socket.userId} joined session ${sessionId}`);
        }
      });

      socket.on('reportViolation', (data: { sessionId: number; type: string; evidence: any }) => {
        this.io.to(`proctor-${data.sessionId}`).emit('violation', {
          studentId: socket.userId,
          type: data.type,
          evidence: data.evidence,
          timestamp: new Date()
        });
      });

      // Monitoring handlers for admins/instructors
      socket.on('joinMonitoring', () => {
        if (socket.userRole === 'admin' || socket.userRole === 'instructor') {
          socket.join('monitoring');
          logger.info(`${socket.userRole} ${socket.userId} joined monitoring`);
        }
      });

      // Auto-submit handler
      socket.on('autoSubmit', async (studentAssessmentId: number) => {
        try {
          await query(`
            UPDATE student_assessments 
            SET status = 'auto_submitted', submitted_at = NOW()
            WHERE id = $1 AND student_id = $2 AND status = 'in_progress'
          `, [studentAssessmentId, socket.userId]);

          // Trigger evaluation
          evaluationService.evaluateStudentAssessment(studentAssessmentId)
            .catch((error: unknown) => logger.error('Error in auto-submit evaluation:', error));

          socket.emit('assessmentAutoSubmitted', { assessmentId: studentAssessmentId });
        } catch (error) {
          logger.error('Error in auto-submit:', error);
        }
      });

      socket.on('disconnect', () => {
        logger.info(`User ${socket.userId} disconnected from socket`);
      });
    });
  }

  // Public methods for emitting events
  public emitToUser(userId: number, event: string, data: any): void {
    this.io.to(`user-${userId}`).emit(event, data);
  }

  public emitToAssessment(assessmentId: number, event: string, data: any): void {
    this.io.to(`assessment-${assessmentId}`).emit(event, data);
  }

  public emitToProctor(sessionId: number, event: string, data: any): void {
    this.io.to(`proctor-${sessionId}`).emit(event, data);
  }

  public emitToMonitoring(event: string, data: any): void {
    this.io.to('monitoring').emit(event, data);
  }

  private async getAssessmentStatus(userId: number, assessmentId: number): Promise<any> {
    try {
      const result = await query(`
        SELECT 
          sa.*,
          a.title,
          a.case_study_content,
          EXTRACT(EPOCH FROM (sa.end_time - NOW())) as remaining_seconds
        FROM student_assessments sa
        JOIN assessment_allocations aa ON sa.allocation_id = aa.id
        JOIN assessments a ON aa.assessment_id = a.id
        WHERE sa.student_id = $1 AND aa.assessment_id = $2
      `, [userId, assessmentId]);

      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error getting assessment status:', error);
      return null;
    }
  }

  // Add a method to expose the `to` method of the underlying SocketIOServer
  public to(room: string) {
    return this.io.to(room);
  }
}

let socketService: SocketService;

export const initializeSocket = (server: HTTPServer): SocketService => {
  socketService = new SocketService(server);
  return socketService;
};

export { socketService };
