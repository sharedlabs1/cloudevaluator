import express from 'express';
import {
  startEvaluation,
  retryEvaluation,
  cancelEvaluation,
  getEvaluationLogs
} from '../controllers/evaluationController';
import { questionController } from '../controllers/questionController';

/**
 * @swagger
 * tags:
 *   name: Evaluation
 *   description: API endpoints for evaluation operations
 */

/**
 * @swagger
 * /api/evaluation/start:
 *   post:
 *     summary: Start an evaluation for a specific assessment
 *     tags: [Evaluation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentAssessmentId:
 *                 type: integer
 *                 description: ID of the student assessment
 *               initiatedBy:
 *                 type: string
 *                 description: User who initiated the evaluation
 *             required:
 *               - studentAssessmentId
 *               - initiatedBy
 *     responses:
 *       201:
 *         description: Evaluation started successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Failed to start evaluation
 */

/**
 * @swagger
 * /api/evaluation/cancel:
 *   post:
 *     summary: Cancel an ongoing evaluation
 *     tags: [Evaluation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               evaluationJobId:
 *                 type: integer
 *                 description: ID of the evaluation job
 *               userId:
 *                 type: string
 *                 description: User who is cancelling the evaluation
 *             required:
 *               - evaluationJobId
 *               - userId
 *     responses:
 *       200:
 *         description: Evaluation cancelled successfully
 *       400:
 *         description: Missing required fields or failed to cancel evaluation
 *       500:
 *         description: Failed to cancel evaluation
 */

/**
 * @swagger
 * /api/evaluation/retry:
 *   post:
 *     summary: Retry a failed evaluation
 *     tags: [Evaluation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               originalJobId:
 *                 type: integer
 *                 description: ID of the original evaluation job
 *               userId:
 *                 type: string
 *                 description: User who is retrying the evaluation
 *             required:
 *               - originalJobId
 *               - userId
 *     responses:
 *       201:
 *         description: Evaluation retry started successfully
 *       400:
 *         description: Missing required fields or original job not found
 *       500:
 *         description: Failed to retry evaluation
 */

/**
 * @swagger
 * tags:
 *   name: Questions
 *   description: Endpoints for managing questions
 */

/**
 * @swagger
 * /api/questions:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scenario:
 *                 type: string
 *                 description: Scenario for the question
 *               tasks:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of tasks for the question
 *               evaluationScript:
 *                 type: string
 *                 description: Python script to evaluate the question
 *             required:
 *               - scenario
 *               - tasks
 *               - evaluationScript
 *     responses:
 *       201:
 *         description: Question created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Failed to create question
 */

/**
 * @swagger
 * /api/questions/{id}/validate:
 *   post:
 *     summary: Validate a task within a question
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskIndex:
 *                 type: integer
 *                 description: Index of the task to validate
 *             required:
 *               - taskIndex
 *     responses:
 *       200:
 *         description: Task validated successfully
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Error during validation
 */

/**
 * @swagger
 * /api/assessments/{id}/submit:
 *   post:
 *     summary: Submit an assessment and calculate the final score
 *     tags: [Assessments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the assessment
 *     responses:
 *       200:
 *         description: Assessment submitted successfully
 *       500:
 *         description: Error during submission
 */

const router = express.Router();

// Route to start an evaluation
router.post('/api/evaluation/start', startEvaluation);

// Route to cancel an evaluation
router.post('/api/evaluation/cancel', cancelEvaluation);

// Route to retry an evaluation
router.post('/api/evaluation/retry', retryEvaluation);

// Route to create a question
router.post('/questions', (req, res) => questionController.createQuestion(req, res));

// Route to validate a task within a question
router.post('/questions/:id/validate', (req, res) => questionController.validateTask(req, res));

// Route to submit an assessment
router.post('/assessments/:id/submit', (req, res) => questionController.submitAssessment(req, res));

// Add a new route for evaluation logs
router.get('/api/evaluation/logs/:studentAssessmentId', getEvaluationLogs);

export default router;