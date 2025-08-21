"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketService = exports.initializeSocket = exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("../utils/logger"));
const database_1 = require("../config/database");
const evaluationService_1 = require("../services/evaluationService");
class SocketService {
    constructor(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:3001",
                methods: ["GET", "POST"]
            }
        });
        this.setupSocketAuth();
        this.setupSocketHandlers();
    }
    setupSocketAuth() {
        this.io.use((socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication token required'));
                }
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                socket.userId = decoded.userId;
                socket.userRole = decoded.role;
                next();
            }
            catch (err) {
                next(new Error('Invalid authentication token'));
            }
        });
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            logger_1.default.info(`User ${socket.userId} connected to socket`);
            socket.join(`user-${socket.userId}`);
            socket.on('joinAssessment', async (assessmentId) => {
                socket.join(`assessment-${assessmentId}`);
                logger_1.default.info(`User ${socket.userId} joined assessment ${assessmentId}`);
                const status = await this.getAssessmentStatus(socket.userId, assessmentId);
                socket.emit('assessmentStatus', status);
            });
            socket.on('leaveAssessment', (assessmentId) => {
                socket.leave(`assessment-${assessmentId}`);
                logger_1.default.info(`User ${socket.userId} left assessment ${assessmentId}`);
            });
            socket.on('requestEvaluation', async (data) => {
                try {
                    if (data.taskId) {
                        const taskResult = await (0, database_1.query)(`
              SELECT at.* FROM assessment_tasks at
              JOIN assessment_allocations aa ON at.assessment_id = aa.assessment_id
              JOIN student_assessments sa ON aa.id = sa.allocation_id
              WHERE sa.id = $1 AND at.id = $2 AND sa.student_id = $3
            `, [data.studentAssessmentId, data.taskId, socket.userId]);
                        if (taskResult.rows.length > 0) {
                            evaluationService_1.evaluationService.evaluateTask(data.studentAssessmentId, taskResult.rows[0])
                                .catch((error) => logger_1.default.error('Error in task evaluation:', error));
                        }
                    }
                    else {
                        evaluationService_1.evaluationService.evaluateStudentAssessment(data.studentAssessmentId)
                            .catch((error) => logger_1.default.error('Error in assessment evaluation:', error));
                    }
                }
                catch (error) {
                    socket.emit('evaluationError', { message: 'Failed to start evaluation' });
                }
            });
            socket.on('joinProctoring', (sessionId) => {
                if (socket.userRole === 'proctor' || socket.userRole === 'admin') {
                    socket.join(`proctor-${sessionId}`);
                    logger_1.default.info(`Proctor ${socket.userId} joined session ${sessionId}`);
                }
            });
            socket.on('reportViolation', (data) => {
                this.io.to(`proctor-${data.sessionId}`).emit('violation', {
                    studentId: socket.userId,
                    type: data.type,
                    evidence: data.evidence,
                    timestamp: new Date()
                });
            });
            socket.on('joinMonitoring', () => {
                if (socket.userRole === 'admin' || socket.userRole === 'instructor') {
                    socket.join('monitoring');
                    logger_1.default.info(`${socket.userRole} ${socket.userId} joined monitoring`);
                }
            });
            socket.on('autoSubmit', async (studentAssessmentId) => {
                try {
                    await (0, database_1.query)(`
            UPDATE student_assessments 
            SET status = 'auto_submitted', submitted_at = NOW()
            WHERE id = $1 AND student_id = $2 AND status = 'in_progress'
          `, [studentAssessmentId, socket.userId]);
                    evaluationService_1.evaluationService.evaluateStudentAssessment(studentAssessmentId)
                        .catch((error) => logger_1.default.error('Error in auto-submit evaluation:', error));
                    socket.emit('assessmentAutoSubmitted', { assessmentId: studentAssessmentId });
                }
                catch (error) {
                    logger_1.default.error('Error in auto-submit:', error);
                }
            });
            socket.on('disconnect', () => {
                logger_1.default.info(`User ${socket.userId} disconnected from socket`);
            });
        });
    }
    emitToUser(userId, event, data) {
        this.io.to(`user-${userId}`).emit(event, data);
    }
    emitToAssessment(assessmentId, event, data) {
        this.io.to(`assessment-${assessmentId}`).emit(event, data);
    }
    emitToProctor(sessionId, event, data) {
        this.io.to(`proctor-${sessionId}`).emit(event, data);
    }
    emitToMonitoring(event, data) {
        this.io.to('monitoring').emit(event, data);
    }
    async getAssessmentStatus(userId, assessmentId) {
        try {
            const result = await (0, database_1.query)(`
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
        }
        catch (error) {
            logger_1.default.error('Error getting assessment status:', error);
            return null;
        }
    }
    to(room) {
        return this.io.to(room);
    }
}
exports.SocketService = SocketService;
let socketService;
const initializeSocket = (server) => {
    exports.socketService = socketService = new SocketService(server);
    return socketService;
};
exports.initializeSocket = initializeSocket;
//# sourceMappingURL=index.js.map