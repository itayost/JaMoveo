// client/src/components/ui/Input.js
import React, { forwardRef } from 'react';

/**
 * Enhanced Input component with various states and features
 * 
 * @param {Object} props
 * @param {string} props.id - Input ID
 * @param {string} [props.label] - Input label text
 * @param {string} [props.type='text'] - Input type
 * @param {any} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.placeholder] - Placeholder text
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.error] - Error message
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props.size='md'] - Input size
 * @param {React.ReactNode} [props.icon] - Icon to display
 * @param {string} [props.iconPosition='left'] - Icon position
 * @param {string} [props.helperText] - Helper text below input
 * @param {boolean} [props.required=false] - Whether input is required
 * @param {string} [props.dir] - Text direction for RTL support
 */
const Input = forwardRef(({ 
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  className = '',
  size = 'md',
  icon,
  iconPosition = 'left',
  helperText,
  required = false,
  dir,
  ...props
}, ref) => {
  // Size classes
  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3',
    lg: 'p-4 text-lg'
  };
  
  // Direction classes
  const dirClasses = dir === 'rtl' ? 'text-right' : '';
  
  // Base input styles
  const inputClasses = `
    w-full
    bg-gray-700
    text-white
    border
    ${error ? 'border-error focus:border-error focus:ring-error' : 'border-gray-600 focus:border-primary focus:ring-primary'}
    rounded
    focus:outline-none
    focus:ring-1
    transition-colors
    duration-200
    disabled:opacity-50
    disabled:cursor-not-allowed
    ${icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : ''}
    ${sizeClasses[size] || sizeClasses.md}
    ${dirClasses}
    ${className}
  `;

  return (
    <div className="mb-4">
      {/* Label */}
      {label && (
        <label 
          htmlFor={id} 
          className={`block text-gray-300 mb-2 font-medium ${required ? 'required' : ''}`}
          dir={dir}
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      {/* Input container with icon support */}
      <div className="relative">
        {/* Icon on the left */}
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        
        {/* Input element */}
        <input
          ref={ref}
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          required={required}
          dir={dir}
          {...props}
        />
        
        {/* Icon on the right */}
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <p 
          id={`${id}-error`}
          className="mt-1 text-error text-sm"
          dir={dir}
        >
          {error}
        </p>
      )}
      
      {/* Helper text */}
      {helperText && !error && (
        <p 
          id={`${id}-helper`}
          className="mt-1 text-gray-400 text-sm"
          dir={dir}
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

// Add display name
Input.displayName = 'Input';

/**
 * Text Area component that extends Input functionality
 */
const TextArea = forwardRef(({ 
  rows = 4,
  className = '',
  ...props
}, ref) => {
  // Override type and add textarea-specific props
  return (
    <Input
      ref={ref}
      as="textarea"
      rows={rows}
      className={`resize-y ${className}`}
      {...props}
    />
  );
});

TextArea.displayName = 'Input.TextArea';

/**
 * Select component that extends Input functionality
 */
const Select = forwardRef(({ 
  children,
  className = '',
  ...props 
}, ref) => {
  return (
    <Input
      ref={ref}
      as="select"
      className={`appearance-none bg-gray-700 ${className}`}
      {...props}
    >
      {children}
    </Input>
  );
});

Select.displayName = 'Input.Select';

/**
 * Search Input with integrated search icon
 */
const SearchInput = forwardRef(({ 
  className = '',
  placeholder = 'Search...',
  ...props 
}, ref) => {
  // Search icon as SVG
  const searchIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );

  return (
    <Input
      ref={ref}
      icon={searchIcon}
      iconPosition="left"
      placeholder={placeholder}
      className={`pr-4 ${className}`}
      {...props}
    />
  );
});

SearchInput.displayName = 'Input.Search';

// Attach sub-components to Input
Input.TextArea = TextArea;
Input.Select = Select;
Input.Search = SearchInput;

export default Input;