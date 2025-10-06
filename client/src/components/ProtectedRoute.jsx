import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore((state) => state);

  if (!isAuthenticated) {
    // If not authenticated, redirect to the auth page
    return <Navigate to="/auth" replace />;
  }

  // If authenticated, render the child route (e.g., the FeedPage)
  return <Outlet />;
};

export default ProtectedRoute;