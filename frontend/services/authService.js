/**
 * Authentication service for handling user authentication operations
 */

import api from './api';
import oauthService from './oauthService';

const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - Promise with registration response
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Login user
   * @param {Object} credentials - User login credentials
   * @returns {Promise} - Promise with login response
   */
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    // Clear all auth-related localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear any potential session cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=').map(c => c.trim());
      if (name && (name.startsWith('auth_') || name.includes('session') || name.includes('token'))) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      }
    });
    
    // Reset any OAuth state
    if (typeof window !== 'undefined') {
      // Use the oauthService to reset all OAuth state
      if (typeof oauthService !== 'undefined' && oauthService.resetOAuthState) {
        try {
          oauthService.resetOAuthState();
          console.log('Reset all OAuth state');
        } catch (e) {
          console.log('Error resetting OAuth state:', e);
        }
      }
      
      // Clear Google auth if it exists
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.disableAutoSelect();
          console.log('Disabled Google auto select');
        } catch (e) {
          console.log('Error disabling Google auto select:', e);
        }
      }
      
      // Clear Facebook auth if it exists
      if (window.FB) {
        try {
          window.FB.logout();
          console.log('Logged out from Facebook');
        } catch (e) {
          console.log('Error logging out from Facebook:', e);
        }
      }
      
      // Clear LinkedIn auth if it exists
      if (window.IN && window.IN.User && window.IN.User.logout) {
        try {
          window.IN.User.logout();
          console.log('Logged out from LinkedIn');
        } catch (e) {
          console.log('Error logging out from LinkedIn:', e);
        }
      }
    }
    
    // Redirect to home page
    window.location.href = '/';
  },

  /**
   * Get current user profile
   * @returns {Promise} - Promise with user profile
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Update user profile
   * @param {Object} userData - User profile data to update
   * @returns {Promise} - Promise with updated user profile
   */
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/updatedetails', userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Update user password
   * @param {Object} passwordData - Password data (currentPassword, newPassword)
   * @returns {Promise} - Promise with update response
   */
  updatePassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/updatepassword', passwordData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Request password reset
   * @param {Object} emailData - Email data for password reset
   * @returns {Promise} - Promise with reset request response
   */
  forgotPassword: async (emailData) => {
    try {
      const response = await api.post('/auth/forgotpassword', emailData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Reset password with token
   * @param {string} resetToken - Password reset token
   * @param {Object} passwordData - New password data
   * @returns {Promise} - Promise with reset response
   */
  resetPassword: async (resetToken, passwordData) => {
    try {
      const response = await api.put(`/auth/resetpassword/${resetToken}`, passwordData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user is authenticated
   */
  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('token') ? true : false;
  },

  /**
   * Get current user from local storage
   * @returns {Object|null} - User object or null
   */
  getUser: () => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Google OAuth login/register
   * @param {Object} userData - User data from Google
   * @returns {Promise} - Promise with login response
   */
  googleAuth: async (userData) => {
    try {
      // Use the correct endpoint based on backend routes
      const endpoints = [
        '/auth/google'
      ];
      console.log('Using Google auth endpoint:', endpoints[0]);
      console.log('Sending userData to backend:', {
        ...userData,
        token: userData.token ? `${userData.token.substring(0, 20)}...` : 'no token'
      });
      
      let response = null;
      let error = null;
      
      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          response = await api.post(endpoint, {
            ...userData,
            provider: 'google' // Ensure provider is set correctly
          });
          
          if (response.data.success && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
          return response.data;
        } catch (endpointError) {
          console.error(`Failed to authenticate with Google using ${endpoint}:`, endpointError);
          error = endpointError;
          // Continue to next endpoint
        }
      }
      
      // If all endpoints failed, throw the last error
      throw error || new Error('Failed to authenticate with Google');
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Facebook OAuth login/register
   * @param {Object} userData - User data from Facebook
   * @returns {Promise} - Promise with login response
   */
  facebookAuth: async (userData) => {
    try {
      // Use the correct endpoint based on backend routes
      const endpoints = [
        '/auth/facebook'
      ];
      console.log('Using Facebook auth endpoint:', endpoints[0]);
      
      let response = null;
      let error = null;
      
      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          response = await api.post(endpoint, userData);
          
          // If this is just a check, return the response without storing token
          if (userData.checkOnly) {
            return response.data;
          }
          
          if (response.data.success && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
          }
        } catch (endpointError) {
          console.error(`Failed to authenticate with Facebook using ${endpoint}:`, endpointError);
          error = endpointError;
          // Continue to next endpoint
        }
      }
      
      // If all endpoints failed, throw the last error
      throw error || new Error('Failed to authenticate with Facebook');
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * LinkedIn OAuth login/register
   * @param {Object} userData - User data from LinkedIn
   * @returns {Promise} - Promise with login response
   */
  linkedinAuth: async (userData) => {
    try {
      // Use the correct endpoint based on backend routes
      const endpoints = [
        '/auth/linkedin'
      ];
      console.log('Using LinkedIn auth endpoint:', endpoints[0]);
      
      let response = null;
      let error = null;
      
      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          response = await api.post(endpoint, userData);
          
          // If this is just a check, return the response without storing token
          if (userData.checkOnly) {
            return response.data;
          }
          
          if (response.data.success && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
          }
        } catch (endpointError) {
          console.error(`Failed to authenticate with LinkedIn using ${endpoint}:`, endpointError);
          error = endpointError;
          // Continue to next endpoint
        }
      }
      
      // If all endpoints failed, throw the last error
      throw error || new Error('Failed to authenticate with LinkedIn');
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export default authService;
