import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'assessment_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'X9085565r@',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const query = async (text: string, params: any[] = []): Promise<QueryResult<any>> => {
  try {
    return await pool.query(text, params);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Database query error:', error.message);
      throw error;
    }
    console.error('Unknown error occurred during database query');
    throw new Error('Unknown error occurred');
  }
};

export const getClient = () => pool.connect();

export default pool;