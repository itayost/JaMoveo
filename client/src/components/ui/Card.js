// client/src/components/ui/Card.js
import React from 'react';

/**
 * Apple-inspired Card component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.hover=false] - Whether to add hover effects
 * @param {boolean} [props.interactive=false] - Whether the card is interactive (clickable)
 * @param {string} [props.padding='p-4'] - Padding size class
 */
const Card = ({ 
  children, 
  className = '',
  hover = false,
  interactive = false,
  padding = 'p-4',
  ...props 
}) => {
  // Base styling for all cards
  const baseClasses = 'bg-surface rounded-ios-lg overflow-hidden shadow-ios backdrop-blur-sm';
  
  // Optional hover effect
  const hoverClasses = hover 
    ? 'transition-all duration-300 hover:shadow-ios-lg hover:scale-[1.02]' 
    : '';
  
  // Interactive card styles
  const interactiveClasses = interactive 
    ? 'cursor-pointer transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50' 
    : '';

  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${interactiveClasses} ${padding} ${className}`}
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

/**
 * Card Footer component - typically used for actions
 */
const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`mt-4 pt-3 border-t border-gray-700/50 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Image component for consistent image styling
 */
const CardImage = ({ src, alt, className = '', ...props }) => {
  return (
    <div className="w-full overflow-hidden">
      <img 
        src={src} 
        alt={alt || ''}
        className={`w-full h-full object-cover ${className}`}
        {...props}
      />
    </div>
  );
};

/**
 * Card Content component for padding and spacing
 */
const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Add display names
Card.displayName = 'Card';
CardTitle.displayName = 'Card.Title';
CardFooter.displayName = 'Card.Footer';
CardImage.displayName = 'Card.Image';
CardContent.displayName = 'Card.Content';

// Attach subcomponents to Card
Card.Title = CardTitle;
Card.Footer = CardFooter;
Card.Image = CardImage;
Card.Content = CardContent;

export default Card;