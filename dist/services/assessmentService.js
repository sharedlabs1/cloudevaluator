"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentService = void 0;
const database_1 = require("../config/database");
class AssessmentService {
    async createAssessment(data) {
        const client = await (0, database_1.query)('BEGIN');
        try {
            const assessmentRes = await (0, database_1.query)('INSERT INTO assessments (name, description) VALUES ($1, $2) RETURNING *', [data.name, data.description]);
            const assessment = assessmentRes.rows[0];
            if (data.questions && Array.isArray(data.questions)) {
                for (const q of data.questions) {
                    const questionRes = await (0, database_1.query)('INSERT INTO questions (assessmentId, scenario, evaluationScript) VALUES ($1, $2, $3) RETURNING *', [assessment.id, q.scenario, q.evaluationScript]);
                    const question = questionRes.rows[0];
                    if (q.tasks && Array.isArray(q.tasks)) {
                        for (const task of q.tasks) {
                            await (0, database_1.query)('INSERT INTO tasks (questionId, description, marks) VALUES ($1, $2, $3)', [question.id, task.description, task.marks]);
                        }
                    }
                }
            }
            await (0, database_1.query)('COMMIT');
            return this.getAssessmentDetails(String(assessment.id));
        }
        catch (err) {
            await (0, database_1.query)('ROLLBACK');
            throw err;
        }
    }
    async addQuestionToAssessment(assessmentId, questionId, scenario, evaluationScript, tasks) {
        if (questionId) {
            await (0, database_1.query)('INSERT INTO assessment_questions (assessmentId, questionId) VALUES ($1, $2)', [assessmentId, questionId]);
            return { assessmentId, questionId };
        }
        else if (scenario && evaluationScript && tasks) {
            const questionRes = await (0, database_1.query)('INSERT INTO questions (assessmentId, scenario, evaluationScript) VALUES ($1, $2, $3) RETURNING *', [assessmentId, scenario, evaluationScript]);
            const question = questionRes.rows[0];
            for (const task of tasks) {
                await (0, database_1.query)('INSERT INTO tasks (questionId, description, marks) VALUES ($1, $2, $3)', [question.id, task.description, task.marks]);
            }
            return this.getAssessmentDetails(assessmentId);
        }
        throw new Error('Invalid payload');
    }
    async getAssessments() {
        const assessmentsRes = await (0, database_1.query)('SELECT * FROM assessments');
        const assessments = assessmentsRes.rows;
        for (const assessment of assessments) {
            const questionsRes = await (0, database_1.query)('SELECT * FROM questions WHERE assessmentId = $1', [assessment.id]);
            assessment.questions = questionsRes.rows;
            for (const question of assessment.questions) {
                const tasksRes = await (0, database_1.query)('SELECT * FROM tasks WHERE questionId = $1', [question.id]);
                question.tasks = tasksRes.rows;
            }
        }
        return assessments;
    }
    async getAssessmentDetails(id) {
        const assessmentRes = await (0, database_1.query)('SELECT * FROM assessments WHERE id = $1', [id]);
        const assessment = assessmentRes.rows[0];
        if (!assessment)
            return null;
        const questionsRes = await (0, database_1.query)('SELECT * FROM questions WHERE assessmentId = $1', [assessment.id]);
        assessment.questions = questionsRes.rows;
        for (const question of assessment.questions) {
            const tasksRes = await (0, database_1.query)('SELECT * FROM tasks WHERE questionId = $1', [question.id]);
            question.tasks = tasksRes.rows;
        }
        return assessment;
    }
    async updateAssessment(id, data) {
        return { id, ...data };
    }
    async deleteAssessment(id) {
        return true;
    }
    async allocateAssessment(data) {
        return { allocated: true };
    }
    async startAssessment(data) {
        return { started: true };
    }
    async submitAssessment(data) {
        return { submitted: true };
    }
    async getAssessmentProgress(studentAssessmentId) {
        return { progress: 0 };
    }
    async getAssessmentResults(studentAssessmentId) {
        return { score: 0 };
    }
}
exports.AssessmentService = AssessmentService;
//# sourceMappingURL=assessmentService.js.map