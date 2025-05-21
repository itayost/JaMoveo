// client/src/components/ui/Button.js
import React from 'react';

/**
 * Enhanced Button component with consistent styling and variants
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} [props.type='button'] - Button type (button, submit, reset)
 * @param {string} [props.variant='primary'] - Visual style variant
 * @param {string} [props.size='md'] - Size variant
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.loading=false] - Loading state
 * @param {React.ReactNode} [props.iconLeft] - Icon to display on the left
 * @param {React.ReactNode} [props.iconRight] - Icon to display on the right
 * @param {string} [props.rounded='medium'] - Border radius style
 * @param {boolean} [props.fullWidth=false] - Whether to take full width
 * @param {string} [props.ariaLabel] - Accessibility label
 * @param {Object} props.rest - Additional props to spread
 */
const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  iconLeft,
  iconRight,
  rounded = 'medium',
  fullWidth = false,
  ariaLabel,
  ...props
}) => {
  // Base styling
  const baseClasses = 'font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 relative';
  
  // Variant styling (color schemes)
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary active:bg-primary-dark shadow-sm',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500 active:bg-gray-800 shadow-sm',
    accent: 'bg-accent text-secondary-dark hover:bg-accent-dark focus:ring-accent active:bg-accent-dark shadow-sm',
    danger: 'bg-error text-white hover:bg-error-dark focus:ring-error active:bg-error-dark shadow-sm',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary active:bg-primary-dark',
    ghost: 'bg-transparent text-primary hover:bg-primary/10 focus:ring-primary active:bg-primary/20',
    glass: 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20 focus:ring-white active:bg-white/30'
  };
  
  // Size variations
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
    full: 'w-full py-3'
  };
  
  // Border radius options
  const roundedClasses = {
    none: 'rounded-none',
    small: 'rounded',
    medium: 'rounded-md',
    large: 'rounded-lg',
    full: 'rounded-full'
  };
  
  // State classes
  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : '';
  const loadingClasses = loading ? 'cursor-wait' : '';
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses} 
        ${variantClasses[variant] || variantClasses.primary} 
        ${sizeClasses[size] || sizeClasses.md} 
        ${roundedClasses[rounded] || roundedClasses.medium} 
        ${disabledClasses} 
        ${loadingClasses}
        ${widthClass}
        select-none
        ${className}
      `}
      aria-label={ariaLabel || undefined}
      aria-busy={loading || undefined}
      {...props}
    >
      {/* Loading spinner with improved visibility */}
      {loading && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 block w-5 h-5">
          <svg className="animate-spin w-full h-full" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}
      
      {/* Button content with optional icons */}
      <span className={`flex items-center justify-center ${loading ? 'invisible' : ''}`}>
        {iconLeft && <span className="mr-2">{iconLeft}</span>}
        {children}
        {iconRight && <span className="ml-2">{iconRight}</span>}
      </span>
    </button>
  );
};

// Add display name for the Button component
Button.displayName = 'Button';

// Button Group component with improved styling
const ButtonGroup = ({ children, className = '', vertical = false, ...props }) => {
  return (
    <div 
      className={`inline-flex ${vertical ? 'flex-col' : 'flex-row'} ${className}`}
      role="group"
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        // Apply special styling for button groups
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            className: `
              ${child.props.className || ''}
              ${vertical ? 
                index === 0 ? 'rounded-b-none border-b-0' : 
                index === React.Children.count(children) - 1 ? 'rounded-t-none' : 'rounded-none border-y-0'
                : 
                index === 0 ? 'rounded-r-none border-r-0' : 
                index === React.Children.count(children) - 1 ? 'rounded-l-none' : 'rounded-none border-x-0'
              }
              ${index !== 0 && (vertical ? '-mt-px' : '-ml-px')}
            `
          });
        }
        return child;
      })}
    </div>
  );
};

// Add display name for the ButtonGroup component
ButtonGroup.displayName = 'Button.Group';

// Attach ButtonGroup to Button
Button.Group = ButtonGroup;

export default Button;