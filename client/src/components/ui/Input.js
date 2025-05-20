// client/src/components/ui/Input.js
import React from 'react';

const Input = ({ 
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-gray-300 mb-2">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full p-3 rounded bg-gray-700 text-white border ${error ? 'border-error' : 'border-gray-600'} focus:outline-none focus:border-primary ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-error text-sm">{error}</p>
      )}
    </div>
  );
};

export default Input;