import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchNotifications = () => {
      axios.get('/api/users/notifications', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setNotifications(res.data.data || []));
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="notification-bell" aria-label="Notifications">
      <span role="img" aria-label="notifications">🔔</span>
      {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
    </div>
  );
};
export default NotificationBell;