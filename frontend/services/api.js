/**
 * Base API service for making HTTP requests to the backend
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized responses
    if (error.response && error.response.status === 401) {
      // Check if we have a token but it's invalid
      const hasToken = localStorage.getItem('token');
      
      // Clear token and redirect to login if not already on login page
      // and we're not in the middle of an authentication flow
      if (typeof window !== 'undefined' && 
          !window.location.pathname.includes('/connexion') && 
          !window.location.pathname.includes('/auth/callback') &&
          hasToken) {
        console.log('Unauthorized access detected, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Use router for navigation if possible to prevent full page reload
        // Otherwise fall back to location redirect
        window.location.href = '/connexion';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
