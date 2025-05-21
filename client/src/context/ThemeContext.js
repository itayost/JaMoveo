// client/src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the theme context
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

/**
 * Theme provider component that manages accessibility and theme preferences
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const ThemeProvider = ({ children }) => {
  // Theme state
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('normal'); // 'normal', 'large', 'x-large'
  const [reducedMotion, setReducedMotion] = useState(false);
  const [theme, setTheme] = useState('dark'); // 'dark', 'light'
  const [textDirection, setTextDirection] = useState('ltr'); // 'ltr', 'rtl'
  
  // Toggle high contrast mode
  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('highContrast', newValue);
  };
  
  // Change font size
  const changeFontSize = (size) => {
    if (['normal', 'large', 'x-large'].includes(size)) {
      setFontSize(size);
      localStorage.setItem('fontSize', size);
    }
  };
  
  // Toggle reduced motion preference
  const toggleReducedMotion = () => {
    const newValue = !reducedMotion;
    setReducedMotion(newValue);
    localStorage.setItem('reducedMotion', newValue);
  };
  
  // Toggle theme between light and dark
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  // Change text direction
  const changeTextDirection = (direction) => {
    if (['ltr', 'rtl'].includes(direction)) {
      setTextDirection(direction);
      localStorage.setItem('textDirection', direction);
    }
  };
  
  // Detect and toggle RTL based on content language (e.g., Hebrew)
  const toggleTextDirectionForLanguage = (language) => {
    const direction = language === 'Hebrew' ? 'rtl' : 'ltr';
    changeTextDirection(direction);
  };
  
  // Get font size class based on the current setting
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large':
        return 'text-lg'; // 18px
      case 'x-large':
        return 'text-xl'; // 20px
      default:
        return 'text-base'; // 16px
    }
  };
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    const savedFontSize = localStorage.getItem('fontSize') || 'normal';
    const savedReducedMotion = localStorage.getItem('reducedMotion') === 'true';
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedTextDirection = localStorage.getItem('textDirection') || 'ltr';
    
    setHighContrast(savedHighContrast);
    setFontSize(savedFontSize);
    setReducedMotion(savedReducedMotion);
    setTheme(savedTheme);
    setTextDirection(savedTextDirection);
    
    // Check user's system preferences for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion && localStorage.getItem('reducedMotion') === null) {
      setReducedMotion(true);
    }
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
    
    // Apply reduced motion
    if (reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Apply theme
    if (theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    }
    
    // Apply text direction
    root.setAttribute('dir', textDirection);
    
  }, [highContrast, fontSize, reducedMotion, theme, textDirection]);
  
  // Context value to provide
  const value = {
    // State
    highContrast,
    fontSize,
    reducedMotion,
    theme,
    textDirection,
    
    // Methods
    toggleHighContrast,
    changeFontSize,
    toggleReducedMotion,
    toggleTheme,
    changeTextDirection,
    toggleTextDirectionForLanguage,
    getFontSizeClass
  };
  
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;