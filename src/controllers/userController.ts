// src/controllers/userController.ts
import { Request, Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { authService } from '../services/authService';
import logger from '../utils/logger';

export class UserController {
  /**
   * @swagger
   * /users:
   *   get:
   *     summary: Retrieve a list of users
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Number of users per page
   *       - in: query
   *         name: role
   *         schema:
   *           type: string
   *         description: Filter by user role
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search term for user details
   *     responses:
   *       200:
   *         description: A list of users
   *       500:
   *         description: Failed to fetch users
   */
  async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, role, search } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      let queryText = `
        SELECT id, email, username, role, first_name, last_name, is_active, created_at
        FROM users
        WHERE 1=1
      `;
      
      const queryParams: any[] = [];
      
      if (role) {
        queryText += ` AND role = ${queryParams.length + 1}`;
        queryParams.push(role);
      }
      
      if (search) {
        queryText += ` AND (first_name ILIKE ${queryParams.length + 1} OR last_name ILIKE ${queryParams.length + 1} OR email ILIKE ${queryParams.length + 1})`;
        queryParams.push(`%${search}%`);
      }
      
      queryText += ` ORDER BY created_at DESC LIMIT ${queryParams.length + 1} OFFSET ${queryParams.length + 2}`;
      queryParams.push(Number(limit), offset);

      const result = await query(queryText, queryParams);
      
      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
      const countParams: any[] = [];
      
      if (role) {
        countQuery += ` AND role = ${countParams.length + 1}`;
        countParams.push(role);
      }
      
      if (search) {
        countQuery += ` AND (first_name ILIKE ${countParams.length + 1} OR last_name ILIKE ${countParams.length + 1} OR email ILIKE ${countParams.length + 1})`;
        countParams.push(`%${search}%`);
      }
      
      const countResult = await query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }

  /**
   * @swagger
   * /users:
   *   post:
   *     summary: Create a new user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               username:
   *                 type: string
   *               role:
   *                 type: string
   *               first_name:
   *                 type: string
   *               last_name:
   *                 type: string
   *     responses:
   *       201:
   *         description: User created successfully
   *       400:
   *         description: Bad request
   *       500:
   *         description: Failed to create user
   */
  async createUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await authService.createUser(req.body);
      
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      logger.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }
  }

  /**
   * @swagger
   * /users/{id}:
   *   put:
   *     summary: Update a user
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
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               username:
   *                 type: string
   *               role:
   *                 type: string
   *               first_name:
   *                 type: string
   *               last_name:
   *                 type: string
   *               is_active:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: User updated successfully
   *       404:
   *         description: User not found
   *       500:
   *         description: Failed to update user
   */
  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { email, username, role, first_name, last_name, is_active } = req.body;

      const result = await query(`
        UPDATE users 
        SET email = $2, username = $3, role = $4, first_name = $5, last_name = $6, is_active = $7, updated_at = NOW()
        WHERE id = $1
        RETURNING id, email, username, role, first_name, last_name, is_active
      `, [id, email, username, role, first_name, last_name, is_active]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: result.rows[0],
        message: 'User updated successfully'
      });

      logger.info(`User updated: ${id}`);
    } catch (error) {
      logger.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }

  /**
   * @swagger
   * /users/{id}:
   *   delete:
   *     summary: Delete a user
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
   *       404:
   *         description: User not found
   *       500:
   *         description: Failed to delete user
   */
  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Soft delete by setting is_active to false
      const result = await query(`
        UPDATE users 
        SET is_active = false, updated_at = NOW()
        WHERE id = $1
        RETURNING id
      `, [id]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });

      logger.info(`User deleted: ${id}`);
    } catch (error) {
      logger.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }

  /**
   * @swagger
   * /users/role/{role}:
   *   get:
   *     summary: Retrieve users by role
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
   *       500:
   *         description: Failed to fetch users
   */
  async getUsersByRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { role } = req.params;

      const result = await query(`
        SELECT id, email, username, first_name, last_name
        FROM users 
        WHERE role = $1 AND is_active = true
        ORDER BY first_name, last_name
      `, [role]);

      res.json({
        success: true,
        data: result.rows,
        message: `${role}s retrieved successfully`
      });
    } catch (error) {
      logger.error('Error fetching users by role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }

  /**
   * @swagger
   * /users/{id}/assessments:
   *   get:
   *     summary: Retrieve assessments for a user
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     responses:
   *       200:
   *         description: Assessments retrieved successfully
   *       500:
   *         description: Failed to fetch assessments
   */
  async getUserAssessments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const assessments = await query(
        `SELECT * FROM assessments WHERE user_id = $1`,
        [userId]
      );
      res.status(200).json({ success: true, data: assessments.rows });
    } catch (error) {
      logger.error('Error fetching user assessments:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch user assessments' });
    }
  }

  /**
   * @swagger
   * /users/{id}/assessments:
   *   post:
   *     summary: Add an assessment for a user
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
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               dueDate:
   *                 type: string
   *                 format: date
   *     responses:
   *       201:
   *         description: Assessment added successfully
   *       500:
   *         description: Failed to add assessment
   */
  async addUserAssessment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const { title, description, dueDate } = req.body;
      const result = await query(
        `INSERT INTO assessments (user_id, title, description, due_date) VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, title, description, dueDate]
      );
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      logger.error('Error adding user assessment:', error);
      res.status(500).json({ success: false, message: 'Failed to add user assessment' });
    }
  }
}

export const userController = new UserController();
