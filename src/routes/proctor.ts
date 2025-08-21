import { Router } from 'express';
// Fix incorrect import
import {
  startProctoringSession,
  recordViolation,
  saveRecording,
  getProctorDashboard
} from '../controllers/proctorController';
// Import ProctorService
import { ProctorService } from '../services/proctorService';
// Pass required arguments to ProctorController
import db from '../config/database';
import { socketService as io } from '../sockets';

/**
 * @swagger
 * tags:
 *   name: Proctor
 *   description: API endpoints for proctor operations
 */

// Correctly instantiate ProctorController with ProctorService, db, and io
const proctorService = new ProctorService(db, io);

const router = Router();

// Add a route for proctor dashboard
router.get('/dashboard', getProctorDashboard);

// Add routes for proctoring APIs
router.post('/api/proctor/start', startProctoringSession);
router.post('/api/proctor/violation', recordViolation);
router.post('/api/proctor/recording', saveRecording);
router.get('/api/proctor/dashboard', getProctorDashboard);

export default router;