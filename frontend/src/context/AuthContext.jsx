import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_URL}`;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('nakshanetra_token'));
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('nakshanetra_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Sync with global zustand store if needed
  const { setCurrentUser } = useAuthStore();

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user, setCurrentUser]);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: email.trim(),
        password,
      });

      const { access_token, user: userData } = response.data;

      localStorage.setItem('nakshanetra_token', access_token);
      localStorage.setItem('nakshanetra_user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      setCurrentUser(userData);

      return userData;
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || err.message || 'Login failed. Please check credentials.';
      setAuthError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (userData) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
      const data = response.data;

      // Only auto-login if the user is approved (e.g. Citizen or Admin)
      if (data.user && data.user.status === 'APPROVED' && data.access_token) {
        localStorage.setItem('nakshanetra_token', data.access_token);
        localStorage.setItem('nakshanetra_user', JSON.stringify(data.user));
        setToken(data.access_token);
        setUser(data.user);
        setCurrentUser(data.user);
      }

      return data;
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || err.message || 'Registration failed. Please try again.';
      setAuthError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('nakshanetra_token');
    localStorage.removeItem('nakshanetra_user');
    setToken(null);
    setUser(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
