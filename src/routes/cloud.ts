import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  createCloudAccount,
  updateCloudAccount,
  deleteCloudAccount,
  getCloudAccounts,
  testCloudConnection,
  allocateCloudAccount,
  getCloudAllocations,
  removeCloudAllocation
} from '../controllers/cloudController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cloud
 *   description: API endpoints for cloud account operations
 */

/**
 * @swagger
 * /api/cloud/providers:
 *   get:
 *     summary: Get all cloud providers
 *     tags: [Cloud]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cloud providers
 */
router.get('/providers',
  authenticateToken
  // getCloudProviders
);

/**
 * @swagger
 * /api/cloud:
 *   post:
 *     summary: Create cloud account
 *     tags: [Cloud]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Cloud account created
 */
router.post('/',
  authenticateToken,
  authorizeRoles(['admin']),
  createCloudAccount
);

/**
 * @swagger
 * /api/cloud:
 *   get:
 *     summary: Get all cloud accounts
 *     tags: [Cloud]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cloud accounts
 */
router.get('/',
  authenticateToken,
  authorizeRoles(['admin', 'instructor']),
  getCloudAccounts
);

/**
 * @swagger
 * /api/cloud/{id}:
 *   get:
 *     summary: Get specific cloud account details
 *     tags: [Cloud]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cloud account details
 */
router.get('/:id',
  authenticateToken,
  authorizeRoles(['admin', 'instructor'])
  // getCloudAccountDetails
);

/**
 * @swagger
 * /api/cloud/{id}:
 *   put:
 *     summary: Update cloud account
 *     tags: [Cloud]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cloud account updated
 */
router.put('/:id',
  authenticateToken,
  authorizeRoles(['admin']),
  updateCloudAccount
);

/**
 * @swagger
 * /api/cloud/{id}:
 *   delete:
 *     summary: Delete cloud account
 *     tags: [Cloud]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cloud account deleted
 */
router.delete('/:id',
  authenticateToken,
  authorizeRoles(['admin']),
  deleteCloudAccount
);

/**
 * @swagger
 * /api/cloud/{id}/test:
 *   post:
 *     summary: Test cloud connection
 *     tags: [Cloud]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cloud connection tested
 */
router.post('/:id/test',
  authenticateToken,
  authorizeRoles(['admin']),
  testCloudConnection
);

/**
 * @swagger
 * /api/cloud/{id}/usage:
 *   get:
 *     summary: Get usage statistics
 *     tags: [Cloud]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usage statistics
 */
router.get('/:id/usage',
  authenticateToken,
  authorizeRoles(['admin', 'instructor'])
  // getCloudAccountUsage
);

/**
 * @swagger
 * /api/cloud/bulk-import:
 *   post:
 *     summary: Bulk import cloud accounts
 *     tags: [Cloud]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Cloud accounts imported
 */
router.post('/bulk-import',
  authenticateToken,
  authorizeRoles(['admin'])
  // bulkImportCloudAccounts
);

router.post('/allocate', allocateCloudAccount);
router.get('/allocations', getCloudAllocations);
router.delete('/allocations/:id',
  authenticateToken,
  authorizeRoles(['admin', 'instructor']),
  removeCloudAllocation
);

export default router;
