// client/src/services/api.service.js
import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors (401)
    if (error.response && error.response.status === 401) {
      // Clear token on auth error
      localStorage.removeItem('token');
      
      // Dispatch custom event for authentication expiration
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (userData) => api.post('/auth/register', userData),
  registerAdmin: (userData) => api.post('/auth/admin-register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me')
};

// User API methods
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData)
};

// Song API methods
export const songAPI = {
  searchSongs: (query, language) => api.get('/songs', { params: { query, language } }),
  getSong: (id) => api.get(`/songs/${id}`)
};

// Session API methods
export const sessionAPI = {
  getActiveSessions: () => api.get('/sessions/active'),
  getSession: (id) => api.get(`/sessions/${id}`),
  createSession: (data) => api.post('/sessions', data),
  joinSession: (id) => api.post(`/sessions/${id}/join`),
  endSession: (id) => api.post(`/sessions/${id}/end`)
};

export default api;