import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import NotificationBell from './NotificationBell';

const user = JSON.parse(localStorage.getItem('user') || '{}'); // Or use context

const Navbar: React.FC = () => {
  const location = useLocation();
  return (
    <nav className="navbar">
      <div className="navbar-logo">Cloud Evaluator</div>
      <ul className="navbar-links">
        <li className={location.pathname === '/dashboard' ? 'active' : ''}>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        {(user.role === 'admin' || user.role === 'instructor') && (
          <li className={location.pathname === '/assessments' ? 'active' : ''}>
            <Link to="/assessments">Assessments</Link>
          </li>
        )}
        {user.role === 'admin' && (
          <li className={location.pathname === '/cloud' ? 'active' : ''}>
            <Link to="/cloud">Cloud Accounts</Link>
          </li>
        )}
        <li className={location.pathname === '/profile' ? 'active' : ''}>
          <Link to="/profile">Profile</Link>
        </li>
      </ul>
      <NotificationBell />
    </nav>
  );
};

export default Navbar;
