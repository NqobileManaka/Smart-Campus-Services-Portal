import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('http://localhost:8000/api/auth/me');
        setUser(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading user:', err.message);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const register = async (formData) => {
    try {
      setError(null);
      const res = await axios.post('http://localhost:8000/api/auth/register', formData);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      return true;
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Registration failed');
      return false;
    }
  };

  const login = async (formData) => {
    try {
      setError(null);
      const res = await axios.post('http://localhost:8000/api/auth/login', formData);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      return true;
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Login failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated: !!user,
        userRole: user ? user.role : null
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
