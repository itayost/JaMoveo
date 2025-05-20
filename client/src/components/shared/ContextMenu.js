// client/src/components/common/ContextMenu.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Context menu with role-based options
 * 
 * @param {Object} props
 * @param {Object[]} props.options - Array of menu options
 * @param {string} props.options[].label - Option label
 * @param {Function} props.options[].action - Function to call when option is selected
 * @param {string[]} props.options[].roles - Roles that can see this option
 * @param {boolean} props.options[].adminOnly - Whether option is admin-only
 * @returns {React.ReactNode}
 */
const ContextMenu = ({ options, position, onClose }) => {
  const { user } = useAuth();

  // Filter options based on user role
  const filteredOptions = options.filter(option => {
    // Admin check
    if (option.adminOnly && !user?.isAdmin) {
      return false;
    }
    
    // Role check
    if (option.roles && option.roles.length > 0) {
      return option.roles.includes(user?.instrument) || 
             (user?.isAdmin && option.roles.includes('admin'));
    }
    
    return true;
  });

  if (filteredOptions.length === 0) {
    return null;
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      <div 
        className="absolute z-50 bg-surface rounded-lg shadow-lg py-1 overflow-hidden"
        style={{ 
          top: position.y, 
          left: position.x,
          minWidth: '160px'
        }}
      >
        {filteredOptions.map((option, index) => (
          <button
            key={index}
            className="w-full text-left px-4 py-2 hover:bg-gray-700 text-text-light"
            onClick={() => {
              option.action();
              onClose();
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </>
  );
};

export default ContextMenu;