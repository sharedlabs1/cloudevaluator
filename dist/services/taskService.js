"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const database_1 = require("../config/database");
class TaskService {
    async addTaskToQuestion(questionId, data) {
        const taskRes = await (0, database_1.query)('INSERT INTO tasks (questionId, description, marks) VALUES ($1, $2, $3) RETURNING *', [questionId, data.description, data.marks]);
        return taskRes.rows[0];
    }
    async getTasksForQuestion(questionId) {
        const tasksRes = await (0, database_1.query)('SELECT * FROM tasks WHERE questionId = $1', [questionId]);
        return tasksRes.rows;
    }
    async getTaskDetails(id) {
        const taskRes = await (0, database_1.query)('SELECT * FROM tasks WHERE id = $1', [id]);
        return taskRes.rows[0];
    }
    async updateTask(id, data) {
        await (0, database_1.query)('UPDATE tasks SET description = $1, marks = $2 WHERE id = $3', [data.description, data.marks, id]);
        return this.getTaskDetails(id);
    }
    async deleteTask(id) {
        await (0, database_1.query)('DELETE FROM tasks WHERE id = $1', [id]);
        return true;
    }
    async validateTask(assessmentId, questionId, taskId, studentId, submissionData) {
        return { status: 'pass', message: 'Task validated successfully', details: {} };
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=taskService.js.map