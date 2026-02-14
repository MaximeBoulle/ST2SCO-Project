import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// FIX: CSRF - helper to read the XSRF-TOKEN cookie value
function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const rawApiUrl = import.meta.env.VITE_API_URL;
  const isLocalApi = rawApiUrl?.includes('localhost');
  const API_URL =
    rawApiUrl && (!isLocalApi || window.location.hostname === 'localhost')
      ? rawApiUrl
      : (window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api');

  const ensureCsrfToken = useCallback(async () => {
    if (!getCsrfToken()) {
      try {
        await fetch(`${API_URL}/auth/csrf-token`, { credentials: 'include' });
      } catch {
        // CSRF token fetch failed
      }
    }
  }, [API_URL]);

  const checkUserLoggedIn = useCallback(async () => {
    try {
      await ensureCsrfToken();
      const res = await fetch(`${API_URL}/auth/profile`, {
        credentials: 'include'
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch {
      // Not logged in
    } finally {
      setLoading(false);
    }
  }, [API_URL, ensureCsrfToken]);

  useEffect(() => {
    checkUserLoggedIn();
  }, [checkUserLoggedIn]);

  const login = async (username, password) => {
    await ensureCsrfToken();
    // FIX: CSRF - include XSRF-TOKEN header on state-changing requests
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': getCsrfToken(),
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await res.json();
    setUser(data.user);
  };

  const register = async (username, password) => {
    await ensureCsrfToken();
    // FIX: CSRF - include XSRF-TOKEN header on state-changing requests
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': getCsrfToken(),
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    return await res.json();
  };

  const logout = async () => {
    try {
      // FIX: CSRF - include XSRF-TOKEN header on state-changing requests
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': getCsrfToken() },
        credentials: 'include',
      });
    } catch {
      // Logout error
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, getCsrfToken }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
