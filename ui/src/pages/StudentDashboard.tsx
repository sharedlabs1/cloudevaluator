import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import LogoutButton from '../components/LogoutButton';

const StudentDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState<{ [taskId: string]: boolean }>({});
  const [validationResult, setValidationResult] = useState<{ [taskId: string]: string }>({});

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/student/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboard(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleValidate = async (questionId: string, taskId: string) => {
    setValidating(v => ({ ...v, [taskId]: true }));
    setValidationResult(r => ({ ...r, [taskId]: '' }));
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/tasks/${taskId}/validate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setValidationResult(r => ({ ...r, [taskId]: res.data.status === 'pass' ? 'PASS' : 'FAIL' }));
    } catch (err: any) {
      setValidationResult(r => ({ ...r, [taskId]: 'FAIL' }));
    } finally {
      setValidating(v => ({ ...v, [taskId]: false }));
    }
  };

  return (
    <div>
      <Navbar />
      <LogoutButton />
      <div className="dashboard-container">
        <h2>Student Dashboard</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {dashboard && dashboard.assessments && dashboard.assessments.length === 0 && <p>No assignments yet.</p>}
        {dashboard && dashboard.assessments && dashboard.assessments.map((assessment: any) => (
          <div key={assessment.id} className="assessment-block">
            <h3>{assessment.title}</h3>
            <p>{assessment.description}</p>
            {assessment.questions.map((q: any) => (
              <div key={q.id} className="question-block">
                <h4>Question: {q.scenario}</h4>
                <ul>
                  {q.tasks.map((t: any) => (
                    <li key={t.id} style={{ marginBottom: 8 }}>
                      <span>{t.description} (Marks: {t.marks})</span>
                      {t.cloudLink && (
                        <a href={t.cloudLink} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 12 }}>
                          Cloud Link
                        </a>
                      )}
                      <button
                        style={{ marginLeft: 12 }}
                        onClick={() => handleValidate(q.id, t.id)}
                        disabled={validating[t.id]}
                      >
                        {validating[t.id] ? 'Validating...' : 'Validate'}
                      </button>
                      {validationResult[t.id] && (
                        <span style={{ marginLeft: 12, fontWeight: 'bold', color: validationResult[t.id] === 'PASS' ? 'green' : 'red' }}>
                          {validationResult[t.id]}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;