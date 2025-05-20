// client/src/components/common/RoleBasedContent.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Component to conditionally render content based on user role
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.adminContent - Content for admin users
 * @param {React.ReactNode} props.defaultContent - Default content for non-admin users
 * @param {Object} props.roleContent - Object mapping roles to content
 * @param {React.ReactNode} props.fallback - Fallback when user has no matching role
 * @returns {React.ReactNode}
 */
const RoleBasedContent = ({ 
  adminContent,
  defaultContent,
  roleContent = {},
  fallback = null
}) => {
  const { user } = useAuth();

  if (!user) {
    return fallback;
  }

  // Admin override
  if (user.isAdmin && adminContent) {
    return adminContent;
  }

  // Role-specific content
  if (roleContent[user.instrument]) {
    return roleContent[user.instrument];
  }

  // Default content
  return defaultContent || fallback;
};

export default RoleBasedContent;