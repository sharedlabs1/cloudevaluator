import { getEmailTransporter } from '../config/email';
import logger from '../utils/logger';

export class EmailService {
  async sendOTP(email: string, otp: string): Promise<boolean> {
    try {
      const transporter = getEmailTransporter();
      
      if (!transporter) {
        logger.warn('Email transporter not available, skipping OTP email');
        return false;
      }

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@cloudassessment.com',
        to: email,
        subject: 'Your OTP Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Your OTP Code</h2>
            <p>Your one-time password (OTP) for Cloud Assessment Platform is:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #333; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p>This code will expire in 5 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      logger.info(`OTP email sent successfully to ${email}`);
      return true;
    } catch (error) {
      logger.error('Failed to send OTP email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
    try {
      const transporter = getEmailTransporter();
      
      if (!transporter) {
        logger.warn('Email transporter not available, skipping password reset email');
        return false;
      }

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@cloudassessment.com',
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password for Cloud Assessment Platform.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetLink}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent successfully to ${email}`);
      return true;
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    try {
      const transporter = getEmailTransporter();
      
      if (!transporter) {
        logger.warn('Email transporter not available, skipping welcome email');
        return false;
      }

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@cloudassessment.com',
        to: email,
        subject: 'Welcome to Cloud Assessment Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Cloud Assessment Platform, ${firstName}!</h2>
            <p>Your account has been successfully created.</p>
            <p>You can now access the platform and start using our cloud assessment tools.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}" 
                 style="background-color: #28a745; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Access Platform
              </a>
            </div>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <p>Thank you for choosing Cloud Assessment Platform!</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent successfully to ${email}`);
      return true;
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();