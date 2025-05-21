// client/src/components/ui/Card.js
import React from 'react';

/**
 * Simplified Card component with just the essential variants needed for JaMoveo
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.hover=false] - Whether to add hover effects
 */
const Card = ({ 
  children, 
  className = '',
  hover = false,
  ...props 
}) => {
  // Base styling for all cards
  const baseClasses = 'bg-surface rounded-lg overflow-hidden shadow p-4';
  
  // Optional hover effect
  const hoverClasses = hover ? 'hover:shadow-lg hover:transform hover:-translate-y-1 transition-all duration-200' : '';

  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Title component for consistent heading styling
 */
const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 
      className={`text-lg font-semibold text-text-light mb-3 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

// Add display name
Card.displayName = 'Card';
CardTitle.displayName = 'Card.Title';

// Attach CardTitle to Card
Card.Title = CardTitle;

export default Card;