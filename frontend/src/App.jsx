import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RolePortalLayout } from './components/layout/RolePortalLayout';
import { LoginPage } from './pages/LoginPage';
import { CitizenDashboard } from './pages/dashboards/CitizenDashboard';
import { OfficerDashboard } from './pages/dashboards/OfficerDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';

function AuthenticatedPortal({ backendStatus, backendMessage }) {
  const navigate = useNavigate();
  return (
    <RolePortalLayout
      backendStatus={backendStatus}
      backendMessage={backendMessage}
      onLogout={() => navigate('/')}
    />
  );
}

export default function App() {
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'disconnected' | 'checking'
  const [backendMessage, setBackendMessage] = useState('');

  // Retain existing axios health check to http://localhost:8000/api/health
  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/health', {
          timeout: 4000,
        });
        if (isMounted) {
          if (response.data && response.data.status === 'ok') {
            setBackendStatus('connected');
            setBackendMessage(response.data.message || 'API is healthy');
          } else {
            setBackendStatus('disconnected');
            setBackendMessage('Unexpected response from /api/health');
          }
        }
      } catch (err) {
        if (isMounted) {
          setBackendStatus('disconnected');
          setBackendMessage(err.message || 'Backend unreachable');
        }
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 25000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Authentication Route */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Authenticated Role Portal Routes */}
        <Route
          element={
            <AuthenticatedPortal
              backendStatus={backendStatus}
              backendMessage={backendMessage}
            />
          }
        >
          <Route path="/citizen" element={<CitizenDashboard />} />
          <Route path="/citizen/*" element={<CitizenDashboard />} />
          <Route path="/officer" element={<OfficerDashboard />} />
          <Route path="/officer/*" element={<OfficerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
