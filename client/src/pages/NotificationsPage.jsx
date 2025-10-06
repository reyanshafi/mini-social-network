import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import NotificationItem from '../components/NotificationItem';

const NotificationsPage = () => {
//   const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuthStore((state) => state);

  // Get everything from the global store instead of fetching locally
  const notifications = useAuthStore((state) => state.notifications);
  const markNotificationsAsRead = useAuthStore((state) => state.markNotificationsAsRead);

  // When the page loads, mark notifications as read
  useEffect(() => {
    markNotificationsAsRead();
  }, [markNotificationsAsRead]);

  const fetchNotifications = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/notifications', config);
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Notifications</h1>
      <div className="space-y-3">
        {notifications.length > 0 ? notifications.map(notif => (
          <NotificationItem key={notif._id} notification={notif} />
        )) : (
          <p>You have no notifications.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;