"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmailTransporter = exports.createEmailTransporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("../utils/logger"));
let transporter = null;
const createEmailTransporter = () => {
    try {
        const emailConfig = {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        };
        if (!emailConfig.host || !emailConfig.auth?.user || !emailConfig.auth?.pass) {
            logger_1.default.warn('Email not configured, email functionality disabled');
            return null;
        }
        transporter = nodemailer_1.default.createTransport(emailConfig);
        transporter.verify((error, success) => {
            if (error) {
                logger_1.default.error('Email transporter verification failed:', error);
                transporter = null;
            }
            else {
                logger_1.default.info('Email transporter ready');
            }
        });
        return transporter;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.default.warn('Failed to create email transporter:', errorMessage);
        return null;
    }
};
exports.createEmailTransporter = createEmailTransporter;
const getEmailTransporter = () => {
    if (!transporter) {
        transporter = (0, exports.createEmailTransporter)();
    }
    return transporter;
};
exports.getEmailTransporter = getEmailTransporter;
exports.default = {
    createEmailTransporter: exports.createEmailTransporter,
    getEmailTransporter: exports.getEmailTransporter,
};
//# sourceMappingURL=email.js.map