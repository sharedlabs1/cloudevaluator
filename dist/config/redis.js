"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = exports.getRedisClient = exports.connectRedis = void 0;
const redis_1 = require("redis");
const logger_1 = __importDefault(require("../utils/logger"));
let redisClient = null;
exports.redisClient = redisClient;
const connectRedis = async () => {
    try {
        if (!process.env.REDIS_URL && process.env.NODE_ENV === 'development') {
            logger_1.default.info('Redis not configured for development, skipping...');
            return;
        }
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        exports.redisClient = redisClient = (0, redis_1.createClient)({
            url: redisUrl
        });
        redisClient.on('error', (err) => {
            logger_1.default.error('Redis Client Error:', err);
        });
        redisClient.on('connect', () => {
            logger_1.default.info('Connected to Redis');
        });
        await redisClient.connect();
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.default.warn('Redis not available, running without cache:', errorMessage);
    }
};
exports.connectRedis = connectRedis;
const getRedisClient = () => {
    return redisClient;
};
exports.getRedisClient = getRedisClient;
//# sourceMappingURL=redis.js.map