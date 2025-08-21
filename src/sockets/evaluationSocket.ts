// src/sockets/evaluationSocket.ts
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../utils/encryption'; // Corrected import
import { EvaluationService } from '../services/evaluationService';
import { AssessmentTask } from '../types/assessment';
import { ERROR_MESSAGES } from '../utils/errorMessages';

declare module 'socket.io' {
    interface Socket {
        userId?: number;
        userRole?: string;
    }
}

export class EvaluationSocket {
    private evaluationService: EvaluationService;
    private reconnectInterval = 5000; // 5 seconds

    constructor(private io: SocketIOServer) {
        this.evaluationService = new EvaluationService(); // Initialize evaluationService
        this.setupSocketHandlers();
    }

    private setupSocketHandlers() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                const decoded = verifyToken(token);
                socket.userId = decoded.userId;
                socket.userRole = decoded.role;
                next();
            } catch (err) {
                next(new Error('Authentication error'));
            }
        });

        this.io.on('connection', (socket) => {
            console.log(`User ${socket.userId} connected`);

            socket.on('joinAssessment', async (assessmentId) => {
                socket.join(`assessment-${assessmentId}`);

                // Send current status
                const userId = socket.userId ?? 0; // Default to 0 if undefined
                const status = await this.getAssessmentStatus(userId, assessmentId);
                socket.emit('assessmentStatus', status);
            });

            socket.on('requestEvaluation', async (data) => {
                const { studentAssessmentId, taskId } = data;

                // Trigger evaluation for specific task
                await this.handleTaskEvaluation(studentAssessmentId, taskId);
            });

            socket.on('disconnect', (reason: string) => {
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

    private async getAssessmentStatus(userId: number, assessmentId: number): Promise<any> {
        // Placeholder implementation for fetching assessment status
        return { status: 'in-progress', userId, assessmentId };
    }

    private async handleTaskEvaluation(studentAssessmentId: number, taskId: number): Promise<void> {
        try {
            // Pass the correct arguments to evaluateTask
            const task = await this.evaluationService.getAssessmentTask(taskId);
            const result = await this.evaluationService.evaluateTask(studentAssessmentId, task);

            // Broadcast the result to the relevant assessment room
            const assessmentId = task.assessment_id; // Use task.assessment_id instead of result.assessment
            if (assessmentId) {
                this.broadcastTaskUpdate(assessmentId, result);
            } else {
                console.error('Assessment ID not found in task details');
            }
        } catch (error) {
            console.error('Error during task evaluation:', error);
        }
    }

    async broadcastTaskUpdate(assessmentId: number, taskUpdate: any) {
        this.io.to(`assessment-${assessmentId}`).emit('taskUpdate', taskUpdate);
    }
}
