// src/controllers/authController.ts
import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { ApiResponse } from '../types/common';
import logger from '../utils/logger';
import { query } from '../config/database';

export class AuthController {
  /**
   * @swagger
   * /auth/generate-otp:
   *   post:
   *     summary: Generate an OTP for user authentication
   *     tags:
   *       - Auth
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 example: user@example.com
   *     responses:
   *       200:
   *         description: OTP generated successfully
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  async generateOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required'
        });
        return;
      }

      const result = await authService.generateOTP(email);
      
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('Error in generateOTP:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /auth/verify-otp:
   *   post:
   *     summary: Verify the OTP for user authentication
   *     tags:
   *       - Auth
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 example: user@example.com
   *               otp:
   *                 type: string
   *                 example: 123456
   *     responses:
   *       200:
   *         description: OTP verified successfully
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        res.status(400).json({
          success: false,
          message: 'Email and OTP are required'
        });
        return;
      }

      const result = await authService.verifyOTP(email, otp);
      
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('Error in verifyOTP:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /auth/create-user:
   *   post:
   *     summary: Create a new user
   *     tags:
   *       - Auth
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 example: password123
   *     responses:
   *       201:
   *         description: User created successfully
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.createUser(req.body);
      
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      logger.error('Error in createUser:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /auth/profile:
   *   get:
   *     summary: Get the profile of the authenticated user
   *     tags:
   *       - Auth
   *     responses:
   *       200:
   *         description: Profile retrieved successfully
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is missing from the request'
        });
        return;
      }

      const result = await query(`
        SELECT id, email, username, role, first_name, last_name, created_at
        FROM users 
        WHERE id = $1 AND is_active = true
      `, [userId]);

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
        message: 'Profile retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Login a user
   *     tags:
   *       - Auth
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 example: password123
   *     responses:
   *       200:
   *         description: Login successful
   *       401:
   *         description: Invalid credentials
   *       500:
   *         description: Internal server error
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      const user = await authService.authenticate(email, password);

      if (!user) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const token = authService.generateToken(user);

      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const authController = new AuthController();

