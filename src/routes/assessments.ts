import { Router } from 'express';
import {
  createAssessment,
  allocateAssessment,
  startAssessment,
  submitAssessment,
  getAssessmentDetails,
  getAssessmentProgress,
  getAssessmentResults,
  getAssessments,
  updateAssessment,
  deleteAssessment
} from '../controllers/assessmentController';
import {
  addQuestionToAssessment,
  getQuestionsForAssessment
} from '../controllers/questionController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createAssessmentSchema } from '../utils/validators';

const router = Router();

/**
 * @swagger
 * /api/assessments/:
 *   post:
 *     summary: Create a new assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAssessment'
 *     responses:
 *       201:
 *         description: Assessment created successfully
 *       400:
 *         description: Invalid request
 */
router.post('/',
  authenticateToken,
  authorizeRoles(['admin', 'instructor']),
  validateRequest(createAssessmentSchema),
  createAssessment
);

/**
 * @swagger
 * /api/assessments/:
 *   get:
 *     summary: Get all assessments
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assessments
 *       401:
 *         description: Unauthorized
 */
router.get('/',
  authenticateToken,
  getAssessments
);

/**
 * @swagger
 * /api/assessments/{id}:
 *   get:
 *     summary: Get assessment details
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The assessment ID
 *     responses:
 *       200:
 *         description: Assessment details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assessment not found
 */
router.get('/:id',
  authenticateToken,
  getAssessmentDetails
);

/**
 * @swagger
 * /api/assessments/allocate:
 *   post:
 *     summary: Allocate an assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assessment allocated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/allocate',
  authenticateToken,
  authorizeRoles(['admin', 'instructor']),
  allocateAssessment
);

/**
 * @swagger
 * /api/assessments/start:
 *   post:
 *     summary: Start an assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assessment started successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/start',
  authenticateToken,
  authorizeRoles(['student']),
  startAssessment
);

/**
 * @swagger
 * /api/assessments/submit:
 *   post:
 *     summary: Submit an assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assessment submitted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/submit',
  authenticateToken,
  authorizeRoles(['student']),
  submitAssessment
);

/**
 * @swagger
 * /api/assessments/validate-task:
 *   post:
 *     summary: Validate a task in an assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task validated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/validate-task',
  authenticateToken,
  authorizeRoles(['student']),
  // validateTask
);

/**
 * @swagger
 * /api/assessments/student/my-assessments:
 *   get:
 *     summary: Get student's assessments
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of student's assessments
 *       401:
 *         description: Unauthorized
 */
router.get('/student/my-assessments',
  authenticateToken,
  authorizeRoles(['student']),
  // getStudentAssessments
);

/**
 * @swagger
 * /api/assessments/student/{student_assessment_id}/progress:
 *   get:
 *     summary: Get assessment progress
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: student_assessment_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The student assessment ID
 *     responses:
 *       200:
 *         description: Assessment progress
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assessment not found
 */
router.get('/student/:student_assessment_id/progress',
  authenticateToken,
  authorizeRoles(['student']),
  getAssessmentProgress
);

/**
 * @swagger
 * /api/assessments/results/{student_assessment_id}:
 *   get:
 *     summary: Get assessment results
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: student_assessment_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The student assessment ID
 *     responses:
 *       200:
 *         description: Assessment results
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assessment not found
 */
router.get('/results/:student_assessment_id',
  authenticateToken,
  authorizeRoles(['student']),
  getAssessmentResults
);

/**
 * @swagger
 * /api/assessments/{id}:
 *   put:
 *     summary: Update an assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The assessment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAssessment'
 *     responses:
 *       200:
 *         description: Assessment updated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assessment not found
 */
router.put('/:id',
  authenticateToken,
  authorizeRoles(['admin', 'instructor']),
  updateAssessment
);

/**
 * @swagger
 * /api/assessments/{id}:
 *   delete:
 *     summary: Delete an assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The assessment ID
 *     responses:
 *       200:
 *         description: Assessment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assessment not found
 */
router.delete('/:id',
  authenticateToken,
  authorizeRoles(['admin', 'instructor']),
  deleteAssessment
);

/**
 * @swagger
 * /api/assessments/{assessmentId}/questions:
 *   post:
 *     summary: Add a question to an assessment
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The assessment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddQuestion'
 *     responses:
 *       201:
 *         description: Question added successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/:assessmentId/questions',
  authenticateToken,
  authorizeRoles(['admin', 'instructor']),
  addQuestionToAssessment
);

/**
 * @swagger
 * /api/assessments/{assessmentId}/questions:
 *   get:
 *     summary: Get questions for an assessment
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The assessment ID
 *     responses:
 *       200:
 *         description: List of questions
 *       401:
 *         description: Unauthorized
 */
router.get('/:assessmentId/questions',
  authenticateToken,
  authorizeRoles(['admin', 'instructor']),
  getQuestionsForAssessment
);

export default router;

