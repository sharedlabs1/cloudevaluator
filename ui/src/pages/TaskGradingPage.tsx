import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import LogoutButton from '../components/LogoutButton';
import { useAuth } from '../hooks/useAuth';

const TaskGradingPage: React.FC = () => {
  useAuth();
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [marks, setMarks] = useState(0);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSubmission = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/evaluation/submissions/${submissionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubmission(res.data.data);
        setFeedback(res.data.data.feedback || '');
        setMarks(res.data.data.marks || 0);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load submission');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [submissionId]);

  const handleGrade = async () => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/evaluation/submissions/${submissionId}/grade`, {
        feedback,
        marks
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Grade submitted successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit grade');
    }
  };

  return (
    <div>
      <Navbar />
      <LogoutButton />
      <div className="grading-container">
        <h2>Task Grading</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        {submission && (
          <>
            <div><b>Student:</b> {submission.studentName}</div>
            <div><b>Task:</b> {submission.taskDescription}</div>
            <div><b>Submission:</b></div>
            <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: 4 }}>{submission.answer}</pre>
            <div><b>Auto-evaluated Marks:</b> {submission.autoMarks ?? '-'}</div>
            <div><b>Auto-evaluation Result:</b> {submission.autoResult ?? '-'}</div>
            <div style={{ marginTop: '1rem' }}>
              <label>Feedback</label>
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3} style={{ width: '100%' }} />
              <label>Marks</label>
              <input type="number" value={marks} onChange={e => setMarks(Number(e.target.value))} min={0} style={{ width: '100px' }} />
              <button onClick={handleGrade} style={{ marginTop: 8 }}>Submit Grade</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskGradingPage;