// client/src/components/ui/Button.js
import React from 'react';

/**
 * Apple-inspired Button component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} [props.type='button'] - Button type (button, submit, reset)
 * @param {string} [props.variant='primary'] - Visual style variant (primary, secondary, danger, success)
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.loading=false] - Loading state
 * @param {string} [props.size='md'] - Button size (sm, md, lg)
 * @param {string} [props.className=''] - Additional CSS classes
 */
const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  size = 'md',
  className = '',
  ...props
}) => {
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark',
    secondary: 'bg-surface-light/10 text-primary border border-gray-700 hover:bg-surface-light/20 active:bg-surface-light/30',
    danger: 'bg-error text-white hover:bg-error-dark active:bg-error-dark',
    success: 'bg-success text-white hover:bg-success-dark active:bg-success-dark',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'bg-transparent text-primary hover:bg-surface-light/10',
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5 rounded-ios',
    md: 'px-4 py-2 rounded-ios',
    lg: 'text-lg px-6 py-3 rounded-ios',
    icon: 'p-2 rounded-full',
    full: 'w-full px-4 py-3 rounded-ios text-base font-medium',
  };
  
  // Common classes for all buttons
  const baseClasses = 'relative flex items-center justify-center font-medium transition-all duration-200 focus:outline-none';
  
  // State classes
  const stateClasses = disabled || loading ? 'opacity-50 pointer-events-none' : 'active:scale-[0.98]';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses} 
        ${variantClasses[variant] || variantClasses.primary} 
        ${sizeClasses[size] || sizeClasses.md} 
        ${stateClasses}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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