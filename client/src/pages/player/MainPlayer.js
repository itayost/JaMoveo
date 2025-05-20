// client/src/pages/player/MainPlayer.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import AccessibilitySettings from '../../components/shared/AccessibilitySettings';

const MainPlayer = () => {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const navigate = useNavigate();

  // Simulate connection status changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setConnectionStatus('connected');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-success text-white';
      case 'error':
        return 'bg-error text-white';
      default:
        return 'bg-warning text-white';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected to rehearsal';
      case 'error':
        return 'Connection error';
      default:
        return 'Connecting...';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-text-light mb-6 animate-fade-in">
          Waiting for next song
        </h1>
        
        <Card className="mb-8 p-6 animate-slide-up">
          <p className="text-xl text-gray-300 mb-4">
            The band leader will select a song soon
          </p>
          
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm ${getStatusColor()}`}>
            <span className={`w-3 h-3 rounded-full mr-2 ${connectionStatus === 'connecting' ? 'animate-pulse' : ''}`}></span>
            {getStatusText()}
          </div>
        </Card>
        
        {user && (
          <div className="text-text-muted">
            {user.username} • {user.instrument}
          </div>
        )}
      </div>
      
      <AccessibilitySettings />
    </div>
  );
};

export default MainPlayer;