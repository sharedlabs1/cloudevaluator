import { Router } from 'express';
import { userController } from '../controllers/userController';
import { reportController } from '../controllers/reportController';
import { getAdminDashboard } from '../controllers/adminController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API endpoints for admin operations
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of users
 */
// Route to get all users
router.get('/api/admin/users', (req, res) => userController.getUsers(req, res));

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Admin]
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
// Route to delete a user by ID
router.delete('/api/admin/users/:id', (req, res) => userController.deleteUser(req, res));

// Add a route for admin dashboard
router.get('/dashboard', getAdminDashboard);

export default router;

