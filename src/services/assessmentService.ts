import { Assessment } from '../models/Assessment';
import { Question, Task } from '../models/Question';
import { query } from '../config/database';

export class AssessmentService {
  async createAssessment(data: any) {
    // Transactional create: assessment, questions, tasks
    const client = await query('BEGIN');
    try {
      const assessmentRes = await query(
        'INSERT INTO assessments (name, description) VALUES ($1, $2) RETURNING *',
        [data.name, data.description]
      );
      const assessment = assessmentRes.rows[0];
      if (data.questions && Array.isArray(data.questions)) {
        for (const q of data.questions) {
          const questionRes = await query(
            'INSERT INTO questions (assessmentId, scenario, evaluationScript) VALUES ($1, $2, $3) RETURNING *',
            [assessment.id, q.scenario, q.evaluationScript]
          );
          const question = questionRes.rows[0];
          if (q.tasks && Array.isArray(q.tasks)) {
            for (const task of q.tasks) {
              await query(
                'INSERT INTO tasks (questionId, description, marks) VALUES ($1, $2, $3)',
                [question.id, task.description, task.marks]
              );
            }
          }
        }
      }
      await query('COMMIT');
      return this.getAssessmentDetails(String(assessment.id));
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  }

  async addQuestionToAssessment(
    assessmentId: string,
    questionId?: string,
    scenario?: string,
    evaluationScript?: string,
    tasks?: Array<{ description: string; marks: number }>
  ) {
    if (questionId) {
      // Link existing question to assessment (if using a join table)
      await query('INSERT INTO assessment_questions (assessmentId, questionId) VALUES ($1, $2)', [assessmentId, questionId]);
      return { assessmentId, questionId };
    } else if (scenario && evaluationScript && tasks) {
      // Create new question and tasks, link to assessment
      const questionRes = await query(
        'INSERT INTO questions (assessmentId, scenario, evaluationScript) VALUES ($1, $2, $3) RETURNING *',
        [assessmentId, scenario, evaluationScript]
      );
      const question = questionRes.rows[0];
      for (const task of tasks) {
        await query(
          'INSERT INTO tasks (questionId, description, marks) VALUES ($1, $2, $3)',
          [question.id, task.description, task.marks]
        );
      }
      return this.getAssessmentDetails(assessmentId);
    }
    throw new Error('Invalid payload');
  }

  async getAssessments() {
    // Return all assessments with nested questions and tasks
    const assessmentsRes = await query('SELECT * FROM assessments');
    const assessments = assessmentsRes.rows;
    for (const assessment of assessments) {
      const questionsRes = await query('SELECT * FROM questions WHERE assessmentId = $1', [assessment.id]);
      assessment.questions = questionsRes.rows;
      for (const question of assessment.questions) {
        const tasksRes = await query('SELECT * FROM tasks WHERE questionId = $1', [question.id]);
        question.tasks = tasksRes.rows;
      }
    }
    return assessments;
  }

  async getAssessmentDetails(id: string) {
    // Return assessment by id with nested questions and tasks
    const assessmentRes = await query('SELECT * FROM assessments WHERE id = $1', [id]);
    const assessment = assessmentRes.rows[0];
    if (!assessment) return null;
    const questionsRes = await query('SELECT * FROM questions WHERE assessmentId = $1', [assessment.id]);
    assessment.questions = questionsRes.rows;
    for (const question of assessment.questions) {
      const tasksRes = await query('SELECT * FROM tasks WHERE questionId = $1', [question.id]);
      question.tasks = tasksRes.rows;
    }
    return assessment;
  }

  async updateAssessment(id: string, data: any) {
    // Update assessment and nested questions/tasks as needed
    return { id, ...data };
  }
  async deleteAssessment(id: string) {
    // Delete assessment and cascade to questions/tasks
    return true;
  }
  async allocateAssessment(data: any) {
    // Implement allocation logic
    return { allocated: true };
  }
  async startAssessment(data: any) {
    // Implement start logic
    return { started: true };
  }
  async submitAssessment(data: any) {
    // Implement submit logic
    return { submitted: true };
  }
  async getAssessmentProgress(studentAssessmentId: string) {
    // Implement progress logic
    return { progress: 0 };
  }
  async getAssessmentResults(studentAssessmentId: string) {
    // Implement results logic
    return { score: 0 };
  }
}
