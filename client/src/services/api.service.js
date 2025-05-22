// client/src/services/api.service.js
import axios from 'axios';

// API base URL - Use explicit backend URL or fall back to proxy
const API_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_API_URL || '/api')
  : 'http://localhost:5001/api';

// Create axios instance with common configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  //withCredentials: true,
  timeout: 10000 // 10 second timeout
});

/**
 * Request interceptor for adding auth token to requests
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log outgoing requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for handling common errors
 */
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response (${response.status}):`, response.config.url);
    }
    return response;
  },
  (error) => {
    // Handle authentication errors (401)
    if (error.response && error.response.status === 401) {
      // Clear token on auth error
      localStorage.removeItem('token');
      
      // Dispatch custom event for authentication expiration
      const event = new CustomEvent('auth:expired', {
        detail: {
          message: error.response.data?.message || 'Your session has expired. Please log in again.'
        }
      });
      window.dispatchEvent(event);
    }
    
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API response error:', {
        url: error.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
    
    return Promise.reject(error);
  }
);

/**
 * Authentication API methods
 */
export const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Response with user data and success status
   */
  register: (userData) => api.post('/auth/register', userData),
  
  /**
   * Register an admin user
   * @param {Object} userData - Admin registration data
   * @returns {Promise<Object>} Response with user data and success status
   */
  registerAdmin: (userData) => api.post('/auth/admin-register', userData),
  
  /**
   * Login a user
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<Object>} Response with user data, token and success status
   */
  login: (username, password) => api.post('/auth/login', { username, password }),
  
  /**
   * Logout current user
   * @returns {Promise<Object>} Response with success status
   */
  logout: () => api.post('/auth/logout'),
  
  /**
   * Get current user profile
   * @returns {Promise<Object>} Response with user data
   */
  getCurrentUser: () => api.get('/auth/me')
};

/**
 * User API methods
 */
export const userAPI = {
  /**
   * Get current user profile
   * @returns {Promise<Object>} Response with user profile data
   */
  getProfile: () => api.get('/users/profile')
};

/**
 * Song API methods
 */
export const songAPI = {
  /**
   * Search songs with optional filters
   * @param {string} query - Search term
   * @param {string} [language] - Filter by language ("English" or "Hebrew")
   * @param {number} [page=1] - Page number
   * @param {number} [limit=10] - Results per page
   * @returns {Promise<Object>} Response with songs array and pagination data
   */
  searchSongs: (query, language, page = 1, limit = 10) => 
    api.get('/songs', { 
      params: { 
        query, 
        language,
        page,
        limit
      } 
    }),
  
  /**
   * Get song by ID
   * @param {string} id - Song ID
   * @returns {Promise<Object>} Response with song data
   */
  getSong: (id) => api.get(`/songs/${id}`)
};

/**
 * Session API methods
 */
export const sessionAPI = {
  /**
   * Get active sessions
   * @param {boolean} [latest=true] - If true, return only the most recent active session
   * @returns {Promise<Object>} Response with session data
   */
  getActiveSessions: (latest = true) => 
    api.get('/sessions/active', { 
      params: { latest: latest.toString() } 
    }),
  
  /**
   * Create a new session (admin only)
   * @param {Object} [sessionData={}] - Session data
   * @returns {Promise<Object>} Response with created session data
   */
  createSession: (sessionData = {}) => api.post('/sessions', sessionData),
  
  /**
   * Join a session
   * @param {string} id - Session ID
   * @returns {Promise<Object>} Response with session data
   */
  joinSession: (id) => api.post(`/sessions/${id}/join`)
};

/**
 * Error handling utilities
 */
export const errorUtils = {
  /**
   * Format error message from API response
   * @param {Error} error - Axios error object
   * @returns {string} Formatted error message
   */
  getErrorMessage: (error) => {
    if (error.response) {
      // Server responded with a non-2xx status
      if (error.response.data && error.response.data.message) {
        return error.response.data.message;
      }
      
      // Handle validation errors
      if (error.response.data && error.response.data.errors) {
        const errors = error.response.data.errors;
        return Object.keys(errors)
          .map(key => `${key}: ${errors[key]}`)
          .join(', ');
      }
      
      return `Error ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      // Request was made but no response received
      return 'No response from server. Please check your internet connection.';
    } else {
      // Error in setting up the request
      return error.message || 'An unknown error occurred';
    }
  }
};

/**
 * Socket.io event names (for reference)
 */
export const socketEvents = {
  // Client-to-Server events
  JOIN_SESSION: 'join_session',
  LEAVE_SESSION: 'leave_session',
  SELECT_SONG: 'select_song',
  QUIT_SONG: 'quit_song',
  
  // Server-to-Client events
  SESSION_STATE: 'session_state',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  SONG_SELECTED: 'song_selected',
  SONG_QUIT: 'song_quit',
  AUTOSCROLL_STATE: 'autoscroll_state',
  ERROR: 'error'
};

export default api;