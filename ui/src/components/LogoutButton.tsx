import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  return (
    <button onClick={handleLogout} style={{ float: 'right', margin: '1rem' }}>
      Logout
    </button>
  );
};

export default LogoutButton;
