import { Router } from 'express';
import { getCloudSummaryReport } from '../controllers/reportController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();
router.get('/cloud-summary', authenticateToken, authorizeRoles(['admin', 'instructor']), getCloudSummaryReport);
export default router;