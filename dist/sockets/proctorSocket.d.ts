import { Server as SocketIOServer } from 'socket.io';
export declare const setupProctorSocket: (socket: any) => void;
export declare class ProctorSocketService {
    private io;
    constructor(io: SocketIOServer);
    private setupSocketHandlers;
}
//# sourceMappingURL=proctorSocket.d.ts.map