"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuestion = exports.updateQuestion = exports.getQuestionDetails = exports.getQuestionsForAssessment = exports.addQuestionToAssessment = exports.questionController = exports.QuestionController = exports.updateEvaluationScript = exports.createQuestion = void 0;
const child_process_1 = require("child_process");
const questionService_1 = require("../services/questionService");
const taskService_1 = require("../services/taskService");
const swagger_1 = require("@nestjs/swagger");
const questionService = new questionService_1.QuestionService();
const createQuestion = async (req, res) => {
    try {
        const { scenario, evaluationScript, tasks } = req.body;
        const question = await questionService.createQuestion(scenario, evaluationScript, tasks);
        res.status(201).json({ success: true, data: question });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.createQuestion = createQuestion;
const updateEvaluationScript = async (req, res) => {
    try {
        const { evaluationScript } = req.body;
        const question = await questionService.updateEvaluationScript(req.params.id, evaluationScript);
        res.status(200).json({ success: true, data: question });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.updateEvaluationScript = updateEvaluationScript;
let QuestionController = class QuestionController {
    constructor() {
        this.questionService = new questionService_1.QuestionService();
        this.taskService = new taskService_1.TaskService();
    }
    async createQuestion(req, res) {
        try {
            const { scenario, tasks, evaluationScript } = req.body;
            if (!scenario || !tasks || !evaluationScript) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const questionResult = await this.questionService.createQuestion(scenario, tasks, evaluationScript);
            return res.status(201).json({ message: 'Question created successfully', question: questionResult.rows[0] });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to create question' });
        }
    }
    async validateTask(req, res) {
        try {
            const { id } = req.params;
            const { taskIndex } = req.body;
            const { question, task } = await this.questionService.validateTask(Number(id), taskIndex);
            const pythonProcess = (0, child_process_1.spawn)('python', ['-c', question.evaluation_script]);
            let responseSent = false;
            pythonProcess.stdout.on('data', (data) => {
                if (!responseSent) {
                    responseSent = true;
                    res.status(200).json({ message: 'Task validated successfully', result: data.toString() });
                }
            });
            pythonProcess.stderr.on('data', (data) => {
                if (!responseSent) {
                    responseSent = true;
                    res.status(400).json({ message: 'Validation failed', error: data.toString() });
                }
            });
            pythonProcess.on('close', (code) => {
                if (!responseSent) {
                    responseSent = true;
                    res.status(500).json({ message: 'Validation process exited unexpectedly', code });
                }
            });
            pythonProcess.on('error', (error) => {
                if (!responseSent) {
                    responseSent = true;
                    res.status(500).json({ message: 'Error during validation process', error: error.message });
                }
            });
            setTimeout(() => {
                if (!responseSent) {
                    responseSent = true;
                    res.status(500).json({ message: 'Validation process timed out' });
                }
            }, 10000);
            return;
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
        }
    }
    async submitAssessment(req, res) {
        try {
            const { id } = req.params;
            const score = await this.questionService.submitAssessment(Number(id));
            return res.status(200).json({ message: 'Assessment submitted successfully', score });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
        }
    }
    async addQuestionToAssessment(req, res) {
        try {
            const question = await this.questionService.addQuestionToAssessment(req.params.assessmentId, req.body);
            res.status(201).json({ success: true, data: question });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async getQuestionsForAssessment(req, res) {
        try {
            const questions = await this.questionService.getQuestionsForAssessment(req.params.assessmentId);
            res.status(200).json({ success: true, data: questions });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async getQuestionDetails(req, res) {
        try {
            const question = await this.questionService.getQuestionDetails(req.params.id);
            res.status(200).json({ success: true, data: question });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async updateQuestion(req, res) {
        try {
            const question = await this.questionService.updateQuestion(req.params.id, req.body);
            res.status(200).json({ success: true, data: question });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async deleteQuestion(req, res) {
        try {
            await this.questionService.deleteQuestion(req.params.id);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
};
exports.QuestionController = QuestionController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create a new question' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Question created successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Missing required fields.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Failed to create question.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], QuestionController.prototype, "createQuestion", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Validate a task' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Task validated successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation failed or invalid task index.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question not found.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error during validation.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], QuestionController.prototype, "validateTask", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Submit an assessment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Assessment submitted successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Assessment not found.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error during submission.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], QuestionController.prototype, "submitAssessment", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Add a question to an assessment' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Question added to assessment successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Failed to add question to assessment.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], QuestionController.prototype, "addQuestionToAssessment", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get questions for an assessment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Questions retrieved successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Failed to retrieve questions.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], QuestionController.prototype, "getQuestionsForAssessment", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get details of a question' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Question details retrieved successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Failed to retrieve question details.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], QuestionController.prototype, "getQuestionDetails", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update a question' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Question updated successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Failed to update question.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], QuestionController.prototype, "updateQuestion", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete a question' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Question deleted successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Failed to delete question.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], QuestionController.prototype, "deleteQuestion", null);
exports.QuestionController = QuestionController = __decorate([
    (0, swagger_1.ApiTags)('Questions'),
    __metadata("design:paramtypes", [])
], QuestionController);
exports.questionController = new QuestionController();
const addQuestionToAssessment = (req, res) => exports.questionController.addQuestionToAssessment(req, res);
exports.addQuestionToAssessment = addQuestionToAssessment;
const getQuestionsForAssessment = (req, res) => exports.questionController.getQuestionsForAssessment(req, res);
exports.getQuestionsForAssessment = getQuestionsForAssessment;
const getQuestionDetails = (req, res) => exports.questionController.getQuestionDetails(req, res);
exports.getQuestionDetails = getQuestionDetails;
const updateQuestion = (req, res) => exports.questionController.updateQuestion(req, res);
exports.updateQuestion = updateQuestion;
const deleteQuestion = (req, res) => exports.questionController.deleteQuestion(req, res);
exports.deleteQuestion = deleteQuestion;
//# sourceMappingURL=questionController.js.map