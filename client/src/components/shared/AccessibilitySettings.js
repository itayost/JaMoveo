// client/src/components/shared/AccessibilitySettings.js
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import Button from '../ui/Button';

const AccessibilitySettings = () => {
  const { highContrast, fontSize, toggleHighContrast, changeFontSize } = useTheme();
  
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-surface p-3 rounded-lg shadow-lg">
        <div className="flex flex-col space-y-2">
          <Button 
            onClick={toggleHighContrast}
            variant={highContrast ? 'accent' : 'secondary'}
            size="sm"
            className="flex items-center"
          >
            <span className="mr-2">🔆</span>
            {highContrast ? 'Normal Contrast' : 'High Contrast'}
          </Button>
          
          <div className="flex space-x-1">
            <button
              onClick={() => changeFontSize('normal')}
              className={`px-2 py-1 rounded ${fontSize === 'normal' ? 'bg-primary' : 'bg-gray-700'}`}
            >
              A
            </button>
            <button
              onClick={() => changeFontSize('large')}
              className={`px-2 py-1 rounded ${fontSize === 'large' ? 'bg-primary' : 'bg-gray-700'} text-lg`}
            >
              A
            </button>
            <button
              onClick={() => changeFontSize('x-large')}
              className={`px-2 py-1 rounded ${fontSize === 'x-large' ? 'bg-primary' : 'bg-gray-700'} text-xl`}
            >
              A
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySettings;