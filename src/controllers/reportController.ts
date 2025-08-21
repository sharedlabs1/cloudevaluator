import { Request, Response } from 'express';
import { reportService } from '../services/reportService';
import logger from '../utils/logger';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Reports')
export class ReportController {
  /**
   * @swagger
   * /reports/assessment/{assessmentId}:
   *   get:
   *     summary: Generate a report for a specific assessment
   *     tags: [Reports]
   *     parameters:
   *       - name: assessmentId
   *         in: path
   *         required: true
   *         description: ID of the assessment
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Assessment report generated successfully
   *       500:
   *         description: Failed to generate assessment report
   */
  async generateAssessmentReport(req: Request, res: Response): Promise<void> {
    try {
      const { assessmentId } = req.params;
      const report = await reportService.generateAssessmentReport(parseInt(assessmentId));

      res.status(200).json({
        success: true,
        data: report,
        message: 'Assessment report generated successfully',
      });
    } catch (error) {
      logger.error('Error generating assessment report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate assessment report',
      });
    }
  }

  /**
   * @swagger
   * /reports/batch/{batchId}:
   *   get:
   *     summary: Generate a report for a specific batch
   *     tags: [Reports]
   *     parameters:
   *       - name: batchId
   *         in: path
   *         required: true
   *         description: ID of the batch
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Batch report generated successfully
   *       500:
   *         description: Failed to generate batch report
   */
  async generateBatchReport(req: Request, res: Response): Promise<void> {
    try {
      const { batchId } = req.params;
      const report = await reportService.generateBatchReport(parseInt(batchId));

      res.status(200).json({
        success: true,
        data: report,
        message: 'Batch report generated successfully',
      });
    } catch (error) {
      logger.error('Error generating batch report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate batch report',
      });
    }
  }

  /**
   * @swagger
   * /reports/export:
   *   get:
   *     summary: Export a report in a specific format (e.g., PDF, CSV)
   *     tags: [Reports]
   *     parameters:
   *       - name: reportType
   *         in: query
   *         required: true
   *         description: Type of the report (assessment or batch)
   *         schema:
   *           type: string
   *       - name: format
   *         in: query
   *         required: true
   *         description: Format of the report (pdf or csv)
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Report exported successfully
   *       500:
   *         description: Failed to export report
   */
  async exportReport(req: Request, res: Response): Promise<void> {
    try {
      const { reportType, format } = req.query;
      const reportData = await reportService.exportReport(reportType as string, format as string);

      res.setHeader('Content-Disposition', `attachment; filename=report.${format}`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.send(reportData);
    } catch (error) {
      logger.error('Error exporting report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export report',
      });
    }
  }
}

export const reportController = new ReportController();

export const getCloudSummaryReport = async (req: Request, res: Response) => {
  const data = await reportService.getCloudEvaluationReport();
  res.json({ success: true, data });
};

