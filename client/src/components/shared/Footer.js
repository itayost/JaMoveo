// client/src/components/shared/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Footer = () => {
  const { highContrast } = useTheme();
  const currentYear = new Date().getFullYear();
  const version = process.env.REACT_APP_VERSION || '1.0.0';
  
  return (
    <footer className={`mt-auto py-4 border-t ${highContrast ? 'border-white' : 'border-gray-700'}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          {/* Version and copyright */}
          <div className="mb-4 md:mb-0 text-text-muted">
            <p>JaMoveo v{version} © {currentYear} Moveo</p>
            <p className="text-xs mt-1">A real-time collaborative music rehearsal application</p>
          </div>
          
          {/* Links */}
          <div className="flex flex-wrap gap-4 text-text-muted">
            <Link 
              to="/help" 
              className="hover:text-primary transition-colors"
            >
              Help
            </Link>
            <Link 
              to="/about" 
              className="hover:text-primary transition-colors"
            >
              About
            </Link>
            <a 
              href="https://github.com/your-username/jamoveo" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-primary transition-colors"
            >
              GitHub
            </a>
            <Link 
              to="/privacy" 
              className="hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link 
              to="/terms" 
              className="hover:text-primary transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;