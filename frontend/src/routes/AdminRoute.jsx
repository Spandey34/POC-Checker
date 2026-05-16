import { useUser } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import { useDbUser } from '../context/UserContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AdminRoute() {
  const { isLoaded, isSignedIn } = useUser();
  const { dbUser, loading } = useDbUser();

  if (!isLoaded || loading) return <LoadingSpinner fullScreen />;
  if (!isSignedIn) return <Navigate to="/login" replace />;
  if (!dbUser || dbUser.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
