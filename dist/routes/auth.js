"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const rateLimit_1 = require("../middleware/rateLimit");
const joi_1 = __importDefault(require("joi"));
const validators_1 = require("../utils/validators");
const router = (0, express_1.Router)();
console.log('Auth routes file loaded successfully');
const otpGenerationSchema = joi_1.default.object({
    email: joi_1.default.string().email().required()
});
const otpVerificationSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    otp: joi_1.default.string().length(6).required()
});
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required()
});
router.post('/generate-otp', rateLimit_1.authLimiter, (0, validation_1.validateRequest)(otpGenerationSchema), async (req, res) => {
    try {
        await authController_1.authController.generateOTP(req, res);
    }
    catch (error) {
        console.error('Generate OTP error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
router.post('/verify-otp', rateLimit_1.authLimiter, (0, validation_1.validateRequest)(otpVerificationSchema), async (req, res) => {
    try {
        await authController_1.authController.verifyOTP(req, res);
    }
    catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
router.post('/login', rateLimit_1.authLimiter, (0, validation_1.validateRequest)(loginSchema), async (req, res) => {
    console.log('Login route hit');
    try {
        await authController_1.authController.login(req, res);
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
router.post('/login-test', (req, res) => {
    console.log('Login test route hit');
    res.json({ success: true, message: 'Login test route working' });
});
router.post('/create-user', auth_1.authenticateToken, (0, validation_1.validateRequest)(validators_1.createUserSchema), async (req, res) => {
    try {
        await authController_1.authController.createUser(req, res);
    }
    catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
router.get('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        await authController_1.authController.getProfile(req, res);
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map