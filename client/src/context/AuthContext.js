// client/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in based on token
    const verifyToken = async () => {
      if (token) {
        try {
          // In a real app, this would validate the token with the server
          // For now, we'll just create a mock user based on the token
          console.log('Token found, creating mock user');
          
          // Mock authentication logic
          const isAdmin = token.includes('admin');
          setUser({
            id: '1',
            username: isAdmin ? 'admin' : 'user',
            instrument: 'guitar',
            isAdmin
          });
        } catch (error) {
          console.error('Error verifying token:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (username, password) => {
    console.log('Login function called with:', username);
    
    try {
      // In a real app, this would be an API call to your server
      // For now, we'll just mock success for any username/password
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (username && password) {
        // Create token based on username (admin gets special token)
        const newToken = username.toLowerCase() === 'admin' 
          ? `admin-token-${Date.now()}`
          : `user-token-${Date.now()}`;
          
        // Save token to localStorage
        localStorage.setItem('token', newToken);
        setToken(newToken);
        
        // Create user object
        const newUser = {
          id: '1',
          username,
          instrument: 'guitar',
          isAdmin: username.toLowerCase() === 'admin'
        };
        
        setUser(newUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Remove token and clear user
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const register = async (userData) => {
    try {
      // In a real app, this would register the user with your server
      console.log('Registering user:', userData);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Provide auth context values
  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;