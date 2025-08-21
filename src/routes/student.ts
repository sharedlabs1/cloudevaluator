import { Router } from 'express';
import { getStudentAssessments, submitAssessment } from '../controllers/assessmentController';
import { evaluationController } from '../controllers/evaluationController';
import { getStudentDashboard } from '../controllers/studentController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Student
 *   description: API endpoints for student operations
 */

/**
 * @swagger
 * /api/student/assessments:
 *   get:
 *     summary: Get all assessments for a student
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: List of assessments
 */

// Route to get all assessments for a student
router.get('/api/student/assessments', (req, res) => getStudentAssessments(req, res));

/**
 * @swagger
 * /api/student/assessments/{id}/submit:
 *   post:
 *     summary: Submit an assessment
 *     tags: [Student]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Assessment ID
 *     responses:
 *       200:
 *         description: Assessment submitted successfully
 */

// Route to submit an assessment
router.post('/api/student/assessments/:id/submit', (req, res) => submitAssessment(req, res));

/**
 * @swagger
 * /api/student/tasks/{taskId}/evaluate:
 *   post:
 *     summary: Request evaluation for a task
 *     tags: [Student]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task evaluation requested successfully
 */

// Route to request evaluation for a task
router.post('/api/student/tasks/:taskId/evaluate', (req, res) => evaluationController.retryEvaluation(req, res));

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get student dashboard data
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: Student dashboard data
 */

// Add a route for student dashboard
router.get('/dashboard', (req, res) => getStudentDashboard(req, res));

export default router;

