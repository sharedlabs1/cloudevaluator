import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AssessmentsPage from './pages/AssessmentsPage';
import ProfilePage from './pages/ProfilePage';
import AssessmentDetailPage from './pages/AssessmentDetailPage';
import TaskDetailPage from './pages/TaskDetailPage';
import CloudAccountsPage from './pages/CloudAccountPage';
import CloudAccountDetailPage from './pages/CloudAccountDetailPage';
import AssessmentCreatePage from './pages/AssessmentCreatePage';
import ReportsPage from './pages/ReportsPage';
import CloudAccountPage from './pages/CloudAccountPage';
import StudentDashboard from './pages/StudentDashboard';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/assessments" element={<AssessmentsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/assessments/:id" element={<AssessmentDetailPage />} />
        <Route path="/tasks/:id" element={<TaskDetailPage />} />
        <Route path="/cloud" element={<CloudAccountsPage />} />
        <Route path="/cloud/:id" element={<CloudAccountDetailPage />} />
        <Route path="/assessments/create" element={<AssessmentCreatePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        {/* <Route path="/student/dashboard" element={<StudentDashboard />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
