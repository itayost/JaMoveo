// client/src/components/shared/SessionExpired.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';

const SessionExpired = ({ onClose }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Session Expired</h2>
        
        <p className="mb-6 text-text-muted">
          Your session has expired. Please log in again to continue.
        </p>
        
        <Button 
          onClick={handleLogin}
          variant="primary"
          size="lg"
          className="w-full"
        >
          Log In Again
        </Button>
      </Card>
    </div>
  );
};

export default SessionExpired;