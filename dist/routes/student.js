"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assessmentController_1 = require("../controllers/assessmentController");
const evaluationController_1 = require("../controllers/evaluationController");
const studentController_1 = require("../controllers/studentController");
const router = (0, express_1.Router)();
router.get('/api/student/assessments', (req, res) => (0, assessmentController_1.getStudentAssessments)(req, res));
router.post('/api/student/assessments/:id/submit', (req, res) => (0, assessmentController_1.submitAssessment)(req, res));
router.post('/api/student/tasks/:taskId/evaluate', (req, res) => evaluationController_1.evaluationController.retryEvaluation(req, res));
router.get('/dashboard', (req, res) => (0, studentController_1.getStudentDashboard)(req, res));
exports.default = router;
//# sourceMappingURL=student.js.map