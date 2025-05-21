// client/src/components/ui/Input.js
import React from 'react';

/**
 * Apple-inspired Input component
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
 * @param {boolean} [props.required=false] - Whether input is required
 * @param {string} [props.dir] - Text direction for RTL support
 * @param {string} [props.className=''] - Additional CSS classes
 */
const Input = ({ 
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  required = false,
  dir,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4">
      {/* Label */}
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-text-light mb-2"
          dir={dir}
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      {/* Input element */}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full p-3 rounded-ios
          bg-surface border 
          ${error ? 'border-error focus:ring-2 focus:ring-error focus:border-error' : 'border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary'} 
          text-text-light
          focus:outline-none
          transition duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        required={required}
        dir={dir}
        {...props}
      />
      
      {/* Error message */}
      {error && (
        <p className="mt-1 text-error text-sm" dir={dir}>
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Text Area component that extends Input functionality
 */
const TextArea = ({ 
  rows = 4,
  ...props
}) => {
  return (
    <div className="mb-4">
      {/* Label */}
      {props.label && (
        <label 
          htmlFor={props.id} 
          className="block text-sm font-medium text-text-light mb-2"
          dir={props.dir}
        >
          {props.label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      {/* Textarea element */}
      <textarea
        id={props.id}
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        disabled={props.disabled}
        rows={rows}
        className={`
          w-full p-3 rounded-ios resize-y
          bg-surface border 
          ${props.error ? 'border-error focus:ring-2 focus:ring-error focus:border-error' : 'border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary'} 
          text-text-light
          focus:outline-none
          transition duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${props.className || ''}
        `}
        aria-invalid={props.error ? 'true' : 'false'}
        required={props.required}
        dir={props.dir}
      />
      
      {/* Error message */}
      {props.error && (
        <p className="mt-1 text-error text-sm" dir={props.dir}>
          {props.error}
        </p>
      )}
    </div>
  );
};

/**
 * SearchInput component with iOS-like design
 */
const SearchInput = ({
  value,
  onChange,
  placeholder = "Search",
  onClear,
  className = "",
  ...props
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full pl-10 pr-10 py-3 rounded-ios-full
          bg-surface border border-gray-700
          text-text-light placeholder-text-muted
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
          transition duration-200
        `}
        {...props}
      />
      
      {value && onClear && (
        <button 
          type="button" 
          onClick={onClear}
          className="absolute inset-y-0 right-3 flex items-center text-text-muted hover:text-text-light"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

// Add as properties to Input
Input.TextArea = TextArea;
Input.Search = SearchInput;

export default Input;