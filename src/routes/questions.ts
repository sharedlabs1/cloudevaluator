import { Router } from 'express';
import {
  getQuestionDetails,
  updateQuestion,
  deleteQuestion,
  addQuestionToAssessment,
  getQuestionsForAssessment
} from '../controllers/questionController';
import {
  addTaskToQuestion,
  getTasksForQuestion
} from '../controllers/taskController';

const router = Router();

// Question CRUD
router.get('/:id', getQuestionDetails);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

// Nested: Add/Get Questions for Assessment
router.post('/assessment/:assessmentId', addQuestionToAssessment);
router.get('/assessment/:assessmentId', getQuestionsForAssessment);

// Nested: Tasks for Question
router.post('/:questionId/tasks', addTaskToQuestion);
router.get('/:questionId/tasks', getTasksForQuestion);

export default router;
