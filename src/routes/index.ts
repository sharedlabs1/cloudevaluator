// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth';
import assessmentRoutes from './assessments';
import batchRoutes from './batches';
import userRoutes from './users';
import cloudRoutes from './cloud';
import evaluationRoutes from './evaluation';
import reportRoutes from './report';

const router = Router();

router.use('/auth', authRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/batches', batchRoutes);
router.use('/users', userRoutes);
router.use('/cloud-accounts', cloudRoutes);
router.use('/evaluation', evaluationRoutes);
router.use('/api/reports', reportRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;