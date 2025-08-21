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
exports.getEvaluationLogs = exports.cancelEvaluation = exports.retryEvaluation = exports.startEvaluation = exports.evaluationController = exports.EvaluationController = void 0;
const swagger_1 = require("@nestjs/swagger");
const evaluationService_1 = require("../services/evaluationService");
const evaluationService = new evaluationService_1.EvaluationService();
let EvaluationController = class EvaluationController {
    async startEvaluation(req, res) {
        try {
            const { assessmentId, batchId, initiatedBy, options } = req.body;
            const result = await evaluationService.startBatchEvaluation(assessmentId, batchId, initiatedBy, options);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ success: false, message: errorMessage });
        }
    }
    async cancelEvaluation(req, res) {
        try {
            const { evaluationJobId, userId } = req.body;
            const result = await evaluationService.cancelEvaluation(evaluationJobId, userId);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ success: false, message: errorMessage });
        }
    }
    async retryEvaluation(req, res) {
        try {
            const { originalJob, userId } = req.body;
            const result = await evaluationService.retryEvaluation(originalJob, userId);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ success: false, message: errorMessage });
        }
    }
    async getEvaluationLogs(req, res) {
        try {
            res.status(200).json({ success: true, data: { logs: [] } });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ success: false, message: errorMessage });
        }
    }
};
exports.EvaluationController = EvaluationController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Start an evaluation for a specific assessment' }),
    (0, swagger_1.ApiBody)({
        description: 'Details required to start an evaluation',
        schema: {
            type: 'object',
            properties: {
                studentAssessmentId: { type: 'integer', description: 'ID of the student assessment' },
                initiatedBy: { type: 'string', description: 'User who initiated the evaluation' },
            },
            required: ['studentAssessmentId', 'initiatedBy'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Evaluation started successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Missing required fields' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Failed to start evaluation' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EvaluationController.prototype, "startEvaluation", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Cancel an ongoing evaluation' }),
    (0, swagger_1.ApiBody)({
        description: 'Details required to cancel an evaluation',
        schema: {
            type: 'object',
            properties: {
                evaluationJobId: { type: 'integer', description: 'ID of the evaluation job' },
                userId: { type: 'string', description: 'User who is cancelling the evaluation' },
            },
            required: ['evaluationJobId', 'userId'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Evaluation cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Missing required fields or failed to cancel evaluation' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Failed to cancel evaluation' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EvaluationController.prototype, "cancelEvaluation", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Retry a failed evaluation' }),
    (0, swagger_1.ApiBody)({
        description: 'Details required to retry an evaluation',
        schema: {
            type: 'object',
            properties: {
                originalJobId: { type: 'integer', description: 'ID of the original evaluation job' },
                userId: { type: 'string', description: 'User who is retrying the evaluation' },
            },
            required: ['originalJobId', 'userId'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Evaluation retry started successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Missing required fields or original job not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Failed to retry evaluation' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EvaluationController.prototype, "retryEvaluation", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve evaluation logs' }),
    (0, swagger_1.ApiParam)({ name: 'studentAssessmentId', required: true, description: 'ID of the student assessment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logs retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'studentAssessmentId is required' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Failed to retrieve logs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EvaluationController.prototype, "getEvaluationLogs", null);
exports.EvaluationController = EvaluationController = __decorate([
    (0, swagger_1.ApiTags)('Evaluation')
], EvaluationController);
exports.evaluationController = new EvaluationController();
const startEvaluation = (req, res) => exports.evaluationController.startEvaluation(req, res);
exports.startEvaluation = startEvaluation;
const retryEvaluation = (req, res) => exports.evaluationController.retryEvaluation(req, res);
exports.retryEvaluation = retryEvaluation;
const cancelEvaluation = (req, res) => exports.evaluationController.cancelEvaluation(req, res);
exports.cancelEvaluation = cancelEvaluation;
const getEvaluationLogs = (req, res) => exports.evaluationController.getEvaluationLogs(req, res);
exports.getEvaluationLogs = getEvaluationLogs;
//# sourceMappingURL=evaluationController.js.map