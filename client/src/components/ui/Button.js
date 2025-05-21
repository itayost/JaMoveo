// client/src/components/ui/Button.js
import React from 'react';

/**
 * Simplified Button component with just the essential variants needed for JaMoveo
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} [props.type='button'] - Button type (button, submit, reset)
 * @param {string} [props.variant='primary'] - Visual style variant (primary, secondary, danger)
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.loading=false] - Loading state
 * @param {string} [props.className=''] - Additional CSS classes
 */
const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  // Simplified variant classes
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600',
    danger: 'bg-error text-white hover:bg-error-dark'
  };
  
  // Common classes for all buttons
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50';
  
  // State classes
  const stateClasses = disabled || loading ? 'opacity-60 cursor-not-allowed pointer-events-none' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses} 
        ${variantClasses[variant] || variantClasses.primary} 
        ${stateClasses}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;