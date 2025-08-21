"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluationSocket = void 0;
const encryption_1 = require("../utils/encryption");
const evaluationService_1 = require("../services/evaluationService");
class EvaluationSocket {
    constructor(io) {
        this.io = io;
        this.reconnectInterval = 5000;
        this.evaluationService = new evaluationService_1.EvaluationService();
        this.setupSocketHandlers();
    }
    setupSocketHandlers() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                const decoded = (0, encryption_1.verifyToken)(token);
                socket.userId = decoded.userId;
                socket.userRole = decoded.role;
                next();
            }
            catch (err) {
                next(new Error('Authentication error'));
            }
        });
        this.io.on('connection', (socket) => {
            console.log(`User ${socket.userId} connected`);
            socket.on('joinAssessment', async (assessmentId) => {
                socket.join(`assessment-${assessmentId}`);
                const userId = socket.userId ?? 0;
                const status = await this.getAssessmentStatus(userId, assessmentId);
                socket.emit('assessmentStatus', status);
            });
            socket.on('requestEvaluation', async (data) => {
                const { studentAssessmentId, taskId } = data;
                await this.handleTaskEvaluation(studentAssessmentId, taskId);
            });
            socket.on('disconnect', (reason) => {
                if (reason !== 'io client disconnect') {
                    console.log('Socket disconnected:', reason);
                }
            });
            if (!socket.connected) {
                console.log('Socket is not connected');
            }
            socket.on('error', (error) => {
                console.error('Evaluation WebSocket error:', error);
            });
            socket.on('connect_error', (error) => {
                console.error('Connection error with evaluation WebSocket:', error);
                setTimeout(() => {
                    console.log('Retrying connection to evaluation WebSocket...');
                }, this.reconnectInterval);
            });
        });
    }
    async getAssessmentStatus(userId, assessmentId) {
        return { status: 'in-progress', userId, assessmentId };
    }
    async handleTaskEvaluation(studentAssessmentId, taskId) {
        try {
            const task = await this.evaluationService.getAssessmentTask(taskId);
            const result = await this.evaluationService.evaluateTask(studentAssessmentId, task);
            const assessmentId = task.assessment_id;
            if (assessmentId) {
                this.broadcastTaskUpdate(assessmentId, result);
            }
            else {
                console.error('Assessment ID not found in task details');
            }
        }
        catch (error) {
            console.error('Error during task evaluation:', error);
        }
    }
    async broadcastTaskUpdate(assessmentId, taskUpdate) {
        this.io.to(`assessment-${assessmentId}`).emit('taskUpdate', taskUpdate);
    }
}
exports.EvaluationSocket = EvaluationSocket;
//# sourceMappingURL=evaluationSocket.js.map