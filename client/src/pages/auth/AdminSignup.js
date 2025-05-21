// client/src/pages/auth/AdminSignup.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    adminCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { registerAdmin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate admin code
    if (!formData.adminCode) {
      setError('Please enter the admin registration code');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Only send required fields to API
      const registrationData = {
        username: formData.username,
        password: formData.password,
        adminCode: formData.adminCode
      };
      
      const success = await registerAdmin(registrationData);
      
      if (success) {
        // Registration successful, redirect to login
        navigate('/login', { 
          state: { 
            message: 'Admin registration successful! Please log in.' 
          } 
        });
      }
    } catch (err) {
      console.error('Admin registration error:', err);
      setError('An error occurred during admin registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Sign Up</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-error/20 text-error rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <Input
              id="username"
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              disabled={loading}
              required
              className="mb-4"
            />
            
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Choose a password"
              disabled={loading}
              required
              className="mb-4"
              autoComplete="new-password"
            />
            
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={loading}
              required
              className="mb-4"
            />
            
            <Input
              id="adminCode"
              name="adminCode"
              label="Admin Registration Code"
              value={formData.adminCode}
              onChange={handleChange}
              placeholder="Enter the admin code"
              disabled={loading}
              required
              className="mb-6"
            />
            
            <Button
              type="submit"
              variant="primary"
              size="full"
              disabled={loading}
              loading={loading}
              className="mb-4"
            >
              {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-gray-400">
              Not an admin?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Regular Sign Up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminSignup;