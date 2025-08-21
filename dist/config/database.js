"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = exports.query = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = new pg_1.Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'assessment_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'X9085565r@',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
const query = async (text, params = []) => {
    try {
        return await pool.query(text, params);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Database query error:', error.message);
            throw error;
        }
        console.error('Unknown error occurred during database query');
        throw new Error('Unknown error occurred');
    }
};
exports.query = query;
const getClient = () => pool.connect();
exports.getClient = getClient;
exports.default = pool;
//# sourceMappingURL=database.js.map