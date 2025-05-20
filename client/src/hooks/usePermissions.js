// client/src/hooks/usePermissions.js
import { useAuth } from '../context/AuthContext';

/**
 * Hook for checking user permissions
 */
export const usePermissions = () => {
  const { user } = useAuth();

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!user;

  /**
   * Check if user is an admin
   */
  const isAdmin = user?.isAdmin || false;

  /**
   * Check if user has a specific role
   * @param {string|string[]} roles - Role(s) to check
   * @returns {boolean}
   */
  const hasRole = (roles) => {
    if (!user) return false;
    
    const rolesToCheck = Array.isArray(roles) ? roles : [roles];
    
    // Admin override
    if (user.isAdmin && rolesToCheck.includes('admin')) {
      return true;
    }
    
    return rolesToCheck.includes(user.instrument);
  };

  /**
   * Check if user can perform a specific action
   * @param {string} action - Action to check
   * @param {Object} resource - Resource the action is performed on
   * @returns {boolean}
   */
  const can = (action, resource) => {
    if (!user) return false;
    
    // Admin can do anything
    if (user.isAdmin) return true;
    
    // Action-specific checks
    switch (action) {
      case 'view':
        // Anyone can view resources
        return true;
        
      case 'edit':
      case 'delete':
        // Only admins can edit/delete (handled by admin check above)
        return false;
        
      case 'join':
        // Anyone can join a session
        return true;
        
      case 'select_song':
        // Only admins can select songs (handled by admin check above)
        return false;
        
      case 'view_chords':
        // Vocalists don't see chords
        return user.instrument !== 'vocals';
        
      default:
        return false;
    }
  };

  return {
    isAuthenticated,
    isAdmin,
    hasRole,
    can
  };
};