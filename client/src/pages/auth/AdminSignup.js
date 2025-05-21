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
      <Card className="max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-center text-text-light mb-6">JaMoveo</h1>
        <h2 className="text-xl font-semibold text-center text-text-light mb-6">Admin Sign Up</h2>
        
        {error && (
          <div className="bg-error bg-opacity-20 text-error p-3 rounded mb-4">
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
            autoComplete="current-password"
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
          />
          
          <Button
            type="submit"
            variant="primary"
            size="full"
            disabled={loading}
            loading={loading}
            className="mt-6"
          >
            {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Not an admin?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Regular Sign Up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AdminSignup;