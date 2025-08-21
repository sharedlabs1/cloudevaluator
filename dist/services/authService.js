"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../config/database");
const emailService_1 = require("./emailService");
const logger_1 = __importDefault(require("../utils/logger"));
class AuthService {
    async generateOTP(email) {
        try {
            const userResult = await (0, database_1.query)('SELECT id FROM users WHERE email = $1 AND is_active = true', [email]);
            if (userResult.rows.length === 0) {
                return { success: false, message: 'User not found or inactive' };
            }
            const userId = userResult.rows[0].id;
            const otp = crypto_1.default.randomInt(100000, 999999).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
            await (0, database_1.query)('UPDATE otp_tokens SET is_used = true WHERE user_id = $1 AND is_used = false', [userId]);
            await (0, database_1.query)('INSERT INTO otp_tokens (user_id, otp_code, expires_at) VALUES ($1, $2, $3)', [userId, otp, expiresAt]);
            await emailService_1.emailService.sendOTP(email, otp);
            logger_1.default.info(`OTP generated for user: ${email}`);
            return { success: true, message: 'OTP sent successfully' };
        }
        catch (error) {
            logger_1.default.error('Error generating OTP:', error);
            return { success: false, message: 'Failed to generate OTP' };
        }
    }
    async verifyOTP(email, otp) {
        try {
            const result = await (0, database_1.query)(`
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
            await (0, database_1.query)('UPDATE otp_tokens SET is_used = true WHERE otp_code = $1', [otp]);
            const secretKey = process.env.JWT_SECRET || 'defaultSecret';
            const payload = {
                userId: user.id,
                email: user.email,
                role: user.role,
                username: user.username
            };
            const options = {
                expiresIn: '8h'
            };
            const token = jsonwebtoken_1.default.sign(payload, secretKey, options);
            logger_1.default.info(`User authenticated successfully: ${email}`);
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
        }
        catch (error) {
            logger_1.default.error('Error verifying OTP:', error);
            return { success: false, message: 'Authentication failed' };
        }
    }
    async createUser(userData) {
        try {
            const { email, username, password = '', role, first_name, last_name } = userData;
            const roleValue = role || 'STUDENT';
            const validRoles = ['STUDENT', 'ADMIN', 'INSTRUCTOR'];
            if (!validRoles.includes(roleValue)) {
                return { success: false, message: `Invalid role. Valid roles are: ${validRoles.join(', ')}` };
            }
            const normalizedRole = roleValue.toUpperCase();
            const existingUser = await (0, database_1.query)('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
            if (existingUser.rows.length > 0) {
                return { success: false, message: 'User already exists with this email or username' };
            }
            let passwordHash = null;
            if (password) {
                passwordHash = await bcryptjs_1.default.hash(password, 12);
            }
            const result = await (0, database_1.query)(`
        INSERT INTO users (email, username, password_hash, role, first_name, last_name)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, username, role, first_name, last_name, created_at
      `, [email, username, passwordHash, normalizedRole, first_name, last_name]);
            const newUser = result.rows[0];
            logger_1.default.info(`User created successfully: ${email}`);
            return {
                success: true,
                user: newUser,
                message: 'User created successfully'
            };
        }
        catch (error) {
            logger_1.default.error('Error creating user:', error);
            return { success: false, message: 'Failed to create user' };
        }
    }
    async authenticate(email, password) {
        try {
            console.log('Authenticating user:', email);
            const result = await (0, database_1.query)('SELECT id, email, password_hash, role FROM users WHERE email = $1 AND is_active = true', [email]);
            console.log('Database query result:', result.rows.length, 'users found');
            if (result.rows.length === 0) {
                console.log('User not found or inactive');
                return null;
            }
            const user = result.rows[0];
            console.log('Found user:', { id: user.id, email: user.email, role: user.role });
            console.log('Stored password hash:', user.password_hash);
            console.log('Provided password:', password);
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password_hash);
            console.log('Password validation result:', isPasswordValid);
            if (!isPasswordValid) {
                console.log('Password validation failed');
                return null;
            }
            console.log('Authentication successful');
            return {
                id: user.id,
                email: user.email,
                role: user.role
            };
        }
        catch (error) {
            logger_1.default.error('Error authenticating user:', error);
            throw new Error('Authentication failed');
        }
    }
    generateToken(user) {
        const secretKey = process.env.JWT_SECRET || 'defaultSecret';
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };
        const options = {
            expiresIn: '8h'
        };
        return jsonwebtoken_1.default.sign(payload, secretKey, options);
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=authService.js.map