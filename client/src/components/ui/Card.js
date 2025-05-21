// client/src/components/ui/Card.js
import React from 'react';

/**
 * Enhanced Card component with various styles and variants
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.variant='default'] - Card style variant
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.hover=false] - Whether to add hover effects
 * @param {boolean} [props.interactive=false] - Whether card is interactive (clickable)
 * @param {string} [props.as='div'] - Element type to render
 */
const Card = ({ 
  children, 
  variant = 'default',
  className = '',
  hover = false,
  interactive = false,
  as: Component = 'div',
  ...props 
}) => {
  // Base styling
  const baseClasses = 'rounded-lg overflow-hidden transition-all duration-200';
  
  // Variant classes
  const variantClasses = {
    default: 'bg-surface p-4 shadow',
    elevated: 'bg-surface-elevated p-4 shadow-md',
    bordered: 'bg-surface p-4 border border-gray-700',
    primary: 'bg-surface p-4 shadow border-l-4 border-primary',
    accent: 'bg-surface p-4 shadow border-l-4 border-accent',
    warning: 'bg-surface p-4 shadow border-l-4 border-warning',
    error: 'bg-surface p-4 shadow border-l-4 border-error',
    success: 'bg-surface p-4 shadow border-l-4 border-success',
    glass: 'bg-surface/30 backdrop-blur-md p-4 shadow-md'
  };
  
  // Hover effect classes
  const hoverClasses = hover ? 'hover:shadow-lg hover:transform hover:-translate-y-1' : '';
  
  // Interactive classes (for clickable cards)
  const interactiveClasses = interactive ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50' : '';

  return (
    <Component 
      className={`
        ${baseClasses} 
        ${variantClasses[variant] || variantClasses.default} 
        ${hoverClasses} 
        ${interactiveClasses}
        ${className}
      `}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    >
      {children}
    </Component>
  );
};

// Add sub-components for Card

/**
 * Card Header component
 */
const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`pb-3 mb-3 border-b border-gray-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Title component
 */
const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 
      className={`text-lg font-semibold text-text-light ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

/**
 * Card Content component
 */
const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Footer component
 */
const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`pt-3 mt-3 border-t border-gray-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Image component
 */
const CardImage = ({ src, alt = '', className = '', ...props }) => {
  return (
    <div className="card-image-container -mx-4 -mt-4 mb-4 overflow-hidden">
      <img 
        src={src} 
        alt={alt} 
        className={`w-full object-cover ${className}`}
        {...props}
      />
    </div>
  );
};

/**
 * Card Actions component for buttons and interactions
 */
const CardActions = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`flex flex-wrap items-center gap-2 pt-3 mt-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Add display names
Card.displayName = 'Card';
CardHeader.displayName = 'Card.Header';
CardTitle.displayName = 'Card.Title';
CardContent.displayName = 'Card.Content';
CardFooter.displayName = 'Card.Footer';
CardImage.displayName = 'Card.Image';
CardActions.displayName = 'Card.Actions';

// Attach sub-components to Card
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;
Card.Image = CardImage;
Card.Actions = CardActions;

export default Card;