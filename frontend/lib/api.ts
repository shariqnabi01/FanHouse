import axios from 'axios';

// Get API URL - auto-detect Render environment
const getApiUrl = () => {
  // Client-side: check if we're on Render
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('onrender.com')) {
      // Use env var if available, otherwise construct from hostname
      const envUrl = process.env.NEXT_PUBLIC_API_URL;
      if (envUrl && !envUrl.includes('localhost')) {
        return envUrl;
      }
      // Auto-detect backend URL from frontend hostname
      const hostname = window.location.hostname;
      if (hostname.includes('fanhouse-frontend')) {
        return `https://${hostname.replace('fanhouse-frontend', 'fanhouse-backend')}`;
      }
      // Fallback
      return 'https://fanhouse-backend.onrender.com';
    }
  }
  // Development: use env var or localhost
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

