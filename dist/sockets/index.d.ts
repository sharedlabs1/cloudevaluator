import { Server as HTTPServer } from 'http';
export declare class SocketService {
    private io;
    constructor(server: HTTPServer);
    private setupSocketAuth;
    private setupSocketHandlers;
    emitToUser(userId: number, event: string, data: any): void;
    emitToAssessment(assessmentId: number, event: string, data: any): void;
    emitToProctor(sessionId: number, event: string, data: any): void;
    emitToMonitoring(event: string, data: any): void;
    private getAssessmentStatus;
    to(room: string): import("socket.io").BroadcastOperator<import("socket.io/dist/typed-events").DecorateAcknowledgementsWithMultipleResponses<import("socket.io").DefaultEventsMap>, any>;
}
declare let socketService: SocketService;
export declare const initializeSocket: (server: HTTPServer) => SocketService;
export { socketService };
//# sourceMappingURL=index.d.ts.map