import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser, selectIsOnboardingCompleted } from '../../features/auth/authSlice';
import { isClient } from '../../constants/userRoles';

const PublicRoute = ({ 
  children, 
  redirectTo = null 
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const isOnboardingCompleted = useSelector(selectIsOnboardingCompleted);
  
  if (isAuthenticated) {
    // Determine where to redirect based on user state
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    
    // Default redirect logic
    if (isClient(user) && !isOnboardingCompleted) {
      return <Navigate to="/onboarding" replace />;
    }
    
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default PublicRoute;