import { Request, Response } from 'express';
import { spawn } from 'child_process';
import { QuestionService } from '../services/questionService';
import { TaskService } from '../services/taskService';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

const questionService = new QuestionService();

// Create question (with tasks and script)
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { scenario, evaluationScript, tasks } = req.body;
    const question = await questionService.createQuestion(scenario, evaluationScript, tasks);
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Update evaluation script
export const updateEvaluationScript = async (req: Request, res: Response) => {
  try {
    const { evaluationScript } = req.body;
    const question = await questionService.updateEvaluationScript(req.params.id, evaluationScript);
    res.status(200).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

@ApiTags('Questions')
export class QuestionController {
  private questionService: QuestionService;
  private taskService: TaskService;

  constructor() {
    this.questionService = new QuestionService();
    this.taskService = new TaskService();
  }

  @ApiOperation({ summary: 'Create a new question' })
  @ApiResponse({ status: 201, description: 'Question created successfully.' })
  @ApiResponse({ status: 400, description: 'Missing required fields.' })
  @ApiResponse({ status: 500, description: 'Failed to create question.' })
  async createQuestion(req: Request, res: Response) {
    try {
      const { scenario, tasks, evaluationScript } = req.body;

      if (!scenario || !tasks || !evaluationScript) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const questionResult = await this.questionService.createQuestion(scenario, tasks, evaluationScript);

      return res.status(201).json({ message: 'Question created successfully', question: questionResult.rows[0] });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to create question' });
    }
  }

  @ApiOperation({ summary: 'Validate a task' })
  @ApiResponse({ status: 200, description: 'Task validated successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed or invalid task index.' })
  @ApiResponse({ status: 404, description: 'Question not found.' })
  @ApiResponse({ status: 500, description: 'Error during validation.' })
  async validateTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { taskIndex } = req.body;

      const { question, task } = await this.questionService.validateTask(Number(id), taskIndex);

      const pythonProcess = spawn('python', ['-c', question.evaluation_script]);

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

      // Ensure a response is sent if no events are triggered
      setTimeout(() => {
        if (!responseSent) {
          responseSent = true;
          res.status(500).json({ message: 'Validation process timed out' });
        }
      }, 10000); // Timeout after 10 seconds

      return; // Ensure the method always returns
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
  }

  @ApiOperation({ summary: 'Submit an assessment' })
  @ApiResponse({ status: 200, description: 'Assessment submitted successfully.' })
  @ApiResponse({ status: 404, description: 'Assessment not found.' })
  @ApiResponse({ status: 500, description: 'Error during submission.' })
  async submitAssessment(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const score = await this.questionService.submitAssessment(Number(id));

      return res.status(200).json({ message: 'Assessment submitted successfully', score });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
  }

  @ApiOperation({ summary: 'Add a question to an assessment' })
  @ApiResponse({ status: 201, description: 'Question added to assessment successfully.' })
  @ApiResponse({ status: 500, description: 'Failed to add question to assessment.' })
  async addQuestionToAssessment(req: Request, res: Response) {
    try {
      const question = await this.questionService.addQuestionToAssessment(req.params.assessmentId, req.body);
      res.status(201).json({ success: true, data: question });
    } catch (error) {
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  @ApiOperation({ summary: 'Get questions for an assessment' })
  @ApiResponse({ status: 200, description: 'Questions retrieved successfully.' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve questions.' })
  async getQuestionsForAssessment(req: Request, res: Response) {
    try {
      const questions = await this.questionService.getQuestionsForAssessment(req.params.assessmentId);
      res.status(200).json({ success: true, data: questions });
    } catch (error) {
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  @ApiOperation({ summary: 'Get details of a question' })
  @ApiResponse({ status: 200, description: 'Question details retrieved successfully.' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve question details.' })
  async getQuestionDetails(req: Request, res: Response) {
    try {
      const question = await this.questionService.getQuestionDetails(req.params.id);
      res.status(200).json({ success: true, data: question });
    } catch (error) {
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  @ApiOperation({ summary: 'Update a question' })
  @ApiResponse({ status: 200, description: 'Question updated successfully.' })
  @ApiResponse({ status: 500, description: 'Failed to update question.' })
  async updateQuestion(req: Request, res: Response) {
    try {
      const question = await this.questionService.updateQuestion(req.params.id, req.body);
      res.status(200).json({ success: true, data: question });
    } catch (error) {
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  @ApiOperation({ summary: 'Delete a question' })
  @ApiResponse({ status: 204, description: 'Question deleted successfully.' })
  @ApiResponse({ status: 500, description: 'Failed to delete question.' })
  async deleteQuestion(req: Request, res: Response) {
    try {
      await this.questionService.deleteQuestion(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}

export const questionController = new QuestionController();
export const addQuestionToAssessment = (req: Request, res: Response) => questionController.addQuestionToAssessment(req, res);
export const getQuestionsForAssessment = (req: Request, res: Response) => questionController.getQuestionsForAssessment(req, res);
export const getQuestionDetails = (req: Request, res: Response) => questionController.getQuestionDetails(req, res);
export const updateQuestion = (req: Request, res: Response) => questionController.updateQuestion(req, res);
export const deleteQuestion = (req: Request, res: Response) => questionController.deleteQuestion(req, res);