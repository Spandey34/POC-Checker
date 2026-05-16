import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from './context/UserContext';
import ProtectedRoute  from './routes/ProtectedRoute';
import AdminRoute      from './routes/AdminRoute';
import LoginPage               from './pages/LoginPage';
import PendingVerificationPage from './pages/PendingVerificationPage';
import AdminDashboard  from './pages/AdminDashboard';
import UserDashboard   from './pages/UserDashboard';
import NotFoundPage    from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'DM Sans, sans-serif', fontSize: '14px' },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/pending" element={<PendingVerificationPage />} />

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Verified user routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<UserDashboard />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}
