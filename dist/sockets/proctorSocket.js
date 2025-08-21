"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProctorSocketService = exports.setupProctorSocket = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const reconnectInterval = 5000;
const setupProctorSocket = (socket) => {
    socket.on('connect', () => {
        console.log('Connected to proctor WebSocket');
    });
    socket.on('disconnect', (reason) => {
        console.error('Disconnected from proctor WebSocket:', reason);
        if (reason !== 'io client disconnect') {
            setTimeout(() => {
                console.log('Attempting to reconnect to proctor WebSocket...');
                socket.connect();
            }, reconnectInterval);
        }
    });
    socket.on('error', (error) => {
        console.error('Proctor WebSocket error:', error);
    });
    socket.on('connect_error', (error) => {
        console.error('Connection error with proctor WebSocket:', error);
        setTimeout(() => {
            console.log('Retrying connection to proctor WebSocket...');
            socket.connect();
        }, reconnectInterval);
    });
};
exports.setupProctorSocket = setupProctorSocket;
class ProctorSocketService {
    constructor(io) {
        this.io = io;
        this.setupSocketHandlers();
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            logger_1.default.info(`Proctor connected: ${socket.id}`);
            socket.on('joinProctorSession', (sessionId) => {
                if (socket.userRole === 'proctor' || socket.userRole === 'admin') {
                    socket.join(`proctor-session-${sessionId}`);
                    logger_1.default.info(`Proctor ${socket.userId} joined session ${sessionId}`);
                }
                else {
                    logger_1.default.warn(`Unauthorized user tried to join proctor session: ${socket.id}`);
                }
            });
            socket.on('reportViolation', (data) => {
                this.io.to(`proctor-session-${data.sessionId}`).emit('violationReported', {
                    proctorId: socket.userId,
                    type: data.type,
                    evidence: data.evidence,
                    timestamp: new Date(),
                });
                logger_1.default.info(`Violation reported by proctor ${socket.userId} in session ${data.sessionId}`);
            });
            socket.on('disconnect', () => {
                logger_1.default.info(`Proctor disconnected: ${socket.id}`);
            });
        });
    }
}
exports.ProctorSocketService = ProctorSocketService;
//# sourceMappingURL=proctorSocket.js.map