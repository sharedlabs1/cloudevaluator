// src/routes/users.ts
import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createUserSchema, createAssessmentSchema } from '../utils/validators';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for user operations
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/',
  authenticateToken,
  authorizeRoles(['admin']),
  userController.getUsers
);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */
router.post('/',
  authenticateToken,
  authorizeRoles(['admin']),
  validateRequest(createUserSchema),
  userController.createUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/:id',
  authenticateToken,
  authorizeRoles(['admin']),
  userController.updateUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete('/:id',
  authenticateToken,
  authorizeRoles(['admin']),
  userController.deleteUser
);

/**
 * @swagger
 * /api/users/by-role/{role}:
 *   get:
 *     summary: Get users by role
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *         description: User role
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/by-role/:role',
  authenticateToken,
  userController.getUsersByRole
);

/**
 * @swagger
 * /api/users/{id}/assessments:
 *   get:
 *     summary: Get assessments for a user
 *     tags: [Assessments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of assessments for the user
 */
router.get('/:id/assessments',
  authenticateToken,
  userController.getUserAssessments
);

/**
 * @swagger
 * /api/users/{id}/assessments:
 *   post:
 *     summary: Add an assessment for a user
 *     tags: [Assessments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAssessment'
 *     responses:
 *       201:
 *         description: Assessment added successfully
 */
router.post('/:id/assessments',
  authenticateToken,
  validateRequest(createAssessmentSchema), // Corrected schema
  userController.addUserAssessment
);

export default router;

// src/controllers/userController.ts
import { Request, Response } from 'express';

export class UserController {
  // Other methods

  /**
   * Get assessments for a user
   * @param req Express request object
   * @param res Express response object
   */
  async getUserAssessments(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      // Replace the following line with actual logic to fetch assessments
      const assessments: any[] = []; // Example: await AssessmentService.getAssessmentsByUserId(userId);
      res.status(200).json(assessments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user assessments' });
    }
  }
}
