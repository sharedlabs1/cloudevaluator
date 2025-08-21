import nodemailer from 'nodemailer';
import logger from '../utils/logger';

export interface EmailConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user?: string;
    pass?: string;
  };
}

let transporter: nodemailer.Transporter | null = null;

export const createEmailTransporter = (): nodemailer.Transporter | null => {
  try {
    const emailConfig: EmailConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    // Check if email is configured
    if (!emailConfig.host || !emailConfig.auth?.user || !emailConfig.auth?.pass) {
      logger.warn('Email not configured, email functionality disabled');
      return null;
    }

    transporter = nodemailer.createTransport(emailConfig);

    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        logger.error('Email transporter verification failed:', error);
        transporter = null;
      } else {
        logger.info('Email transporter ready');
      }
    });

    return transporter;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn('Failed to create email transporter:', errorMessage);
    return null;
  }
};

export const getEmailTransporter = (): nodemailer.Transporter | null => {
  if (!transporter) {
    transporter = createEmailTransporter();
  }
  return transporter;
};

export default {
  createEmailTransporter,
  getEmailTransporter,
};