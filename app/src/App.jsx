import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoadingActivityProvider } from './context/LoadingActivityContext';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import ResumesPage from './pages/ResumesPage';
import ResumePreviewPage from './pages/ResumePreviewPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import AppLayout from './components/AppLayout';

function AnonymousStartup({ isExiting = false }) {
  return (
    <div className={`startup-loader fixed inset-0 z-[100] flex items-center justify-center bg-gray-100 dark:bg-[#0a0a0a] ${isExiting ? 'startup-loader--exiting' : ''}`} role="status" aria-label="Preparing sign in">
      <div className="startup-loader-dots" aria-hidden="true" />
      <div className="startup-loader-mark" aria-hidden="true">
        <span className="header-loading-spinner" />
      </div>
    </div>
  );
}

function StartupGate({ children }) {
  const { loading } = useAuth();
  const [isExiting, setIsExiting] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);

  useEffect(() => {
    if (loading) return undefined;

    setIsExiting(true);
    const timer = window.setTimeout(() => setHasFinished(true), 420);
    return () => window.clearTimeout(timer);
  }, [loading]);

  if (hasFinished) return children;

  return <AnonymousStartup isExiting={isExiting} />;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function LandingRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to={user?.is_admin ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return <LandingPage />;
}

function AppRoutes() {
  const { user, sessionRestorationFailed } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingRoute />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage sessionRestorationFailed={sessionRestorationFailed} />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/" replace /> : <ForgotPasswordPage />} />
      <Route path="/reset-password" element={user ? <Navigate to="/" replace /> : <ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      
      {/* Protected Routes Without Layout */}
      <Route path="/resumes/:id/preview" element={<ProtectedRoute><ResumePreviewPage /></ProtectedRoute>} />

      {/* Protected Routes With Layout */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/applications/:id" element={<ApplicationDetailPage />} />
        <Route path="/resumes" element={<ResumesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        {user?.is_admin && (
          <>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
          </>
        )}
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LoadingActivityProvider>
            <StartupGate>
              <AppRoutes />
            </StartupGate>
          </LoadingActivityProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
