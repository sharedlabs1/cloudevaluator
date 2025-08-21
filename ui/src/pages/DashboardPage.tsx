import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import LogoutButton from '../components/LogoutButton';
import Navbar from '../components/Navbar';
import axios from 'axios';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div>
      <Navbar />
      <LogoutButton />
      <div className="dashboard-container">
        <h2>Welcome to the Cloud Evaluator Dashboard</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {dashboard && dashboard.assessments && (
          <div className="dashboard-section">
            <h3>Your Assessments</h3>
            <table className="dashboard-table">
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
                {dashboard.assessments.map((a: any) => (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td>
                      <span className={`status-badge status-${a.status.toLowerCase()}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <progress value={a.progress} max={100}></progress>
                      {a.progress}%
                    </td>
                    <td>{a.startTime ? new Date(a.startTime).toLocaleString() : '-'}</td>
                    <td>{a.endTime ? new Date(a.endTime).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {dashboard && dashboard.tasks && (
          <div className="dashboard-section">
            <h3>Upcoming Tasks</h3>
            <div className="dashboard-cards">
              {dashboard.tasks.map((t: any) => (
                <div className="dashboard-card" key={t.id}>
                  <div className="card-title">{t.title}</div>
                  <div className="card-desc">{t.description}</div>
                  <div className="card-marks">Marks: {t.marks}</div>
                  <div className="card-status">Status: {t.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;


