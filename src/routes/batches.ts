// src/routes/batches.ts
import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createBatchSchema } from '../utils/validators';
import {
  createBatch,
  addStudentsToBatch,
  removeStudentFromBatch,
  getBatchDetails
} from '../controllers/batchController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Batches
 *   description: API endpoints for batch operations
 */

/**
 * @swagger
 * /api/batches:
 *   post:
 *     summary: Create a new batch
 *     tags: [Batches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBatch'
 *     responses:
 *       201:
 *         description: Batch created successfully
 *       400:
 *         description: Validation error
 */
router.post('/',
  authenticateToken,
  authorizeRoles(['admin', 'instructor']),
  validateRequest(createBatchSchema),
  createBatch
);

/**
 * @swagger
 * /api/batches:
 *   get:
 *     summary: Get all batches
 *     tags: [Batches]
 *     responses:
 *       200:
 *         description: List of batches
 */
// router.get('/', getBatches);

/**
 * @swagger
 * /api/batches/{id}:
 *   get:
 *     summary: Get batch details
 *     tags: [Batches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Batch ID
 *     responses:
 *       200:
 *         description: Batch details retrieved successfully
 */
router.get('/:id',
  authenticateToken,
  getBatchDetails
);

/**
 * @swagger
 * /api/batches/{id}/students:
 *   post:
 *     summary: Add students to a batch
 *     tags: [Batches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Batch ID
 *     responses:
 *       200:
 *         description: Students added successfully
 */
router.post('/:id/students',
  authenticateToken,
  authorizeRoles(['admin', 'instructor']),
  addStudentsToBatch
);

/**
 * @swagger
 * /api/batches/{id}/students/{student_id}:
 *   delete:
 *     summary: Remove a student from a batch
 *     tags: [Batches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Batch ID
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student removed successfully
 */
router.delete('/:id/students/:student_id',
  authenticateToken,
  authorizeRoles(['admin', 'instructor']),
  removeStudentFromBatch
);

/**
 * @swagger
 * /api/batches/bulk-upload:
 *   post:
 *     summary: Bulk upload students to batches
 *     tags: [Batches]
 *     responses:
 *       200:
 *         description: Bulk upload successful
 */
// router.post('/bulk-upload', bulkUploadStudents);

export default router;
