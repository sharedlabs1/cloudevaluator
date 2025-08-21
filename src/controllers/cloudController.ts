// src/controllers/cloudController.ts
import { Request, Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { CloudService } from '../services/cloudService';
import { encrypt, decrypt } from '../utils/encryption';
import logger from '../utils/logger';
import Joi from 'joi';

const cloudService = new CloudService();

// Validation schemas
const createCloudAccountSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  provider: Joi.string().valid('aws', 'azure', 'gcp').required(),
  credentials: Joi.object().required(),
  description: Joi.string().max(1000).optional()
});

const updateCloudAccountSchema = Joi.object({
  name: Joi.string().min(3).max(255).optional(),
  credentials: Joi.object().optional(),
  description: Joi.string().max(1000).optional(),
  is_active: Joi.boolean().optional()
});

export const createCloudAccount = async (req: Request, res: Response) => {
  try {
    const cloudAccount = await cloudService.createCloudAccount(req.body);
    res.status(201).json({ success: true, data: cloudAccount });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const updateCloudAccount = async (req: Request, res: Response) => {
  try {
    const updatedAccount = await cloudService.updateCloudAccount(req.params.id, req.body);
    res.status(200).json({ success: true, data: updatedAccount });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const deleteCloudAccount = async (req: Request, res: Response) => {
  try {
    await cloudService.deleteCloudAccount(req.params.id);
    res.status(200).json({ success: true, message: 'Cloud account deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const getCloudAccounts = async (_req: Request, res: Response) => {
  try {
    const cloudAccounts = await cloudService.getCloudAccounts();
    res.status(200).json({ success: true, data: cloudAccounts });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const testCloudConnection = async (req: Request, res: Response) => {
  try {
    const { provider, credentials } = req.body;
    const result = await cloudService.testCloudConnection(provider, credentials);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const allocateCloudAccount = async (req: Request, res: Response) => {
  const { cloudAccountId, assessmentId, batchId } = req.body;
  if (!cloudAccountId || (!assessmentId && !batchId)) {
    return res.status(400).json({ success: false, message: 'cloudAccountId and assessmentId or batchId required' });
  }
  try {
    await cloudService.allocateCloudAccount(cloudAccountId, assessmentId, batchId);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getCloudAllocations = async (req: Request, res: Response) => {
  try {
    const allocations = await cloudService.getCloudAllocations();
    res.json({ success: true, data: allocations });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const removeCloudAllocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await cloudService.removeCloudAllocation(id);
    res.status(200).json({ success: true, message: 'Cloud allocation removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};
