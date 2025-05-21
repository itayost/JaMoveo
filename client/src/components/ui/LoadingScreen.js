// client/src/components/ui/LoadingScreen.js
import React from 'react';

/**
 * Loading screen component for full-page loading states
 * 
 * @param {Object} props
 * @param {string} props.message - Optional message to display during loading
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactNode}
 */
const LoadingScreen = ({ 
  message = 'Loading...', 
  className = '' 
}) => {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-background ${className}`}>
      <div className="flex flex-col items-center">
        {/* Spinner animation */}
        <div className="w-16 h-16 mb-4">
          <svg 
            className="animate-spin w-full h-full text-primary" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        
        {/* Loading message */}
        <p className="text-xl text-text-light">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;