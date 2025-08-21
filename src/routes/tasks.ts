import { Router } from 'express';
import {
  getTaskDetails,
  updateTask,
  deleteTask
} from '../controllers/taskController';

const router = Router();

// Task CRUD
router.get('/:id', getTaskDetails);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
