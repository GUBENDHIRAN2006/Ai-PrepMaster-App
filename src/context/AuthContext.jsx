import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

// ─── Axios base config ───────────────────────────────────────────────────────
// In production (Vercel), VITE_API_URL is set to the Render backend URL.
// In local dev the Vite proxy forwards /api requests, so no baseURL is needed.
if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
} else {
  delete axios.defaults.baseURL;
}

const AuthContext = createContext(null);

// ─── Helper: retry an async fn up to `maxTries` times ───────────────────────
const withRetry = async (fn, maxTries = 3, delayMs = 400) => {
  let lastErr;
  for (let attempt = 0; attempt < maxTries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      // Don't retry on 4xx client errors (wrong password, not found, etc.)
      if (err?.response?.status && err.response.status < 500) throw err;
      if (attempt < maxTries - 1) {
        await new Promise(r => setTimeout(r, delayMs * (attempt + 1)));
      }
    }
  }
  throw lastErr;
};

// ─── Helper: parse axios errors into user-friendly messages ─────────────────
const parseError = (err, defaultMsg) => {
  if (!err.response) {
    return 'Cannot reach the server. Please make sure the backend is running on port 8000.';
  }
  const status = err.response.status;
  const detail = (err.response?.data?.detail || '').toLowerCase();

  if (status === 401 || detail.includes('incorrect') || detail.includes('invalid') || detail.includes('unauthorized')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (detail.includes('not found') || detail.includes('no account')) {
    return 'No account found with this email. Please register first.';
  }
  if (detail.includes('already') || detail.includes('registered') || detail.includes('exists')) {
    return 'This email is already registered. Please sign in instead.';
  }
  if (detail) return err.response.data.detail;
  return defaultMsg;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [token, setToken]             = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading]         = useState(true);   // initial session check
  const [loginLoading, setLoginLoading] = useState(false); // login/register button spinner

  // ── Sync axios Authorization header whenever token changes ────────────────
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // ── On mount: validate any stored token ──────────────────────────────────
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      try {
        const res = await withRetry(() => axios.get('/api/auth/me'), 2, 300);
        setUser(res.data);
        setToken(storedToken);
      } catch (err) {
        console.warn('Stored token invalid or expired — clearing session.', err?.response?.status);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []); // runs once on mount only

  // ── Core login function ───────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoginLoading(true);
    try {
      // Step 1: Get JWT token
      const tokenRes = await withRetry(
        () => axios.post('/api/auth/login', { email, password }),
        1  // no retries on login — wrong password should fail immediately
      );
      const newToken = tokenRes.data.access_token;

      // Store and configure token immediately
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      // Step 2: Fetch full user profile (retry up to 3x — fixes Supabase first-write lag)
      const userRes = await withRetry(() => axios.get('/api/auth/me'), 3, 300);
      const userData = userRes.data;

      // Update React state
      setToken(newToken);
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      // Clean up on any failure
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
      return { success: false, message: parseError(err, 'Login failed. Please try again.') };
    } finally {
      setLoginLoading(false);
      setLoading(false);
    }
  }, []);

  // ── Register: create account then auto-login ──────────────────────────────
  const register = useCallback(async (name, email, password, is_admin = false) => {
    setLoginLoading(true);
    try {
      // Step 1: Create the user account
      await withRetry(
        () => axios.post('/api/auth/register', { name, email, password, is_admin }),
        1  // no retries — duplicate email should fail immediately
      );

      // Step 2: Small delay to let Supabase PostgreSQL commit the new row
      // before immediately querying it in the login step below
      await new Promise(r => setTimeout(r, 300));

      // Step 3: Auto-login with the newly created credentials
      // Note: login() manages its own loginLoading state
      const loginResult = await login(email, password);
      return loginResult;
    } catch (err) {
      return { success: false, message: parseError(err, 'Registration failed. Please try again.') };
    } finally {
      // Ensure spinner is always stopped even if login() threw unexpectedly
      setLoginLoading(false);
    }
  }, [login]);

  // ── Logout: clear all auth state ─────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, loginLoading, login, register, logout }}>
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
