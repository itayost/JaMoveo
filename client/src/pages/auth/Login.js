// client/src/pages/auth/Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Login = () => {
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Auth context
  const { login, error: authError, user } = useAuth();
  
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
      setError(authError);
    }
  }, [authError]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Attempt login
      const success = await login(username, password);
      
      if (success) {
        // Navigate to appropriate page after login
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Login to JaMoveo</h1>
          
          {/* Success message from previous action (e.g., registration) */}
          {successMessage && (
            <div className="mb-4 p-3 bg-success/20 text-success rounded">
              {successMessage}
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-error/20 text-error rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} noValidate>
            <Input
              id="username"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
              required
              className="mb-4"
            />
            
            <Input
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              required
              className="mb-6"
              autoComplete="current-password"
            />
            
            <Button
              type="submit"
              variant="primary"
              size="full"
              disabled={loading}
              loading={loading}
              className="mb-4"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-gray-400 mb-2">
              Dont have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Sign Up
              </Link>
            </p>
            <p className="text-gray-400">
              <Link to="/admin-signup" className="text-primary hover:underline">
                Admin Sign Up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;