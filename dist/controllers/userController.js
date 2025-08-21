"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const database_1 = require("../config/database");
const authService_1 = require("../services/authService");
const logger_1 = __importDefault(require("../utils/logger"));
class UserController {
    async getUsers(req, res) {
        try {
            const { page = 1, limit = 10, role, search } = req.query;
            const offset = (Number(page) - 1) * Number(limit);
            let queryText = `
        SELECT id, email, username, role, first_name, last_name, is_active, created_at
        FROM users
        WHERE 1=1
      `;
            const queryParams = [];
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
            const result = await (0, database_1.query)(queryText, queryParams);
            let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
            const countParams = [];
            if (role) {
                countQuery += ` AND role = ${countParams.length + 1}`;
                countParams.push(role);
            }
            if (search) {
                countQuery += ` AND (first_name ILIKE ${countParams.length + 1} OR last_name ILIKE ${countParams.length + 1} OR email ILIKE ${countParams.length + 1})`;
                countParams.push(`%${search}%`);
            }
            const countResult = await (0, database_1.query)(countQuery, countParams);
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
        }
        catch (error) {
            logger_1.default.error('Error fetching users:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch users'
            });
        }
    }
    async createUser(req, res) {
        try {
            const result = await authService_1.authService.createUser(req.body);
            res.status(result.success ? 201 : 400).json(result);
        }
        catch (error) {
            logger_1.default.error('Error creating user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create user'
            });
        }
    }
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { email, username, role, first_name, last_name, is_active } = req.body;
            const result = await (0, database_1.query)(`
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
            logger_1.default.info(`User updated: ${id}`);
        }
        catch (error) {
            logger_1.default.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user'
            });
        }
    }
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const result = await (0, database_1.query)(`
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
            logger_1.default.info(`User deleted: ${id}`);
        }
        catch (error) {
            logger_1.default.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete user'
            });
        }
    }
    async getUsersByRole(req, res) {
        try {
            const { role } = req.params;
            const result = await (0, database_1.query)(`
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
        }
        catch (error) {
            logger_1.default.error('Error fetching users by role:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch users'
            });
        }
    }
    async getUserAssessments(req, res) {
        try {
            const userId = req.params.id;
            const assessments = await (0, database_1.query)(`SELECT * FROM assessments WHERE user_id = $1`, [userId]);
            res.status(200).json({ success: true, data: assessments.rows });
        }
        catch (error) {
            logger_1.default.error('Error fetching user assessments:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch user assessments' });
        }
    }
    async addUserAssessment(req, res) {
        try {
            const userId = req.params.id;
            const { title, description, dueDate } = req.body;
            const result = await (0, database_1.query)(`INSERT INTO assessments (user_id, title, description, due_date) VALUES ($1, $2, $3, $4) RETURNING *`, [userId, title, description, dueDate]);
            res.status(201).json({ success: true, data: result.rows[0] });
        }
        catch (error) {
            logger_1.default.error('Error adding user assessment:', error);
            res.status(500).json({ success: false, message: 'Failed to add user assessment' });
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
//# sourceMappingURL=userController.js.map