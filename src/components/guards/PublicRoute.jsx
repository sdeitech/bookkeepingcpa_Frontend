import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../../features/auth/authSlice';
import { getRoleHomePath } from '../../constants/userRoles';

const PublicRoute = ({ 
  children, 
  redirectTo = null 
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  
  if (isAuthenticated) {
    // Determine where to redirect based on user state
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    
    // Default redirect logic (no onboarding check)
    return <Navigate to={getRoleHomePath(user)} replace />;
  }
  
  return children;
};

export default PublicRoute;
