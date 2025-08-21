import { Request, Response } from 'express';
import { ProctorService } from '../services/proctorService';
import db from '../config/database';
import { socketService as io } from '../sockets';

/**
 * @swagger
 * tags:
 *   name: Proctoring
 *   description: API endpoints for managing proctoring sessions
 */

/**
 * @swagger
 * /proctor/start:
 *   post:
 *     summary: Start a proctoring session
 *     tags: [Proctoring]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentAssessmentId:
 *                 type: integer
 *                 example: 1
 *               proctorId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Proctoring session started successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Failed to start proctoring session
 */

/**
 * @swagger
 * /proctor/violation:
 *   post:
 *     summary: Record a violation during a proctoring session
 *     tags: [Proctoring]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: integer
 *                 example: 1
 *               violationType:
 *                 type: string
 *                 example: "cheating"
 *               evidence:
 *                 type: object
 *                 example: { screenshot: "base64string" }
 *     responses:
 *       200:
 *         description: Violation recorded successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Failed to record violation
 */

/**
 * @swagger
 * /proctor/recording:
 *   post:
 *     summary: Save a recording for a proctoring session
 *     tags: [Proctoring]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: integer
 *                 example: 1
 *               recordingType:
 *                 type: string
 *                 enum: ["screen", "camera"]
 *                 example: "screen"
 *               filePath:
 *                 type: string
 *                 example: "/recordings/session1/screen.mp4"
 *     responses:
 *       200:
 *         description: Recording saved successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Failed to save recording
 */

const proctorService = new ProctorService(db, io);

export const startProctoringSession = async (req: Request, res: Response) => {
  try {
    const { studentAssessmentId, proctorId } = req.body;
    const session = await proctorService.startProctoring(studentAssessmentId, proctorId);
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const recordViolation = async (req: Request, res: Response) => {
  try {
    const { sessionId, violationType, evidence } = req.body;
    const violation = await proctorService.recordViolation(sessionId, violationType, evidence);
    res.status(200).json({ success: true, data: violation });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const saveRecording = async (req: Request, res: Response) => {
  try {
    const { sessionId, recordingType, filePath } = req.body;
    const recording = await proctorService.saveRecording(sessionId, recordingType, filePath);
    res.status(200).json({ success: true, data: recording });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const getProctorDashboard = async (_req: Request, res: Response) => {
  try {
    const dashboardData = await proctorService.getProctorDashboard();
    res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

