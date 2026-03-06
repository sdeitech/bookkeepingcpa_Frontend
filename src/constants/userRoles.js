/**
 * User Role Constants
 * Centralized role definitions for the application
 */

export const USER_ROLES = {
  ADMIN: '1',
  STAFF: '2',
  CLIENT: '3'
};

export const ROLE_NAMES = {
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.STAFF]: 'Staff',
  [USER_ROLES.CLIENT]: 'Client'
};

export const ROLE_HOME_PATHS = {
  [USER_ROLES.ADMIN]: '/admin',
  [USER_ROLES.STAFF]: '/staff',
  [USER_ROLES.CLIENT]: '/new-dashboard'
};

/**
 * Helper functions to check user roles
 */
export const isAdmin = (user) => user?.role_id === USER_ROLES.ADMIN;
export const isStaff = (user) => user?.role_id === USER_ROLES.STAFF;
export const isClient = (user) => user?.role_id === USER_ROLES.CLIENT;

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (user, roles) => {
  return roles.includes(user?.role_id);
};

/**
 * Check if user has admin or staff privileges
 */
export const isAdminOrStaff = (user) => {
  return hasAnyRole(user, [USER_ROLES.ADMIN, USER_ROLES.STAFF]);
};

/**
 * Get user role name
 */
export const getUserRoleName = (user) => {
  return ROLE_NAMES[user?.role_id] || 'Unknown';
};

/**
 * Get default home path for a user role
 */
export const getRoleHomePath = (user) => {
  return ROLE_HOME_PATHS[user?.role_id] || '/new-dashboard';
};
