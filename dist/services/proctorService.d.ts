import { Pool } from 'pg';
import { SocketService } from '../sockets';
import { ProctorSession } from '../models/ProctorSession';
import { Violation } from '../models/Violation';
export declare class ProctorService {
    private db;
    private io;
    constructor(db: Pool, io: SocketService);
    startProctoring(studentAssessmentId: number, proctorId: number): Promise<any>;
    recordViolation(sessionId: number, violationType: string, evidence: any): Promise<void>;
    saveRecording(sessionId: number, recordingType: 'screen' | 'camera', filePath: string): Promise<void>;
    getOngoingSessions(proctorId: number): Promise<ProctorSession[]>;
    getRecentViolations(proctorId: number): Promise<Violation[]>;
    getProctorDashboard(): Promise<{
        sessions: never[];
        violations: never[];
    }>;
}
//# sourceMappingURL=proctorService.d.ts.map