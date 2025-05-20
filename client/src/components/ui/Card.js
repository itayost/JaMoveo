// client/src/components/ui/Card.js
import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-surface p-4 rounded-lg shadow ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;