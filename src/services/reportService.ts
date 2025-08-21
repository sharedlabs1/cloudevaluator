import { query } from '../config/database';
import { generatePDF, generateCSV } from '../utils/reportUtils';

export class ReportService {
  /**
   * Generate a report for a specific assessment
   */
  async generateAssessmentReport(assessmentId: number): Promise<any> {
    const result = await query(`
      SELECT sa.id as student_assessment_id, sa.total_score, sa.percentage, sa.grade,
             u.first_name, u.last_name, u.email
      FROM student_assessments sa
      JOIN users u ON sa.student_id = u.id
      WHERE sa.allocation_id IN (
        SELECT id FROM assessment_allocations WHERE assessment_id = $1
      )
    `, [assessmentId]);

    return result.rows;
  }

  /**
   * Generate a report for a specific batch
   */
  async generateBatchReport(batchId: number): Promise<any> {
    const result = await query(`
      SELECT u.id as student_id, u.first_name, u.last_name, u.email,
             COUNT(sa.id) as total_assessments,
             COUNT(CASE WHEN sa.status = 'completed' THEN 1 END) as completed_assessments,
             AVG(sa.percentage) as average_score
      FROM batch_students bs
      JOIN users u ON bs.student_id = u.id
      LEFT JOIN student_assessments sa ON u.id = sa.student_id
      WHERE bs.batch_id = $1
      GROUP BY u.id
    `, [batchId]);

    return result.rows;
  }

  /**
   * Export a report in a specific format
   */
  async exportReport(reportType: string, format: string): Promise<Buffer> {
    let data;

    if (reportType === 'assessment') {
      data = await this.generateAssessmentReport(parseInt(reportType));
    } else if (reportType === 'batch') {
      data = await this.generateBatchReport(parseInt(reportType));
    } else {
      throw new Error('Invalid report type');
    }

    if (format === 'pdf') {
      return generatePDF(data);
    } else if (format === 'csv') {
      return generateCSV(data);
    } else {
      throw new Error('Unsupported format');
    }
  }

  /**
   * Generate a comprehensive report for assessment performance
   */
  async generateComprehensiveAssessmentReport(): Promise<any> {
    const result = await query(`
      SELECT 
        a.id as assessment_id,
        a.title,
        COUNT(sa.id) as total_students,
        AVG(sa.percentage) as average_score,
        COUNT(CASE WHEN sa.status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN sa.status = 'in_progress' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN sa.status = 'pending' THEN 1 END) as pending_count
      FROM assessments a
      LEFT JOIN assessment_allocations aa ON a.id = aa.assessment_id
      LEFT JOIN student_assessments sa ON aa.id = sa.allocation_id
      GROUP BY a.id
    `);

    return result.rows;
  }

  /**
   * Generate cloud user statistics
   */
  async generateCloudUserStatistics(): Promise<any> {
    const result = await query(`
      SELECT 
        ca.provider,
        COUNT(DISTINCT sa.student_id) as unique_users,
        COUNT(sa.id) as total_assessments,
        AVG(sa.percentage) as average_score
      FROM cloud_accounts ca
      LEFT JOIN batches b ON ca.id = b.cloud_account_id
      LEFT JOIN assessment_allocations aa ON b.id = aa.batch_id
      LEFT JOIN student_assessments sa ON aa.id = sa.allocation_id
      GROUP BY ca.provider
    `);

    return result.rows;
  }

  /**
   * Get cloud evaluation report
   */
  async getCloudEvaluationReport() {
    // Query DB for all evaluations, group by cloud provider, status, etc.
    // Return stats like pass rate per cloud, average score, attempts
    // Example return:
    return [
      { provider: 'aws', passRate: 85, avgScore: 78, attempts: 120 },
      { provider: 'azure', passRate: 80, avgScore: 75, attempts: 100 },
      { provider: 'gcp', passRate: 90, avgScore: 82, attempts: 110 }
    ];
  }
}

export const reportService = new ReportService();

