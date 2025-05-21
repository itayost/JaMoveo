// client/src/pages/auth/Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, error: authError, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get return path from location state (if available)
  const from = location.state?.from || (user?.isAdmin ? '/admin' : '/player');

  // Handle auth errors
  useEffect(() => {
    if (authError) {
      setLoginError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setLoginError('Please enter both username and password');
      return;
    }
    
    try {
      setLoading(true);
      setLoginError('');
      
      const success = await login(username, password);
      
      if (success) {
        // Navigate to appropriate page after login
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-center text-text-light mb-6">JaMoveo</h1>
        <h2 className="text-xl font-semibold text-center text-text-light mb-6">Log In</h2>
        
        {loginError && (
          <div className="bg-error bg-opacity-20 text-error p-3 rounded mb-4">
            {loginError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <Input
            id="username"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            disabled={loading}
          />
          
          <Input
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={loading}
            autoComplete="current-password"
          />
          
          <Button
            type="submit"
            variant="primary"
            size="full"
            disabled={loading}
            loading={loading}
            className="mt-6"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;