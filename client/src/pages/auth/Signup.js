// client/src/pages/auth/Signup.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    instrument: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
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
    
    // Validate instrument selection
    if (!formData.instrument) {
      setError('Please select your instrument');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Only send required fields to API
      const registrationData = {
        username: formData.username,
        password: formData.password,
        instrument: formData.instrument,
        otherInstrument: formData.instrument === 'other' ? formData.otherInstrument : undefined
      };
      
      const success = await register(registrationData);
      
      if (success) {
        // Registration successful, redirect to login
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please log in.' 
          } 
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-center text-text-light mb-6">JaMoveo</h1>
        <h2 className="text-xl font-semibold text-center text-text-light mb-6">Sign Up</h2>
        
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
          />
          
          <div className="mb-4">
            <label htmlFor="instrument" className="block text-gray-300 mb-2">
              I play...
            </label>
            <select
              id="instrument"
              name="instrument"
              value={formData.instrument}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-primary"
              disabled={loading}
              required
            >
              <option value="">Select your instrument</option>
              <option value="guitar">Guitar</option>
              <option value="bass">Bass</option>
              <option value="drums">Drums</option>
              <option value="vocals">Vocals</option>
              <option value="keyboard">Keyboard</option>
              <option value="saxophone">Saxophone</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {formData.instrument === 'other' && (
            <Input
              id="otherInstrument"
              name="otherInstrument"
              label="Specify Instrument"
              value={formData.otherInstrument || ''}
              onChange={handleChange}
              placeholder="What instrument do you play?"
              disabled={loading}
              required
            />
          )}
          
          <Button
            type="submit"
            variant="primary"
            size="full"
            disabled={loading}
            loading={loading}
            className="mt-6"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Signup;