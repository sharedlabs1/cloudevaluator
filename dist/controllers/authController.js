"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const logger_1 = __importDefault(require("../utils/logger"));
const database_1 = require("../config/database");
class AuthController {
    async generateOTP(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({
                    success: false,
                    message: 'Email is required'
                });
                return;
            }
            const result = await authService_1.authService.generateOTP(email);
            res.status(result.success ? 200 : 400).json(result);
        }
        catch (error) {
            logger_1.default.error('Error in generateOTP:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async verifyOTP(req, res) {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                res.status(400).json({
                    success: false,
                    message: 'Email and OTP are required'
                });
                return;
            }
            const result = await authService_1.authService.verifyOTP(email, otp);
            res.status(result.success ? 200 : 400).json(result);
        }
        catch (error) {
            logger_1.default.error('Error in verifyOTP:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async createUser(req, res) {
        try {
            const result = await authService_1.authService.createUser(req.body);
            res.status(result.success ? 201 : 400).json(result);
        }
        catch (error) {
            logger_1.default.error('Error in createUser:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async getProfile(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is missing from the request'
                });
                return;
            }
            const result = await (0, database_1.query)(`
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
        }
        catch (error) {
            logger_1.default.error('Error in getProfile:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ message: 'Email and password are required' });
                return;
            }
            const user = await authService_1.authService.authenticate(email, password);
            if (!user) {
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }
            const token = authService_1.authService.generateToken(user);
            res.status(200).json({ message: 'Login successful', token });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=authController.js.map