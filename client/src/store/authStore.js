import { create } from 'zustand';
import axios from 'axios';
import {io} from 'socket.io-client';


const useAuthStore = create((set, get) => ({
  // --- Existing Auth State ---
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  //socket state
  socket: null,

  // --- NEW Notification State ---
  notifications: [],
  unreadCount: 0,

  //message state
  unreadMessagesCount: 0,

  login: (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    set({ user: userData, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, notifications: [], unreadCount: 0 });
  },

  //socket actions
  connectSocket: () => {
    const newSocket = io("http://localhost:5000");
    set({ socket: newSocket });
    return newSocket;
  },
  disconnectSocket: () => {
    get().socket?.disconnect();
    set({ socket: null });
  },
  
  


  // --- NEW Notification Actions ---
  fetchNotifications: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/notifications', config);
      const unread = res.data.filter(n => !n.read).length;
      set({ notifications: res.data, unreadCount: unread });
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  },

  markNotificationsAsRead: async () => {
    const { token, fetchNotifications } = get();
    if (!token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put('/api/notifications/read', {}, config);
      // After marking as read, refetch to update the state and count
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  },

  //fetch unread messages
  fetchUnreadMessages: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/messages/unread-count', config);
      set({ unreadMessages: res.data.count });
    } catch (error) {
      console.error("Failed to fetch unread message count", error);
    }
  },

  // mark convos as read
   markConversationAsRead: async (conversationId) => {
    const { token, fetchUnreadMessages } = get();
    if (!token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/messages/read/${conversationId}`, {}, config);
      // After marking as read, immediately refetch the count to update the UI
      fetchUnreadMessages();
    } catch (error) {
      console.error("Failed to mark messages as read", error);
    }
  },
}));

export default useAuthStore;