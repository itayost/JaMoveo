// client/src/components/common/AdminOnly.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Component that only renders its children for admin users
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to show to admins
 * @param {React.ReactNode} props.fallback - Optional content to show to non-admins
 * @returns {React.ReactNode}
 */
const AdminOnly = ({ children, fallback = null }) => {
  const { user } = useAuth();

  if (user?.isAdmin) {
    return children;
  }

  return fallback;
};

export default AdminOnly;