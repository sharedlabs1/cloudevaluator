"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTask = exports.deleteTask = exports.updateTask = exports.getTaskDetails = exports.getTasksForQuestion = exports.addTaskToQuestion = void 0;
const taskService_1 = require("../services/taskService");
const taskService = new taskService_1.TaskService();
const addTaskToQuestion = async (req, res) => {
    try {
        const task = await taskService.addTaskToQuestion(req.params.questionId, req.body);
        res.status(201).json({ success: true, data: task });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.addTaskToQuestion = addTaskToQuestion;
const getTasksForQuestion = async (req, res) => {
    try {
        const tasks = await taskService.getTasksForQuestion(req.params.questionId);
        res.status(200).json({ success: true, data: tasks });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.getTasksForQuestion = getTasksForQuestion;
const getTaskDetails = async (req, res) => {
    try {
        const task = await taskService.getTaskDetails(req.params.id);
        res.status(200).json({ success: true, data: task });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.getTaskDetails = getTaskDetails;
const updateTask = async (req, res) => {
    try {
        const task = await taskService.updateTask(req.params.id, req.body);
        res.status(200).json({ success: true, data: task });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        await taskService.deleteTask(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.deleteTask = deleteTask;
const validateTask = async (req, res) => {
    try {
        const { studentId, submissionData } = req.body;
        const taskId = req.params.taskId || req.params.id;
        const assessmentId = req.params.assessmentId;
        const questionId = req.params.questionId;
        const result = await taskService.validateTask(assessmentId, questionId, taskId, studentId, submissionData);
        const status = result.status === 'pass' ? 'pass' : 'fail';
        return res.status(200).json({ success: true, status, details: result.details || null });
    }
    catch (error) {
        return res.status(500).json({ status: 'fail', message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.validateTask = validateTask;
//# sourceMappingURL=taskController.js.map