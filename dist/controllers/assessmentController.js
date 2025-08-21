"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentAssessments = exports.getAssessmentResults = exports.getAssessmentProgress = exports.submitAssessment = exports.startAssessment = exports.allocateAssessment = exports.deleteAssessment = exports.updateAssessment = exports.getAssessmentDetails = exports.getAssessments = exports.addQuestionToAssessment = exports.createAssessment = void 0;
const assessmentService_1 = require("../services/assessmentService");
const assessmentService = new assessmentService_1.AssessmentService();
const createAssessment = async (req, res) => {
    try {
        const assessment = await assessmentService.createAssessment(req.body);
        res.status(201).json({ success: true, data: assessment });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.createAssessment = createAssessment;
const addQuestionToAssessment = async (req, res) => {
    try {
        const { questionId, scenario, evaluationScript, tasks } = req.body;
        const result = await assessmentService.addQuestionToAssessment(req.params.assessmentId, questionId, scenario, evaluationScript, tasks);
        res.status(201).json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.addQuestionToAssessment = addQuestionToAssessment;
const getAssessments = async (_req, res) => {
    try {
        const assessments = await assessmentService.getAssessments();
        res.status(200).json({ success: true, data: assessments });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.getAssessments = getAssessments;
const getAssessmentDetails = async (req, res) => {
    try {
        const assessment = await assessmentService.getAssessmentDetails(req.params.id);
        res.status(200).json({ success: true, data: assessment });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.getAssessmentDetails = getAssessmentDetails;
const updateAssessment = async (req, res) => {
    try {
        const assessment = await assessmentService.updateAssessment(req.params.id, req.body);
        res.status(200).json({ success: true, data: assessment });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.updateAssessment = updateAssessment;
const deleteAssessment = async (req, res) => {
    try {
        await assessmentService.deleteAssessment(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.deleteAssessment = deleteAssessment;
const allocateAssessment = async (req, res) => {
    try {
        const allocation = await assessmentService.allocateAssessment(req.body);
        res.status(200).json({ success: true, data: allocation });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: errorMessage });
    }
};
exports.allocateAssessment = allocateAssessment;
const startAssessment = async (req, res) => {
    try {
        const result = await assessmentService.startAssessment(req.body);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: errorMessage });
    }
};
exports.startAssessment = startAssessment;
const submitAssessment = async (req, res) => {
    try {
        const result = await assessmentService.submitAssessment(req.body);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: errorMessage });
    }
};
exports.submitAssessment = submitAssessment;
const getAssessmentProgress = async (req, res) => {
    try {
        const progress = await assessmentService.getAssessmentProgress(req.params.student_assessment_id);
        res.status(200).json({ success: true, data: progress });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: errorMessage });
    }
};
exports.getAssessmentProgress = getAssessmentProgress;
const getAssessmentResults = async (req, res) => {
    try {
        const results = await assessmentService.getAssessmentResults(req.params.student_assessment_id);
        res.status(200).json({ success: true, data: results });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: errorMessage });
    }
};
exports.getAssessmentResults = getAssessmentResults;
const getStudentAssessments = (req, res) => {
    res.status(200).json({ success: true, data: [] });
};
exports.getStudentAssessments = getStudentAssessments;
//# sourceMappingURL=assessmentController.js.map