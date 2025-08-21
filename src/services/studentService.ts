import { Assessment } from '../models/Assessment';
import { AssessmentService } from './assessmentService';

export class StudentService {
  async getStudentDashboard(studentId: string) {
    // Use AssessmentService to fetch assessments with questions and tasks
    const assessmentService = new AssessmentService();
    const assessments: any[] = await assessmentService.getAssessments();
    // Filter or map as needed for the student
    // This is a placeholder; you may want to filter by studentId if your schema supports it
    for (const assessment of assessments) {
      if (assessment.questions) {
        for (const question of assessment.questions) {
          if (question.tasks) {
            for (const task of question.tasks) {
              // Generate or fetch the cloud link for this student, assessment, question, or task
              task.cloudLink = await this.getCloudConsoleUrl(studentId, String(assessment.id));
            }
          }
        }
      }
    }
    return { assessments };
  }

  async getCloudConsoleUrl(studentId: string, assessmentId: string) {
    // TODO: Generate or fetch the cloud console URL for the student and assessment
    return `https://console.cloudprovider.com/session/${studentId}-${assessmentId}`;
  }
}
