import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { USER_ROLES } from '../../constants/userRoles';

const RoleGuard = ({ 
  children, 
  allowedRoles = [], // Array of role IDs that can access this route
  fallbackPath = '/dashboard'
}) => {
  const user = useSelector(selectCurrentUser);
  
  // If no roles specified, allow access (open route)
  if (allowedRoles.length === 0) {
    return children;
  }
  
  // Check if user's role_id is in the allowed roles array
  const hasAccess = allowedRoles.includes(user?.role_id);
  
  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default RoleGuard;

// Usage examples:
// <RoleGuard allowedRoles={[USER_ROLES.ADMIN]}> - Admin only
// <RoleGuard allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.STAFF]}> - Admin or Staff
// <RoleGuard allowedRoles={[USER_ROLES.CLIENT]}> - Client only