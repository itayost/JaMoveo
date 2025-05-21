import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the theme context
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

/**
 * Simplified Theme provider component
 */
export const ThemeProvider = ({ children }) => {
  // Only keep high contrast state
  const [highContrast, setHighContrast] = useState(false);
  
  // Toggle high contrast mode
  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('highContrast', newValue);
  };
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    setHighContrast(savedHighContrast);
  }, []);
  
  // Apply settings to document when they change
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply high contrast class
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [highContrast]);
  
  // Context value to provide
  const value = {
    // State
    highContrast,
    
    // Methods
    toggleHighContrast
  };
  
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;