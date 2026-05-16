import { useUser } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import { useDbUser } from '../context/UserContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useUser();
  const { dbUser, loading } = useDbUser();

  if (!isLoaded || loading) return <LoadingSpinner fullScreen />;
  if (!isSignedIn) return <Navigate to="/login" replace />;
  if (!dbUser) return <Navigate to="/login" replace />;

  // Admin should be redirected to admin panel
  if (dbUser.role === 'admin') return <Navigate to="/admin" replace />;

  // Unverified users see pending page
  if (!dbUser.isVerified) return <Navigate to="/pending" replace />;

  return <Outlet />;
}
