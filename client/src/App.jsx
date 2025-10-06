import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import useAuthStore from './store/authStore';
import HomePage from './pages/HomePage';
import FeedPage from './pages/FeedPage';
import ProtectedRoute from './components/ProtectedRoute';
import RedirectIfAuth from './components/RedirectIfAuth';
import MainLayout from './components/MainLayout';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import NotificationsPage from './pages/NotificationsPage';
import ChatPage from './pages/ChatPage';

function App() {
  // Get all necessary state and actions from the store
 const user = useAuthStore((state) => state.user);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
const connectSocket = useAuthStore((state) => state.connectSocket);
const disconnectSocket = useAuthStore((state) => state.disconnectSocket);

  useEffect(() => {
    if (isAuthenticated) {
      const socket = connectSocket();
      
      // Tell the server which user this socket belongs to
      if (socket && user) {
        socket.emit('addUser', user._id);
      }
    }
    // Cleanup function: disconnects when auth state changes or component unmounts
    return () => disconnectSocket();
  }, [isAuthenticated, user, connectSocket, disconnectSocket]); // Correct dependency array

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route element={<RedirectIfAuth />}>
        <Route path="/auth" element={<AuthPage />} />
      </Route>
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/explore/search" element={<SearchPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;