import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';

const taskService = new TaskService();

export const addTaskToQuestion = async (req: Request, res: Response) => {
  try {
    const task = await taskService.addTaskToQuestion(req.params.questionId, req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getTasksForQuestion = async (req: Request, res: Response) => {
  try {
    const tasks = await taskService.getTasksForQuestion(req.params.questionId);
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getTaskDetails = async (req: Request, res: Response) => {
  try {
    const task = await taskService.getTaskDetails(req.params.id);
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    await taskService.deleteTask(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const validateTask = async (req: Request, res: Response) => {
  try {
    const { studentId, submissionData } = req.body;
    // Accept taskId as either param or from req.params.id for backward compatibility
    const taskId = req.params.taskId || req.params.id;
    const assessmentId = req.params.assessmentId;
    const questionId = req.params.questionId;
    const result = await taskService.validateTask(assessmentId, questionId, taskId, studentId, submissionData);
    // After validation logic
    const status = result.status === 'pass' ? 'pass' : 'fail';
    // Optionally include more details for frontend
    return res.status(200).json({ success: true, status, details: result.details || null });
  } catch (error) {
    return res.status(500).json({ status: 'fail', message: error instanceof Error ? error.message : 'Unknown error' });
  }
};
