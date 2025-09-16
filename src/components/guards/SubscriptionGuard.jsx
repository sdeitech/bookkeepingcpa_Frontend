import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetUserSubscriptionQuery } from '../../features/subscription/subscriptionApi';
import { isClient } from '../../constants/userRoles';
import LoadingScreen from '../common/LoadingScreen';

const SubscriptionGuard = ({ 
  children, 
  redirectTo = '/pricing' 
}) => {
  const location = useLocation();
  const user = useSelector(selectCurrentUser);
  
  // Only check subscription for clients
  const shouldCheckSubscription = isClient(user);
  
  const { 
    data: subscription, 
    isLoading,
    error 
  } = useGetUserSubscriptionQuery(undefined, {
    skip: !shouldCheckSubscription
  });

  // Non-clients pass through
  if (!shouldCheckSubscription) {
    return children;
  }

  // Loading state
  if (isLoading) {
    return <LoadingScreen message="Checking subscription..." />;
  }

  // No active subscription
  if (!subscription?.data || subscription.data.status !== 'active') {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location.pathname,
          message: 'Please subscribe to access this feature' 
        }} 
        replace 
      />
    );
  }

  // Check if subscription needs attention
  if (subscription.data.status === 'past_due' || subscription.data.status === 'canceled') {
    return (
      <Navigate 
        to="/subscription" 
        state={{ 
          from: location.pathname,
          message: 'Your subscription needs attention. Please update your payment method.' 
        }} 
        replace 
      />
    );
  }

  return children;
};

export default SubscriptionGuard;