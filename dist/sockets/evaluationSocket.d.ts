import { Server as SocketIOServer } from 'socket.io';
declare module 'socket.io' {
    interface Socket {
        userId?: number;
        userRole?: string;
    }
}
export declare class EvaluationSocket {
    private io;
    private evaluationService;
    private reconnectInterval;
    constructor(io: SocketIOServer);
    private setupSocketHandlers;
    private getAssessmentStatus;
    private handleTaskEvaluation;
    broadcastTaskUpdate(assessmentId: number, taskUpdate: any): Promise<void>;
}
//# sourceMappingURL=evaluationSocket.d.ts.map