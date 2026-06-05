import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InterviewGenerator from './pages/InterviewGenerator';
import MockInterview from './pages/MockInterview';
import CodingChallenges from './pages/CodingChallenges';
import ResumeUpload from './pages/ResumeUpload';
import SettingsPage from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import CareerGuidance from './pages/CareerGuidance';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Loader from './components/Loader';

// Protected Route wrapper component
const ProtectedLayout = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <Loader fullPage />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        {children}
      </div>
    </div>
  );
};

// Admin Route wrapper
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullPage />;
  }

  if (!user || !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route wrapper
const PublicRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <Loader fullPage />;
  }

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />

      {/* Protected Main Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        } 
      />
      <Route 
        path="/interview" 
        element={
          <ProtectedLayout>
            <InterviewGenerator />
          </ProtectedLayout>
        } 
      />
      <Route 
        path="/chatbot" 
        element={
          <ProtectedLayout>
            <MockInterview />
          </ProtectedLayout>
        } 
      />
      <Route 
        path="/coding" 
        element={
          <ProtectedLayout>
            <CodingChallenges />
          </ProtectedLayout>
        } 
      />
      <Route 
        path="/resume" 
        element={
          <ProtectedLayout>
            <ResumeUpload />
          </ProtectedLayout>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedLayout>
            <SettingsPage />
          </ProtectedLayout>
        } 
      />

      <Route 
        path="/career" 
        element={
          <ProtectedLayout>
            <CareerGuidance />
          </ProtectedLayout>
        } 
      />
      
      {/* Admin Route Gate */}
      <Route 
        path="/admin" 
        element={
          <ProtectedLayout>
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          </ProtectedLayout>
        } 
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
