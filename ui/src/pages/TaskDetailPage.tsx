import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import LogoutButton from '../components/LogoutButton';
import { useAuth } from '../hooks/useAuth';
import './TaskDetailPage.css';

const TaskDetailPage: React.FC = () => {
  useAuth();
  const { id } = useParams();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submission, setSubmission] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const [editMarks, setEditMarks] = useState(0);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTask(res.data.data);
        setEditDesc(res.data.data.description);
        setEditMarks(res.data.data.marks);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load task');
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleValidate = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/tasks/${id}/validate`, { submission }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setValidationResult(res.data);
    } catch (err: any) {
      setValidationResult({ error: err.response?.data?.message || 'Validation failed' });
    }
  };

  const handleEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/tasks/${id}`, { description: editDesc, marks: editMarks }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTask({ ...task, description: editDesc, marks: editMarks });
      setEditMode(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  return (
    <div>
      <Navbar />
      <LogoutButton />
      <div className="task-detail-container">
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {task && (
          <>
            <h2>Task Details</h2>
            {editMode ? (
              <div className="edit-task-form">
                <input value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                <input type="number" value={editMarks} onChange={e => setEditMarks(Number(e.target.value))} />
                <button onClick={handleEdit}>Save</button>
                <button onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            ) : (
              <>
                <div><strong>Description:</strong> {task.description}</div>
                <div><strong>Marks:</strong> {task.marks}</div>
                {/* Show edit button for instructors/admins only in real app */}
                <button onClick={() => setEditMode(true)}>Edit Task</button>
              </>
            )}
            <div style={{ marginTop: '2rem' }}>
              <textarea
                value={submission}
                onChange={e => setSubmission(e.target.value)}
                placeholder="Enter your answer or code here"
                rows={6}
                style={{ width: '100%' }}
              />
              <button onClick={handleValidate}>Validate Task</button>
            </div>
            {validationResult && (
              <div className="validation-result">
                <pre>{JSON.stringify(validationResult, null, 2)}</pre>
                <div style={{ color: validationResult.status === 'pass' ? 'green' : 'red', fontWeight: 'bold' }}>
                  {validationResult.status === 'pass' ? 'Task Passed' : 'Task Failed'}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TaskDetailPage;
