// src/controllers/batchController.ts
import { Request, Response } from 'express';
import { BatchService } from '../services/batchService';
import logger from '../utils/logger';

const batchService = new BatchService();

export const createBatch = async (req: Request, res: Response) => {
  try {
    const batch = await batchService.createBatch(req.body);
    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error creating batch:', errorMessage);
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const addStudentsToBatch = async (req: Request, res: Response) => {
  try {
    const result = await batchService.addStudentsToBatch(req.params.id, req.body.studentIds);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error adding students to batch:', errorMessage);
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const removeStudentFromBatch = async (req: Request, res: Response) => {
  try {
    const result = await batchService.removeStudentFromBatch(req.params.id, req.params.student_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error removing student from batch:', errorMessage);
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const getBatchDetails = async (req: Request, res: Response) => {
  try {
    const batch = await batchService.getBatchDetails(req.params.id);
    res.status(200).json({ success: true, data: batch });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error fetching batch details:', errorMessage);
    res.status(500).json({ success: false, message: errorMessage });
  }
};