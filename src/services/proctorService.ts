import { Pool } from 'pg';
import { SocketService } from '../sockets';

// Import ProctorSession and Violation
import { ProctorSession } from '../models/ProctorSession';
import { Violation } from '../models/Violation';

// src/services/proctorService.ts
export class ProctorService {
    private db: Pool;
    private io: SocketService;

    constructor(db: Pool, io: SocketService) {
        this.db = db;
        this.io = io;
    }

    async startProctoring(studentAssessmentId: number, proctorId: number): Promise<any> {
        try {
            const session = await this.db.query(`
                INSERT INTO proctoring_sessions (student_assessment_id, proctor_id, session_start, status)
                VALUES ($1, $2, NOW(), 'active')
                RETURNING *
            `, [studentAssessmentId, proctorId]);
            
            return session.rows[0];
        } catch (error) {
            console.error('Error starting proctoring session:', error);
            throw new Error('Failed to start proctoring session');
        }
    }
    
    async recordViolation(sessionId: number, violationType: string, evidence: any): Promise<void> {
        try {
            await this.db.query(`
                UPDATE proctoring_sessions 
                SET violation_logs = COALESCE(violation_logs, '[]'::json) || $2::json
                WHERE id = $1
            `, [sessionId, JSON.stringify({
                type: violationType,
                timestamp: new Date(),
                evidence
            })]);
            
            // Notify proctor
            this.io.to(`proctor-session-${sessionId}`).emit('violation', {
                type: violationType,
                timestamp: new Date(),
                evidence
            });
        } catch (error) {
            console.error('Error recording violation:', error);
            throw new Error('Failed to record violation');
        }
    }
    
    async saveRecording(sessionId: number, recordingType: 'screen' | 'camera', filePath: string): Promise<void> {
        try {
            const column = recordingType === 'screen' ? 'screen_recording_path' : 'camera_recording_path';
            
            await this.db.query(`
                UPDATE proctoring_sessions 
                SET ${column} = $2
                WHERE id = $1
            `, [sessionId, filePath]);
        } catch (error) {
            console.error('Error saving recording:', error);
            throw new Error('Failed to save recording');
        }
    }

    async getOngoingSessions(proctorId: number): Promise<ProctorSession[]> {
        // Mock implementation
        return [
            { id: 1, studentName: 'John Doe', assessmentTitle: 'Cloud Basics', startTime: new Date() },
        ];
    }

    async getRecentViolations(proctorId: number): Promise<Violation[]> {
        // Mock implementation
        return [
            { id: 1, studentName: 'John Doe', assessmentTitle: 'Cloud Basics', type: 'Cheating', timestamp: new Date() },
        ];
    }

    async getProctorDashboard() {
        // TODO: Implement dashboard logic
        return { sessions: [], violations: [] };
    }
}
