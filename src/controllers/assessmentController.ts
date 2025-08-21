import { Request, Response } from 'express';
import { AssessmentService } from '../services/assessmentService';

const assessmentService = new AssessmentService();

export const createAssessment = async (req: Request, res: Response) => {
  try {
    const assessment = await assessmentService.createAssessment(req.body);
    res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const addQuestionToAssessment = async (req: Request, res: Response) => {
  try {
    const { questionId, scenario, evaluationScript, tasks } = req.body;
    const result = await assessmentService.addQuestionToAssessment(
      req.params.assessmentId,
      questionId,
      scenario,
      evaluationScript,
      tasks
    );
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getAssessments = async (_req: Request, res: Response) => {
  try {
    const assessments = await assessmentService.getAssessments();
    res.status(200).json({ success: true, data: assessments });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getAssessmentDetails = async (req: Request, res: Response) => {
  try {
    const assessment = await assessmentService.getAssessmentDetails(req.params.id);
    res.status(200).json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updateAssessment = async (req: Request, res: Response) => {
  try {
    const assessment = await assessmentService.updateAssessment(req.params.id, req.body);
    res.status(200).json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const deleteAssessment = async (req: Request, res: Response) => {
  try {
    await assessmentService.deleteAssessment(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const allocateAssessment = async (req: Request, res: Response) => {
  try {
    const allocation = await assessmentService.allocateAssessment(req.body);
    res.status(200).json({ success: true, data: allocation });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const startAssessment = async (req: Request, res: Response) => {
  try {
    const result = await assessmentService.startAssessment(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const submitAssessment = async (req: Request, res: Response) => {
  try {
    const result = await assessmentService.submitAssessment(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const getAssessmentProgress = async (req: Request, res: Response) => {
  try {
    const progress = await assessmentService.getAssessmentProgress(req.params.student_assessment_id);
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const getAssessmentResults = async (req: Request, res: Response) => {
  try {
    const results = await assessmentService.getAssessmentResults(req.params.student_assessment_id);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const getStudentAssessments = (req: import('express').Request, res: import('express').Response) => {
  // TODO: Implement logic to fetch student assessments
  res.status(200).json({ success: true, data: [] });
};