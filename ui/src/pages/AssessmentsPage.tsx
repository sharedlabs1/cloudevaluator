import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import LogoutButton from '../components/LogoutButton';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import './AssessmentsPage.css';

const AssessmentsPage: React.FC = () => {
  useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssessments = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/student/assessments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAssessments(res.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load assessments');
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  return (
    <div>
      <Navbar />
      <LogoutButton />
      <div className="assessments-container">
        <h2>Your Assessments</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <table className="assessments-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Score</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map(a => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.status}</td>
                <td>{a.score ?? '-'}</td>
                <td>{a.startTime ? new Date(a.startTime).toLocaleString() : '-'}</td>
                <td>{a.endTime ? new Date(a.endTime).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssessmentsPage;
