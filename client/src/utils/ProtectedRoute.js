// client/src/components/routing/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../ui/LoadingScreen';

/**
 * ProtectedRoute component to control access to routes based on user authentication and role
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if user has access
 * @param {boolean} [props.adminOnly=false] - Whether the route is admin-only
 * @param {Array} [props.allowedRoles=[]] - Specific roles allowed to access this route
 * @param {string} [props.redirectPath='/login'] - Where to redirect if access denied
 * @returns {React.ReactNode}
 */
const ProtectedRoute = ({ 
  children, 
  adminOnly = false, 
  allowedRoles = [], 
  redirectPath = '/login'
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading screen while auth state is being determined
  if (loading) {
    return <LoadingScreen message="Authenticating..." />;
  }

  // Not authenticated - redirect to login with return path
  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location.pathname }} replace />;
  }

  // Admin check
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Role check (if roles specified)
  if (allowedRoles.length > 0) {
    const hasAllowedRole = 
      allowedRoles.includes(user.instrument) || 
      (user.isAdmin && allowedRoles.includes('admin'));
    
    if (!hasAllowedRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User has access - render the children
  return children;
};

export default ProtectedRoute;