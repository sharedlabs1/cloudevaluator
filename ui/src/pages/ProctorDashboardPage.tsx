import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import LogoutButton from '../components/LogoutButton';

const ProctorDashboardPage: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/proctor/sessions', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setSessions(res.data.data || []));
  }, []);
  return (
    <div>
      <Navbar />
      <LogoutButton />
      <h2>Proctor Dashboard</h2>
      <ul>
        {sessions.map(s => (
          <li key={s.id}>
            <b>Assessment:</b> {s.assessmentTitle} | <b>Student:</b> {s.studentName}
            {/* Add video/screen feed and violation alerts here */}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default ProctorDashboardPage;