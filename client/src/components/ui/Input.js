// client/src/components/ui/Input.js
import React from 'react';

/**
 * Simplified Input component with just the essential functionality needed for JaMoveo
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
          className="block text-gray-300 mb-2"
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
          w-full p-3 rounded 
          bg-gray-700 text-white border 
          ${error ? 'border-error' : 'border-gray-600'} 
          focus:outline-none focus:border-primary
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
          className="block text-gray-300 mb-2"
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
          w-full p-3 rounded resize-y
          bg-gray-700 text-white border 
          ${props.error ? 'border-error' : 'border-gray-600'} 
          focus:outline-none focus:border-primary
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

// Add TextArea as a property of Input
Input.TextArea = TextArea;

export default Input;