import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Activity,
  ShieldCheck,
  Settings,
  ClipboardList,
  FileUp,
  FileText,
} from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { RolePortalLayout } from './components/layout/RolePortalLayout';
import { LoginPage } from './pages/LoginPage';
import { CitizenDashboard } from './pages/dashboards/CitizenDashboard';
import { OfficerDashboard } from './pages/dashboards/OfficerDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { ReportsView } from './pages/dashboards/ReportsView';
import { SettingsView } from './pages/dashboards/SettingsView';

// Distinct dynamic nav items matching nested sub-routes per role
export const citizenNavItems = [
  { path: '/citizen', label: 'Overview', icon: FileUp },
  { path: '/citizen/reports', label: 'My Submissions', icon: ShieldCheck, badge: '3' },
  { path: '/citizen/settings', label: 'Settings', icon: Settings },
];

export const officerNavItems = [
  { path: '/officer', label: 'Scrutiny Queue', icon: ClipboardList, badge: '5' },
  { path: '/officer/reports', label: 'Inspection Dossiers', icon: ShieldCheck },
  { path: '/officer/settings', label: 'Settings', icon: Settings },
];

export const adminNavItems = [
  { path: '/admin', label: 'Platform Telemetry', icon: Activity },
  { path: '/admin/reports', label: 'Audit Records', icon: ShieldCheck },
  { path: '/admin/settings', label: 'System Settings', icon: Settings },
];

// Helper wrapper to provide navigation, live user from AuthContext, and backend status props into RolePortalLayout
function PortalLayoutWrapper({ backendStatus, backendMessage, navItems, defaultRole }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Prefer live authenticated user from database/AuthContext; fallback gracefully if accessed directly
  const effectiveUser = user || {
    full_name: defaultRole === 'admin' ? 'Amit Verma' : defaultRole === 'officer' ? 'Priya Sharma' : 'Ravi Kumar',
    name: defaultRole === 'admin' ? 'Amit Verma' : defaultRole === 'officer' ? 'Priya Sharma' : 'Ravi Kumar',
    email: defaultRole === 'admin' ? 'admin@nakshanetra.gov.in' : defaultRole === 'officer' ? 'officer.priya@mcd.gov.in' : 'citizen.ravi@gmail.com',
    role: defaultRole.toUpperCase(),
    zone: defaultRole === 'admin' ? 'Central Command HQ' : defaultRole === 'officer' ? 'South Delhi Division' : 'Delhi (MCD)',
    status: 'APPROVED',
  };

  return (
    <RolePortalLayout
      backendStatus={backendStatus}
      backendMessage={backendMessage}
      onLogout={() => {
        logout();
        navigate('/login');
      }}
      navItems={navItems}
      user={effectiveUser}
    />
  );
}

function AppRoutes() {
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

        {/* 1. Citizen Portal with Nested Routes */}
        <Route
          path="/citizen"
          element={
            <PortalLayoutWrapper
              backendStatus={backendStatus}
              backendMessage={backendMessage}
              navItems={citizenNavItems}
              defaultRole="citizen"
            />
          }
        >
          <Route index element={<CitizenDashboard />} />
          <Route path="reports" element={<ReportsView role="citizen" />} />
          <Route path="applications" element={<ReportsView role="citizen" />} />
          <Route path="settings" element={<SettingsView role="citizen" />} />
          <Route path="guidelines" element={<SettingsView role="citizen" />} />
        </Route>

        {/* 2. Officer Portal with Nested Routes */}
        <Route
          path="/officer"
          element={
            <PortalLayoutWrapper
              backendStatus={backendStatus}
              backendMessage={backendMessage}
              navItems={officerNavItems}
              defaultRole="officer"
            />
          }
        >
          <Route index element={<OfficerDashboard />} />
          <Route path="reports" element={<ReportsView role="officer" />} />
          <Route path="inspections" element={<ReportsView role="officer" />} />
          <Route path="settings" element={<SettingsView role="officer" />} />
        </Route>

        {/* 3. Admin Portal with Nested Routes */}
        <Route
          path="/admin"
          element={
            <PortalLayoutWrapper
              backendStatus={backendStatus}
              backendMessage={backendMessage}
              navItems={adminNavItems}
              defaultRole="admin"
            />
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="reports" element={<ReportsView role="admin" />} />
          <Route path="audit" element={<ReportsView role="admin" />} />
          <Route path="settings" element={<SettingsView role="admin" />} />
          <Route path="rules" element={<SettingsView role="admin" />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
