import { query } from '../config/database';
import { QueryResult } from 'pg';
import { Question, Task } from '../models/Question';

export class QuestionService {
  async createQuestion(scenario: string, evaluationScript: string, tasks: any[]) {
    const questionRes = await query(
      'INSERT INTO questions (scenario, evaluationScript) VALUES ($1, $2) RETURNING *',
      [scenario, evaluationScript]
    );
    const question = questionRes.rows[0];
    for (const task of tasks) {
      await query(
        'INSERT INTO tasks (questionId, description, marks) VALUES ($1, $2, $3)',
        [question.id, task.description, task.marks]
      );
    }
    return question;
  }

  async validateTask(id: number, taskIndex: number): Promise<{ question: any; task: any }> {
    const questionResult = await query('SELECT * FROM questions WHERE id = $1', [id]);
    if (questionResult.rowCount === 0) {
      throw new Error('Question not found');
    }

    const question = questionResult.rows[0];

    const tasksResult = await query('SELECT * FROM question_tasks WHERE question_id = $1', [id]);
    if (!tasksResult.rows[taskIndex]) {
      throw new Error('Invalid task index');
    }

    return { question, task: tasksResult.rows[taskIndex] };
  }

  async submitAssessment(id: number): Promise<number> {
    const assessmentResult = await query('SELECT * FROM assessments WHERE id = $1', [id]);
    if (assessmentResult.rowCount === 0) {
      throw new Error('Assessment not found');
    }

    const questionsResult = await query('SELECT * FROM questions WHERE id IN (SELECT question_id FROM question_tasks WHERE question_id = $1)', [id]);
    const questions = questionsResult.rows;

    let score = 0;

    for (const question of questions) {
      const tasksResult = await query('SELECT * FROM question_tasks WHERE question_id = $1', [question.id]);
      score += tasksResult.rowCount || 0; // Ensure rowCount is not null
    }

    await query('UPDATE assessments SET total_marks = $1 WHERE id = $2', [score, id]);

    return score;
  }

  async addQuestionToAssessment(assessmentId: string, data: any) {
    const questionRes = await query(
      'INSERT INTO questions (assessmentId, scenario, evaluationScript) VALUES ($1, $2, $3) RETURNING *',
      [assessmentId, data.scenario, data.evaluationScript]
    );
    const question = questionRes.rows[0];
    if (data.tasks && Array.isArray(data.tasks)) {
      for (const task of data.tasks) {
        await query(
          'INSERT INTO tasks (questionId, description, marks) VALUES ($1, $2, $3)',
          [question.id, task.description, task.marks]
        );
      }
    }
    return this.getQuestionDetails(String(question.id));
  }

  async getQuestionsForAssessment(assessmentId: string) {
    const questionsRes = await query('SELECT * FROM questions WHERE assessmentId = $1', [assessmentId]);
    const questions = questionsRes.rows;
    for (const question of questions) {
      const tasksRes = await query('SELECT * FROM tasks WHERE questionId = $1', [question.id]);
      question.tasks = tasksRes.rows;
    }
    return questions;
  }

  async getQuestionDetails(id: string) {
    const questionRes = await query('SELECT * FROM questions WHERE id = $1', [id]);
    const question = questionRes.rows[0];
    if (!question) return null;
    const tasksRes = await query('SELECT * FROM tasks WHERE questionId = $1', [question.id]);
    question.tasks = tasksRes.rows;
    return question;
  }

  async updateQuestion(id: string, data: any) {
    await query('UPDATE questions SET scenario = $1, evaluationScript = $2 WHERE id = $3', [data.scenario, data.evaluationScript, id]);
    // Optionally update tasks here as well
    return this.getQuestionDetails(id);
  }

  async updateEvaluationScript(id: string, evaluationScript: string) {
    await query('UPDATE questions SET evaluationScript = $1 WHERE id = $2', [evaluationScript, id]);
    return this.getQuestionDetails(id);
  }

  async deleteQuestion(id: string) {
    await query('DELETE FROM tasks WHERE questionId = $1', [id]);
    await query('DELETE FROM questions WHERE id = $1', [id]);
    return true;
  }
}

export const questionService = new QuestionService();