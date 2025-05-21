// client/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to check if a token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      // JWT structure is header.payload.signature
      const payload = token.split('.')[1];
      // Base64 decode the payload
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedData = JSON.parse(
        decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
      );
      
      // The exp field contains the expiration timestamp in seconds
      const expirationTime = decodedData.exp * 1000; // Convert to milliseconds
      
      return Date.now() >= expirationTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // If there's an error, consider the token expired for safety
    }
  };

  useEffect(() => {
    // Check if user is already logged in based on token
    const verifyToken = async () => {
      if (token) {
        try {
          // Check if token is expired
          if (isTokenExpired(token)) {
            console.log('Token expired, logging out user');
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setError('Your session has expired. Please log in again.');
          } else {
            // Validate token with the server
            try {
              const response = await axios.get(`${API_URL}/auth/me`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              if (response.data.success) {
                console.log('Token valid, restoring user session');
                setUser(response.data.user);
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
              setError('Authentication failed. Please log in again.');
            }
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setError('Authentication error. Please log in again.');
        }
      }
      
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (username, password) => {
    console.log('Login function called with:', username);
    
    try {
      setError(''); // Clear any previous errors
      
      // Make API call to the server
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      });
      
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
      setError(
        error.response?.data?.message || 
        'An error occurred during login. Please try again.'
      );
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call logout API if token exists
      if (token) {
        await axios.post(
          `${API_URL}/auth/logout`, 
          {}, 
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Remove token and clear user regardless of API success
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  const register = async (userData) => {
    try {
      setError(''); // Clear any previous errors
      
      // Call register API
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      if (response.data.success) {
        return true;
      } else {
        setError(response.data.message || 'Registration failed. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(
        error.response?.data?.message || 
        'An error occurred during registration. Please try again.'
      );
      return false;
    }
  };
  
  const registerAdmin = async (userData) => {
    try {
      setError(''); // Clear any previous errors
      
      // Call admin register API
      const response = await axios.post(`${API_URL}/auth/admin-register`, userData);
      
      if (response.data.success) {
        return true;
      } else {
        setError(response.data.message || 'Admin registration failed. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Admin registration error:', error);
      setError(
        error.response?.data?.message || 
        'An error occurred during admin registration. Please try again.'
      );
      return false;
    }
  };

  // Provide auth context values
  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    register,
    registerAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;