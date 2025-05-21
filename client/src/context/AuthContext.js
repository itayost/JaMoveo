// client/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, errorUtils } from '../services/api.service';

// Create the auth context
const AuthContext = createContext();

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context values
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Auth Provider Component
 * Manages authentication state and provides auth methods to children
 */
export const AuthProvider = ({ children }) => {
  // State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);

  /**
   * Function to check if a JWT token is expired
   * @param {string} jwtToken - JWT token to check
   * @returns {boolean} True if token is expired or invalid, false otherwise
   */
  const isTokenExpired = useCallback((jwtToken) => {
    if (!jwtToken) return true;
    
    try {
      // JWT structure is header.payload.signature
      const payload = jwtToken.split('.')[1];
      // Base64 decode the payload
      const decodedPayload = JSON.parse(atob(payload));
      
      // The exp field contains the expiration timestamp in seconds
      const expirationTime = decodedPayload.exp * 1000; // Convert to milliseconds
      
      return Date.now() >= expirationTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // If there's an error, consider the token expired for safety
    }
  }, []);

  /**
   * Verify token and restore user session
   */
  const verifyToken = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('Token expired, logging out user');
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setError('Your session has expired. Please log in again.');
        setLoading(false);
        setInitialized(true);
        return;
      }

      // Validate token with the server
      try {
        const response = await authAPI.getCurrentUser();
        
        if (response.data.success) {
          console.log('Token valid, restoring user session');
          setUser(response.data.user);
          setError('');
        } else {
          // Something went wrong with the response
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setError('Authentication failed. Please log in again.');
        }
      } catch (apiError) {
        console.error('API error during token verification:', apiError);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setError(errorUtils.getErrorMessage(apiError));
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      // Clear invalid token
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setError('Authentication error. Please log in again.');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [token, isTokenExpired]);

  // Check token validity on mount
  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  // Handle session expiration events
  useEffect(() => {
    const handleAuthExpired = (event) => {
      console.log('Auth expired event received');
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setError(event.detail?.message || 'Your session has expired. Please log in again.');
    };
    
    window.addEventListener('auth:expired', handleAuthExpired);
    
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  /**
   * Login a user
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<boolean>} Success status
   */
  const login = async (username, password) => {
    try {
      setError(''); // Clear any previous errors
      setLoading(true);
      
      // Make API call to the server
      const response = await authAPI.login(username, password);
      
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        
        // Save token to localStorage
        localStorage.setItem('token', newToken);
        setToken(newToken);
        
        // Set user data
        setUser(userData);
        return true;
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(errorUtils.getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout the current user
   */
  const logout = async () => {
    try {
      // Call logout API if token exists
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Remove token and clear user regardless of API success
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setError('');
    }
  };

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<boolean>} Success status
   */
  const register = async (userData) => {
    try {
      setError(''); // Clear any previous errors
      setLoading(true);
      
      // Call register API
      const response = await authAPI.register(userData);
      
      if (response.data.success) {
        return true;
      } else {
        setError(response.data.message || 'Registration failed. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(errorUtils.getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Register a new admin user
   * @param {Object} userData - Admin registration data
   * @returns {Promise<boolean>} Success status
   */
  const registerAdmin = async (userData) => {
    try {
      setError(''); // Clear any previous errors
      setLoading(true);
      
      // Call admin register API
      const response = await authAPI.registerAdmin(userData);
      
      if (response.data.success) {
        return true;
      } else {
        setError(response.data.message || 'Admin registration failed. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Admin registration error:', error);
      setError(errorUtils.getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update current user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise<boolean>} Success status
   */
  const updateProfile = async (userData) => {
    try {
      setError(''); // Clear any previous errors
      setLoading(true);
      
      // Call update profile API
      const response = await authAPI.updateProfile(userData);
      
      if (response.data.success) {
        // Update user in state
        setUser(response.data.user);
        return true;
      } else {
        setError(response.data.message || 'Failed to update profile. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setError(errorUtils.getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Provide auth context values
  const value = {
    user,
    token,
    loading,
    error,
    initialized,
    login,
    logout,
    register,
    registerAdmin,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;