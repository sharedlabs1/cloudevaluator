"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProctorService = void 0;
class ProctorService {
    constructor(db, io) {
        this.db = db;
        this.io = io;
    }
    async startProctoring(studentAssessmentId, proctorId) {
        try {
            const session = await this.db.query(`
                INSERT INTO proctoring_sessions (student_assessment_id, proctor_id, session_start, status)
                VALUES ($1, $2, NOW(), 'active')
                RETURNING *
            `, [studentAssessmentId, proctorId]);
            return session.rows[0];
        }
        catch (error) {
            console.error('Error starting proctoring session:', error);
            throw new Error('Failed to start proctoring session');
        }
    }
    async recordViolation(sessionId, violationType, evidence) {
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
            this.io.to(`proctor-session-${sessionId}`).emit('violation', {
                type: violationType,
                timestamp: new Date(),
                evidence
            });
        }
        catch (error) {
            console.error('Error recording violation:', error);
            throw new Error('Failed to record violation');
        }
    }
    async saveRecording(sessionId, recordingType, filePath) {
        try {
            const column = recordingType === 'screen' ? 'screen_recording_path' : 'camera_recording_path';
            await this.db.query(`
                UPDATE proctoring_sessions 
                SET ${column} = $2
                WHERE id = $1
            `, [sessionId, filePath]);
        }
        catch (error) {
            console.error('Error saving recording:', error);
            throw new Error('Failed to save recording');
        }
    }
    async getOngoingSessions(proctorId) {
        return [
            { id: 1, studentName: 'John Doe', assessmentTitle: 'Cloud Basics', startTime: new Date() },
        ];
    }
    async getRecentViolations(proctorId) {
        return [
            { id: 1, studentName: 'John Doe', assessmentTitle: 'Cloud Basics', type: 'Cheating', timestamp: new Date() },
        ];
    }
    async getProctorDashboard() {
        return { sessions: [], violations: [] };
    }
}
exports.ProctorService = ProctorService;
//# sourceMappingURL=proctorService.js.map