import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetOnboardingStatusQuery } from '../../features/onboarding/onboardingApi';
import { markCompleted } from '../../features/onboarding/onboardingSlice';

/**
 * Route guard for onboarding pages
 * Prevents access to onboarding if already completed
 */
const OnboardingRouteGuard = ({ children }) => {
  const dispatch = useDispatch();
  
  // Refetch on mount to ensure fresh status
  const { data: onboardingStatus, isLoading, error, refetch } = useGetOnboardingStatusQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true
    }
  );
  
  useEffect(() => {
    // Force refetch when component mounts to ensure fresh data
    refetch();
  }, [refetch]);
  
  // Sync Redux state with API status
  useEffect(() => {
    if (onboardingStatus && onboardingStatus.completed) {
      // Update Redux state to match API status
      dispatch(markCompleted());
    }
  }, [onboardingStatus, dispatch]);

  // Show loading state while checking status
  if (isLoading) {
    return (
      <div className="onboarding-loading">
        <div className="spinner"></div>
        <p>Checking onboarding status...</p>
      </div>
    );
  }

  // If there's an error fetching status, allow access (fail open)
  // This prevents blocking users if the API is temporarily unavailable
  if (error) {
    return children;
  }

  // If onboarding is already completed, redirect to pricing/dashboard
  if (onboardingStatus && onboardingStatus.completed) {
    // Clear any leftover localStorage data
    localStorage.removeItem('onboarding_progress');
    localStorage.removeItem('onboarding_backup');
    
    // Redirect to appropriate page
    return <Navigate to="/pricing" replace />;
  }

  // User hasn't completed onboarding, allow access
  return children;
};

export default OnboardingRouteGuard;