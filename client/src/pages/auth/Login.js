// client/src/pages/auth/Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingIndicator from '../../components/ui/LoadingIndicator';

/**
 * Login page component
 * Handles user authentication
 */
const Login = () => {
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  
  // Auth context
  const { login, error: authError, user, loading: authLoading } = useAuth();
  
  // Router
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect destination - either from location state or based on user role
  const from = location.state?.from || (user?.isAdmin ? '/admin' : '/player');
  
  // Get any success message from navigation state (e.g., from successful registration)
  const successMessage = location.state?.message;
  
  // Sync auth context errors to component state
  useEffect(() => {
    if (authError) {
      setLoginError(authError);
    }
  }, [authError]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim()) {
      setLoginError('Username is required');
      return;
    }
    
    if (!password) {
      setLoginError('Password is required');
      return;
    }
    
    try {
      setLocalLoading(true);
      setLoginError('');
      
      // Attempt login
      const success = await login(username, password);
      
      if (success) {
        // Navigate to appropriate page after login
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('An error occurred during login. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };
  
  // Determine if we're in a loading state
  const isLoading = authLoading || localLoading;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-center text-text-light mb-6">JaMoveo</h1>
        <h2 className="text-xl font-semibold text-center text-text-light mb-6">Log In</h2>
        
        {/* Success message from previous action (e.g., registration) */}
        {successMessage && (
          <div className="bg-success bg-opacity-20 text-success p-3 rounded mb-4">
            {successMessage}
          </div>
        )}
        
        {/* Error message */}
        {loginError && (
          <div className="bg-error bg-opacity-20 text-error p-3 rounded mb-4">
            {loginError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} noValidate>
          <Input
            id="username"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            disabled={isLoading}
            required
          />
          
          <Input
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={isLoading}
            required
            autoComplete="current-password"
          />
          
          <Button
            type="submit"
            variant="primary"
            size="full"
            disabled={isLoading}
            loading={isLoading}
            className="mt-6"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign Up
            </Link>
          </p>
          <p className="text-gray-400 mt-2">
            <Link to="/admin-signup" className="text-primary hover:underline">
              Admin Sign Up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;