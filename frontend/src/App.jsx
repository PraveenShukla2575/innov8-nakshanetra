import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { RolePortalLayout } from './components/layout/RolePortalLayout';
import { CitizenDashboard } from './pages/dashboards/CitizenDashboard';
import { OfficerDashboard } from './pages/dashboards/OfficerDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';

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
        <Route
          element={
            <RolePortalLayout
              backendStatus={backendStatus}
              backendMessage={backendMessage}
            />
          }
        >
          <Route path="/" element={<Navigate to="/citizen" replace />} />
          <Route path="/citizen" element={<CitizenDashboard />} />
          <Route path="/citizen/*" element={<CitizenDashboard />} />
          <Route path="/officer" element={<OfficerDashboard />} />
          <Route path="/officer/*" element={<OfficerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/citizen" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
