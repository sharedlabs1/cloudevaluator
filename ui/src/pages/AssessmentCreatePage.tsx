import React, { useState } from 'react';

type TaskInput = { description: string; marks: number; evaluationScript: string };
type QuestionInput = { scenario: string; evaluationScript: string; tasks: TaskInput[] };

const AssessmentCreation = () => {
  const [questions, setQuestions] = useState<QuestionInput[]>([]);
  const [currentQ, setCurrentQ] = useState<QuestionInput>({ scenario: '', evaluationScript: '', tasks: [] });
  const [currentTask, setCurrentTask] = useState<TaskInput>({ description: '', marks: 0, evaluationScript: '' });
  const [showQForm, setShowQForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  // Editing and allocation logic for questions and tasks
  const [editQIndex, setEditQIndex] = useState<number | null>(null);
  const [editTaskIndex, setEditTaskIndex] = useState<number | null>(null);

  // Edit Question
  const startEditQuestion = (idx: number) => {
    setEditQIndex(idx);
    setCurrentQ({ ...questions[idx] });
    setShowQForm(true);
  };
  const saveEditQuestion = () => {
    if (editQIndex !== null) {
      const updated = [...questions];
      updated[editQIndex] = currentQ;
      setQuestions(updated);
      setEditQIndex(null);
      setShowQForm(false);
      setCurrentQ({ scenario: '', evaluationScript: '', tasks: [] });
    }
  };

  // Remove Question
  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  // Edit Task
  const startEditTask = (qIdx: number, tIdx: number) => {
    setEditQIndex(qIdx);
    setEditTaskIndex(tIdx);
    setCurrentQ({ ...questions[qIdx] });
    setCurrentTask({ ...questions[qIdx].tasks[tIdx] });
    setShowQForm(true);
    setShowTaskForm(true);
  };
  const saveEditTask = () => {
    if (editQIndex !== null && editTaskIndex !== null) {
      const updatedQ = { ...questions[editQIndex] };
      updatedQ.tasks[editTaskIndex] = currentTask;
      const updated = [...questions];
      updated[editQIndex] = updatedQ;
      setQuestions(updated);
      setEditTaskIndex(null);
      setEditQIndex(null);
      setShowTaskForm(false);
      setShowQForm(false);
      setCurrentTask({ description: '', marks: 0, evaluationScript: '' });
      setCurrentQ({ scenario: '', evaluationScript: '', tasks: [] });
    }
  };

  // Remove Task
  const removeTask = (qIdx: number, tIdx: number) => {
    const updatedQ: QuestionInput = { ...questions[qIdx], tasks: questions[qIdx].tasks.filter((_t: TaskInput, i: number) => i !== tIdx) };
    const updated = [...questions];
    updated[qIdx] = updatedQ;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, currentQ]);
    setCurrentQ({ scenario: '', evaluationScript: '', tasks: [] });
    setShowQForm(false);
  };

  const addTask = () => {
    const updatedQ: QuestionInput = { ...currentQ, tasks: [...currentQ.tasks, currentTask] };
    setCurrentQ(updatedQ);
    setCurrentTask({ description: '', marks: 0, evaluationScript: '' });
    setShowTaskForm(false);
  };

  return (
    <div>
      <ul>
        {questions.map((q, i) => (
          <li key={i}>
            <b>Scenario:</b> {q.scenario} <br />
            <button type="button" onClick={() => startEditQuestion(i)}>Edit</button>
            <button type="button" onClick={() => removeQuestion(i)}>Remove</button>
            <b>Tasks:</b>
            <ul>
              {q.tasks.map((t, j) => (
                <li key={j}>
                  {t.description} (Marks: {t.marks})
                  <button type="button" onClick={() => startEditTask(i, j)}>Edit</button>
                  <button type="button" onClick={() => removeTask(i, j)}>Remove</button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {showQForm ? (
        <div className="question-form">
          <input
            type="text"
            value={currentQ.scenario}
            onChange={(e) => setCurrentQ({ ...currentQ, scenario: e.target.value })}
            placeholder="Scenario"
          />
          <input
            type="text"
            value={currentQ.evaluationScript}
            onChange={(e) => setCurrentQ({ ...currentQ, evaluationScript: e.target.value })}
            placeholder="Evaluation Script"
          />
          <button type="button" onClick={editQIndex !== null ? saveEditQuestion : addQuestion}>
            {editQIndex !== null ? 'Save Question' : 'Add Question'}
          </button>
          {showTaskForm ? (
            <div className="task-form">
              <input
                type="text"
                value={currentTask.description}
                onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                placeholder="Task Description"
              />
              <input
                type="number"
                value={currentTask.marks}
                onChange={(e) => setCurrentTask({ ...currentTask, marks: parseInt(e.target.value) })}
                placeholder="Marks"
              />
              <input
                type="text"
                value={currentTask.evaluationScript}
                onChange={(e) => setCurrentTask({ ...currentTask, evaluationScript: e.target.value })}
                placeholder="Evaluation Script"
              />
              <button type="button" onClick={editTaskIndex !== null ? saveEditTask : addTask}>
                {editTaskIndex !== null ? 'Save Task' : 'Add Task'}
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setShowTaskForm(true)}>Add Task</button>
          )}
        </div>
      ) : (
        <button type="button" onClick={() => setShowQForm(true)}>Add Question</button>
      )}
    </div>
  );
};

export default AssessmentCreation;