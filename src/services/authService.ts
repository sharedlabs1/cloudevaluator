// src/services/authService.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/database';
import { emailService } from './emailService';
import { User, OTPToken } from '../types/auth';
import logger from '../utils/logger';

export class AuthService {
  async generateOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user exists
      const userResult = await query('SELECT id FROM users WHERE email = $1 AND is_active = true', [email]);
      
      if (userResult.rows.length === 0) {
        return { success: false, message: 'User not found or inactive' };
      }

      const userId = userResult.rows[0].id;
      const otp = crypto.randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Invalidate any existing OTPs
      await query('UPDATE otp_tokens SET is_used = true WHERE user_id = $1 AND is_used = false', [userId]);

      // Create new OTP
      await query(
        'INSERT INTO otp_tokens (user_id, otp_code, expires_at) VALUES ($1, $2, $3)',
        [userId, otp, expiresAt]
      );

      // Send OTP via email
      await emailService.sendOTP(email, otp);

      logger.info(`OTP generated for user: ${email}`);
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      logger.error('Error generating OTP:', error);
      return { success: false, message: 'Failed to generate OTP' };
    }
  }

  async verifyOTP(email: string, otp: string): Promise<{ success: boolean; token?: string; user?: any; message: string }> {
    try {
      const result = await query(`
        SELECT u.id, u.email, u.role, u.first_name, u.last_name, u.username
        FROM users u
        JOIN otp_tokens o ON u.id = o.user_id
        WHERE u.email = $1 AND o.otp_code = $2 
        AND o.expires_at > NOW() AND o.is_used = false
      `, [email, otp]);

      if (result.rows.length === 0) {
        return { success: false, message: 'Invalid or expired OTP' };
      }

      const user = result.rows[0];

      // Mark OTP as used
      await query('UPDATE otp_tokens SET is_used = true WHERE otp_code = $1', [otp]);

      // Generate JWT token
      const secretKey = process.env.JWT_SECRET || 'defaultSecret';
      
      const payload = { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        username: user.username 
      };

      const options: jwt.SignOptions = {
        expiresIn: '8h'
      };

      const token = jwt.sign(payload, secretKey, options);

      logger.info(`User authenticated successfully: ${email}`);
      return { 
        success: true, 
        token, 
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username
        },
        message: 'Authentication successful' 
      };
    } catch (error) {
      logger.error('Error verifying OTP:', error);
      return { success: false, message: 'Authentication failed' };
    }
  }

  async createUser(userData: Partial<User>): Promise<{ success: boolean; user?: any; message: string }> {
    try {
      const { email, username, password = '', role, first_name, last_name } = userData as Partial<User> & { password?: string };

      // Ensure role is defined and assign a default value if undefined
      const roleValue = role || 'STUDENT'; // Default to 'STUDENT' if role is undefined

      // Add validation for the role field
      const validRoles = ['STUDENT', 'ADMIN', 'INSTRUCTOR'];
      if (!validRoles.includes(roleValue)) {
        return { success: false, message: `Invalid role. Valid roles are: ${validRoles.join(', ')}` };
      }

      // Convert role to uppercase to match the database enum values
      const normalizedRole = roleValue.toUpperCase();

      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );

      if (existingUser.rows.length > 0) {
        return { success: false, message: 'User already exists with this email or username' };
      }

      let passwordHash = null;
      if (password) {
        passwordHash = await bcrypt.hash(password, 12);
      }

      const result = await query(`
        INSERT INTO users (email, username, password_hash, role, first_name, last_name)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, username, role, first_name, last_name, created_at
      `, [email, username, passwordHash, normalizedRole, first_name, last_name]);

      const newUser = result.rows[0];
      logger.info(`User created successfully: ${email}`);

      return {
        success: true,
        user: newUser,
        message: 'User created successfully'
      };
    } catch (error) {
      logger.error('Error creating user:', error);
      return { success: false, message: 'Failed to create user' };
    }
  }

  async authenticate(email: string, password: string): Promise<any> {
    try {
      console.log('Authenticating user:', email);
      const result = await query('SELECT id, email, password_hash, role FROM users WHERE email = $1 AND is_active = true', [email]);
      
      console.log('Database query result:', result.rows.length, 'users found');
      
      if (result.rows.length === 0) {
        console.log('User not found or inactive');
        return null; // User not found
      }
  
      const user = result.rows[0];
      console.log('Found user:', { id: user.id, email: user.email, role: user.role });
      console.log('Stored password hash:', user.password_hash);
      console.log('Provided password:', password);
      
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      console.log('Password validation result:', isPasswordValid);
  
      if (!isPasswordValid) {
        console.log('Password validation failed');
        return null; // Invalid password
      }
  
      console.log('Authentication successful');
      return {
        id: user.id,
        email: user.email,
        role: user.role
      };
    } catch (error) {
      logger.error('Error authenticating user:', error);
      throw new Error('Authentication failed');
    }
  }
  generateToken(user: any): string {
    const secretKey = process.env.JWT_SECRET || 'defaultSecret';
    
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const options: jwt.SignOptions = {
      expiresIn: '8h'
    };

    return jwt.sign(payload, secretKey, options);
  }
}

export const authService = new AuthService();