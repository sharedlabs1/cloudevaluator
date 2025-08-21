"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const questionController_1 = require("../controllers/questionController");
const taskController_1 = require("../controllers/taskController");
const router = (0, express_1.Router)();
router.get('/:id', questionController_1.getQuestionDetails);
router.put('/:id', questionController_1.updateQuestion);
router.delete('/:id', questionController_1.deleteQuestion);
router.post('/assessment/:assessmentId', questionController_1.addQuestionToAssessment);
router.get('/assessment/:assessmentId', questionController_1.getQuestionsForAssessment);
router.post('/:questionId/tasks', taskController_1.addTaskToQuestion);
router.get('/:questionId/tasks', taskController_1.getTasksForQuestion);
exports.default = router;
//# sourceMappingURL=questions.js.map