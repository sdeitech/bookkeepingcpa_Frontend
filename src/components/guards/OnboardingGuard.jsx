import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsOnboardingCompleted } from '../../features/auth/authSlice';
import { isClient } from '../../constants/userRoles';

const OnboardingGuard = ({ 
  children, 
  requireIncomplete = false,
  redirectTo = '/onboarding' 
}) => {
  const user = useSelector(selectCurrentUser);
  const isOnboardingCompleted = useSelector(selectIsOnboardingCompleted);

  // Only applies to clients
  if (!isClient(user)) {
    return children;
  }

  // If onboarding is required to be incomplete (for /onboarding route)
  if (requireIncomplete && isOnboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  // If onboarding needs to be complete (for dashboard routes)
  if (!requireIncomplete && !isOnboardingCompleted) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default OnboardingGuard;