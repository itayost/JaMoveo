// client/src/components/shared/AccessibilitySettings.js
import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

const AccessibilitySettings = () => {
  const { highContrast, fontSize, toggleHighContrast, changeFontSize } = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  // Toggle settings panel
  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };
  
  // Font size options
  const fontSizeOptions = [
    { value: 'normal', label: 'A', className: 'text-base' },
    { value: 'large', label: 'A', className: 'text-lg' },
    { value: 'x-large', label: 'A', className: 'text-xl' }
  ];
  
  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Toggle button */}
      <Button
        onClick={toggleExpanded}
        variant="glass"
        rounded="full"
        className="w-12 h-12 flex items-center justify-center shadow-lg"
        ariaLabel="Toggle accessibility settings"
      >
        <span className="text-xl">⚙️</span>
      </Button>
      
      {/* Settings panel */}
      {expanded && (
        <Card className="absolute bottom-14 left-0 p-4 w-64 shadow-xl border border-gray-700 bg-surface">
          <h3 className="text-lg font-semibold mb-3 text-text-light">Accessibility</h3>
          
          <div className="space-y-4">
            {/* High contrast mode toggle */}
            <div>
              <label htmlFor="high-contrast-toggle" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    id="high-contrast-toggle"
                    type="checkbox"
                    className="sr-only"
                    checked={highContrast}
                    onChange={toggleHighContrast}
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${
                    highContrast ? 'bg-primary' : 'bg-gray-600'
                  }`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    highContrast ? 'transform translate-x-4' : ''
                  }`}></div>
                </div>
                <div className="ml-3 text-text-light">High Contrast Mode</div>
              </label>
              <p className="text-xs text-text-muted mt-1 ml-12">
                For better visibility in smoky environments
              </p>
            </div>
            
            {/* Font size selector */}
            <div>
              <label htmlFor="font-size-selector" className="block text-text-light mb-2">Text Size</label>
              <div id="font-size-selector" className="flex space-x-2" role="radiogroup" aria-label="Select text size">
                {fontSizeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => changeFontSize(option.value)}
                    className={`flex items-center justify-center w-12 h-8 rounded ${
                      fontSize === option.value 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-700 text-text-light hover:bg-gray-600'
                    } ${option.className}`}
                    aria-label={`Set text size to ${option.value}`}
                    role="radio"
                    aria-checked={fontSize === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Close button */}
            <Button
              onClick={toggleExpanded}
              variant="outline"
              size="sm"
              className="w-full mt-2"
            >
              Close
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AccessibilitySettings;