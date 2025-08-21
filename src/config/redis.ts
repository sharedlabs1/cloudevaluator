import { createClient } from 'redis';
import logger from '../utils/logger';

let redisClient: any = null;

export const connectRedis = async (): Promise<void> => {
  try {
    if (!process.env.REDIS_URL && process.env.NODE_ENV === 'development') {
      logger.info('Redis not configured for development, skipping...');
      return;
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = createClient({
      url: redisUrl
    });

    redisClient.on('error', (err: Error) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Connected to Redis');
    });

    await redisClient.connect();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn('Redis not available, running without cache:', errorMessage);
  }
};

export const getRedisClient = () => {
  return redisClient;
};

export { redisClient };