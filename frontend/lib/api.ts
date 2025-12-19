import axios from 'axios';

// Get API URL - check both build-time and runtime
// For production on Render, use the backend URL
const getApiUrl = () => {
  // Check if we're in browser (client-side)
  if (typeof window !== 'undefined') {
    // Check if we're on Render (production)
    if (window.location.hostname.includes('onrender.com')) {
      // Try to get from env var first, then construct from current hostname
      const envUrl = process.env.NEXT_PUBLIC_API_URL;
      if (envUrl && !envUrl.includes('localhost')) {
        return envUrl;
      }
      // Fallback: construct backend URL from frontend URL
      // If frontend is fanhouse-frontend.onrender.com, backend should be fanhouse-backend.onrender.com
      const hostname = window.location.hostname;
      if (hostname.includes('fanhouse-frontend')) {
        return hostname.replace('fanhouse-frontend', 'fanhouse-backend');
      }
      // Generic fallback for Render
      return 'https://fanhouse-backend.onrender.com';
    }
  }
  // Development or env var available
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

const API_URL = getApiUrl();

// Debug: Log the API URL (only in browser)
if (typeof window !== 'undefined') {
  console.log('[API] Using API URL:', API_URL);
  console.log('[API] Full base URL:', `${API_URL}/api`);
  console.log('[API] Current hostname:', window.location.hostname);
}

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;

