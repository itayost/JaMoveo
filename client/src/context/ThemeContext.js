// client/src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('normal'); // 'normal', 'large', 'x-large'
  
  // Toggle high contrast mode
  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
    localStorage.setItem('highContrast', !highContrast);
  };
  
  // Change font size
  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
  };
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    const savedFontSize = localStorage.getItem('fontSize') || 'normal';
    
    setHighContrast(savedHighContrast);
    setFontSize(savedFontSize);
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
    
    // Apply font size
    root.classList.remove('text-normal', 'text-large', 'text-x-large');
    root.classList.add(`text-${fontSize}`);
  }, [highContrast, fontSize]);
  
  const value = {
    highContrast,
    fontSize,
    toggleHighContrast,
    changeFontSize
  };
  
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;