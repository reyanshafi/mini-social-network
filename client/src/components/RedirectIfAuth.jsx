import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const RedirectIfAuth = () => {
  const { isAuthenticated } = useAuthStore((state) => state);

  if (isAuthenticated) {
    // If the user is already authenticated, redirect them to the feed
    return <Navigate to="/feed" replace />;
  }

  // Otherwise, show the page they were trying to access (the AuthPage)
  return <Outlet />;
};

export default RedirectIfAuth;