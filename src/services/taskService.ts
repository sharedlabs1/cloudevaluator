import { query } from '../config/database';

export class TaskService {
  async addTaskToQuestion(questionId: string, data: any) {
    const taskRes = await query(
      'INSERT INTO tasks (questionId, description, marks) VALUES ($1, $2, $3) RETURNING *',
      [questionId, data.description, data.marks]
    );
    return taskRes.rows[0];
  }

  async getTasksForQuestion(questionId: string) {
    const tasksRes = await query('SELECT * FROM tasks WHERE questionId = $1', [questionId]);
    return tasksRes.rows;
  }

  async getTaskDetails(id: string) {
    const taskRes = await query('SELECT * FROM tasks WHERE id = $1', [id]);
    return taskRes.rows[0];
  }

  async updateTask(id: string, data: any) {
    await query('UPDATE tasks SET description = $1, marks = $2 WHERE id = $3', [data.description, data.marks, id]);
    return this.getTaskDetails(id);
  }

  async deleteTask(id: string) {
    await query('DELETE FROM tasks WHERE id = $1', [id]);
    return true;
  }

  async validateTask(assessmentId: string, questionId: string, taskId: string, studentId: string, submissionData: any) {
    // TODO: Implement real validation logic using the evaluationScript for the question
    // For now, return a mock result
    return { status: 'pass', message: 'Task validated successfully', details: {} };
  }
}
