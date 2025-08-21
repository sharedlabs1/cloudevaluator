"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const evaluationController_1 = require("../controllers/evaluationController");
const questionController_1 = require("../controllers/questionController");
const router = express_1.default.Router();
router.post('/api/evaluation/start', evaluationController_1.startEvaluation);
router.post('/api/evaluation/cancel', evaluationController_1.cancelEvaluation);
router.post('/api/evaluation/retry', evaluationController_1.retryEvaluation);
router.post('/questions', (req, res) => questionController_1.questionController.createQuestion(req, res));
router.post('/questions/:id/validate', (req, res) => questionController_1.questionController.validateTask(req, res));
router.post('/assessments/:id/submit', (req, res) => questionController_1.questionController.submitAssessment(req, res));
router.get('/api/evaluation/logs/:studentAssessmentId', evaluationController_1.getEvaluationLogs);
exports.default = router;
//# sourceMappingURL=evaluation.js.map