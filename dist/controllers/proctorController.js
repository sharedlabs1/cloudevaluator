"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProctorDashboard = exports.saveRecording = exports.recordViolation = exports.startProctoringSession = void 0;
const proctorService_1 = require("../services/proctorService");
const database_1 = __importDefault(require("../config/database"));
const sockets_1 = require("../sockets");
const proctorService = new proctorService_1.ProctorService(database_1.default, sockets_1.socketService);
const startProctoringSession = async (req, res) => {
    try {
        const { studentAssessmentId, proctorId } = req.body;
        const session = await proctorService.startProctoring(studentAssessmentId, proctorId);
        res.status(201).json({ success: true, data: session });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: errorMessage });
    }
};
exports.startProctoringSession = startProctoringSession;
const recordViolation = async (req, res) => {
    try {
        const { sessionId, violationType, evidence } = req.body;
        const violation = await proctorService.recordViolation(sessionId, violationType, evidence);
        res.status(200).json({ success: true, data: violation });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: errorMessage });
    }
};
exports.recordViolation = recordViolation;
const saveRecording = async (req, res) => {
    try {
        const { sessionId, recordingType, filePath } = req.body;
        const recording = await proctorService.saveRecording(sessionId, recordingType, filePath);
        res.status(200).json({ success: true, data: recording });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: errorMessage });
    }
};
exports.saveRecording = saveRecording;
const getProctorDashboard = async (_req, res) => {
    try {
        const dashboardData = await proctorService.getProctorDashboard();
        res.status(200).json({ success: true, data: dashboardData });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: errorMessage });
    }
};
exports.getProctorDashboard = getProctorDashboard;
//# sourceMappingURL=proctorController.js.map