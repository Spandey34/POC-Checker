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

function MaintenancePage() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">
          Kaam Chal rha bhai...🚧
        </h1>

        <p className="text-lg text-gray-300">
          Thodi der baad aao...
        </p>
      </div>
    </div>
  );
}

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

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

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