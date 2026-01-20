import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const rawApiUrl = import.meta.env.VITE_API_URL;
  const isLocalApi = rawApiUrl?.includes('localhost');
  const API_URL =
    rawApiUrl && (!isLocalApi || window.location.hostname === 'localhost')
      ? rawApiUrl
      : (window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api');

  const checkUserLoggedIn = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        credentials: 'include'
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch {
      console.log("Not logged in");
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    checkUserLoggedIn();
  }, [checkUserLoggedIn]);

  const login = async (username, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    
    return await res.json();
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error(e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
