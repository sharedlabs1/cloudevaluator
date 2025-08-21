/**
 * @swagger
 * tags:
 *   name: Evaluation
 *   description: API endpoints for managing evaluations
 */
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { EvaluationService } from '../services/evaluationService';
import logger from '../utils/logger';

const evaluationService = new EvaluationService();

@ApiTags('Evaluation')
export class EvaluationController {
  @ApiOperation({ summary: 'Start an evaluation for a specific assessment' })
  @ApiBody({
    description: 'Details required to start an evaluation',
    schema: {
      type: 'object',
      properties: {
        studentAssessmentId: { type: 'integer', description: 'ID of the student assessment' },
        initiatedBy: { type: 'string', description: 'User who initiated the evaluation' },
      },
      required: ['studentAssessmentId', 'initiatedBy'],
    },
  })
  @ApiResponse({ status: 201, description: 'Evaluation started successfully' })
  @ApiResponse({ status: 400, description: 'Missing required fields' })
  @ApiResponse({ status: 500, description: 'Failed to start evaluation' })
  async startEvaluation(req: Request, res: Response): Promise<void> {
    try {
      const { assessmentId, batchId, initiatedBy, options } = req.body;
      const result = await evaluationService.startBatchEvaluation(assessmentId, batchId, initiatedBy, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, message: errorMessage });
    }
  }

  @ApiOperation({ summary: 'Cancel an ongoing evaluation' })
  @ApiBody({
    description: 'Details required to cancel an evaluation',
    schema: {
      type: 'object',
      properties: {
        evaluationJobId: { type: 'integer', description: 'ID of the evaluation job' },
        userId: { type: 'string', description: 'User who is cancelling the evaluation' },
      },
      required: ['evaluationJobId', 'userId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Evaluation cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Missing required fields or failed to cancel evaluation' })
  @ApiResponse({ status: 500, description: 'Failed to cancel evaluation' })
  async cancelEvaluation(req: Request, res: Response): Promise<void> {
    try {
      const { evaluationJobId, userId } = req.body;
      const result = await evaluationService.cancelEvaluation(evaluationJobId, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, message: errorMessage });
    }
  }

  @ApiOperation({ summary: 'Retry a failed evaluation' })
  @ApiBody({
    description: 'Details required to retry an evaluation',
    schema: {
      type: 'object',
      properties: {
        originalJobId: { type: 'integer', description: 'ID of the original evaluation job' },
        userId: { type: 'string', description: 'User who is retrying the evaluation' },
      },
      required: ['originalJobId', 'userId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Evaluation retry started successfully' })
  @ApiResponse({ status: 400, description: 'Missing required fields or original job not found' })
  @ApiResponse({ status: 500, description: 'Failed to retry evaluation' })
  async retryEvaluation(req: Request, res: Response): Promise<void> {
    try {
      const { originalJob, userId } = req.body;
      const result = await evaluationService.retryEvaluation(originalJob, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, message: errorMessage });
    }
  }

  @ApiOperation({ summary: 'Retrieve evaluation logs' })
  @ApiParam({ name: 'studentAssessmentId', required: true, description: 'ID of the student assessment' })
  @ApiResponse({ status: 200, description: 'Logs retrieved successfully' })
  @ApiResponse({ status: 400, description: 'studentAssessmentId is required' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve logs' })
  async getEvaluationLogs(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({ success: true, data: { logs: [] } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, message: errorMessage });
    }
  }
}

export const evaluationController = new EvaluationController();

export const startEvaluation = (req: Request, res: Response) => evaluationController.startEvaluation(req, res);
export const retryEvaluation = (req: Request, res: Response) => evaluationController.retryEvaluation(req, res);
export const cancelEvaluation = (req: Request, res: Response) => evaluationController.cancelEvaluation(req, res);
export const getEvaluationLogs = (req: Request, res: Response) => evaluationController.getEvaluationLogs(req, res);

