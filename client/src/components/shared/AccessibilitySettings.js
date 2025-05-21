// client/src/components/shared/AccessibilitySettings.js
import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

/**
 * Enhanced accessibility settings panel with smoky environment optimizations
 */
const AccessibilitySettings = () => {
  const { 
    highContrast, 
    fontSize, 
    reducedMotion,
    textDirection,
    toggleHighContrast, 
    changeFontSize,
    toggleReducedMotion 
  } = useTheme();
  
  const [expanded, setExpanded] = useState(false);
  
  // Toggle settings panel
  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };
  
  // Font size options with clear visual differences
  const fontSizeOptions = [
    { value: 'normal', label: 'A', className: 'text-base' },
    { value: 'large', label: 'A', className: 'text-lg' },
    { value: 'x-large', label: 'A', className: 'text-xl font-bold' }
  ];
  
  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Toggle button with improved visibility */}
      <Button
        onClick={toggleExpanded}
        variant="primary"
        rounded="full"
        className="w-12 h-12 flex items-center justify-center shadow-lg"
        ariaLabel="Toggle accessibility settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </Button>
      
      {/* Settings panel with enhanced styling */}
      {expanded && (
        <Card
          variant="elevated"
          className="absolute bottom-16 left-0 p-6 w-72 shadow-lg border border-gray-700 bg-surface-dark animate-slide-up z-50"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-text-light">Accessibility Settings</h3>
            <button 
              onClick={toggleExpanded}
              className="text-gray-400 hover:text-white focus:outline-none"
              aria-label="Close accessibility settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-6">
            {/* High contrast mode toggle with improved visibility */}
            <div className="bg-surface p-3 rounded-lg">
              <label htmlFor="high-contrast-toggle" className="flex items-center justify-between cursor-pointer">
                <div className="flex flex-col">
                  <span className="font-medium text-text-light">High Contrast Mode</span>
                  <span className="text-xs text-text-muted mt-1">For smoky environments</span>
                </div>
                <div className="relative ml-3">
                  <input
                    id="high-contrast-toggle"
                    type="checkbox"
                    className="sr-only"
                    checked={highContrast}
                    onChange={toggleHighContrast}
                  />
                  <div className={`w-12 h-6 rounded-full transition-colors ${
                    highContrast ? 'bg-primary' : 'bg-gray-600'
                  }`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    highContrast ? 'transform translate-x-6' : ''
                  }`}></div>
                </div>
              </label>
            </div>
            
            {/* Font size selector with improved visibility */}
            <div className="bg-surface p-3 rounded-lg">
              <label className="block text-text-light font-medium mb-3">Text Size</label>
              <div 
                className="flex space-x-2" 
                role="radiogroup" 
                aria-label="Select text size"
              >
                {fontSizeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => changeFontSize(option.value)}
                    className={`flex items-center justify-center w-full h-10 rounded ${
                      fontSize === option.value 
                        ? 'bg-primary text-white font-semibold' 
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
            
            {/* Reduced motion toggle */}
            <div className="bg-surface p-3 rounded-lg">
              <label htmlFor="reduced-motion-toggle" className="flex items-center justify-between cursor-pointer">
                <div className="flex flex-col">
                  <span className="font-medium text-text-light">Reduce Motion</span>
                  <span className="text-xs text-text-muted mt-1">Minimize animations</span>
                </div>
                <div className="relative ml-3">
                  <input
                    id="reduced-motion-toggle"
                    type="checkbox"
                    className="sr-only"
                    checked={reducedMotion}
                    onChange={toggleReducedMotion}
                  />
                  <div className={`w-12 h-6 rounded-full transition-colors ${
                    reducedMotion ? 'bg-primary' : 'bg-gray-600'
                  }`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    reducedMotion ? 'transform translate-x-6' : ''
                  }`}></div>
                </div>
              </label>
            </div>

            {/* Reset to defaults button */}
            <Button
              onClick={() => {
                changeFontSize('normal');
                if (highContrast) toggleHighContrast();
                if (reducedMotion) toggleReducedMotion();
              }}
              variant="secondary"
              size="sm"
              className="w-full mt-2"
            >
              Reset to Defaults
            </Button>
          </div>
          
          {/* Small note about settings persistence */}
          <p className="text-xs text-text-muted mt-4 text-center">
            Your accessibility settings will be remembered on this device.
          </p>
        </Card>
      )}
    </div>
  );
};

export default AccessibilitySettings;