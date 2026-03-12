/**
 * Authentication context for managing user authentication state across the application
 */

'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is already authenticated
        if (authService.isAuthenticated()) {
          const storedUser = authService.getUser();
          
          // Set user from localStorage immediately to prevent flash of unauthenticated state
          if (storedUser) {
            setUser(storedUser);
          }
          
          // Verify token validity by fetching current user
          try {
            const response = await authService.getCurrentUser();
            // Update user data with fresh data from server
            if (response.data && response.data.user) {
              setUser(response.data.user);
              // Update localStorage with fresh user data
              localStorage.setItem('user', JSON.stringify(response.data.user));
            } else if (response.data) {
              setUser(response.data);
              // Update localStorage with fresh user data
              localStorage.setItem('user', JSON.stringify(response.data));
            }
          } catch (error) {
            console.error('Error verifying token:', error);
            // Only logout if it's a 401 error (unauthorized)
            if (error.response && error.response.status === 401) {
              authService.logout();
              setUser(null);
            }
            // For other errors, keep the user logged in with stored data
            // This prevents logout on temporary API issues
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError(error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Register a new user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Google login
  const googleLogin = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.googleAuth(userData);
      // Ensure we have a user object and set it in state
      if (response && response.user) {
        setUser(response.user);
        // Double check localStorage has the token and user
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Facebook login
  const facebookLogin = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.facebookAuth(userData);
      // Ensure we have a user object and set it in state
      if (response && response.user) {
        setUser(response.user);
        // Double check localStorage has the token and user
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // LinkedIn login
  const linkedinLogin = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.linkedinAuth(userData);
      // Ensure we have a user object and set it in state
      if (response && response.user) {
        setUser(response.user);
        // Double check localStorage has the token and user
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.updateProfile(userData);
      setUser(response.data);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Request password reset
  const forgotPassword = async (emailData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.forgotPassword(emailData);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (resetToken, passwordData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.resetPassword(resetToken, passwordData);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    register,
    login,
    googleLogin,
    facebookLogin,
    linkedinLogin,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
