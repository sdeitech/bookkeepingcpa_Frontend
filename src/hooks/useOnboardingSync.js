import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetOnboardingStatusQuery } from '../features/onboarding/onboardingApi';
import { markCompleted } from '../features/onboarding/onboardingSlice';

/**
 * Hook to sync onboarding status from API to Redux state
 * This prevents state mismatches that cause redirect loops
 */
export const useOnboardingSync = () => {
  const dispatch = useDispatch();
  
  // Query onboarding status from API
  const { 
    data: onboardingStatus, 
    isLoading, 
    error 
  } = useGetOnboardingStatusQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true
  });
  
  useEffect(() => {
    // Sync Redux state with API status when data is available
    if (onboardingStatus && onboardingStatus.completed) {
      dispatch(markCompleted());
    }
  }, [onboardingStatus, dispatch]);
  
  return { 
    isLoading, 
    error, 
    isCompleted: onboardingStatus?.completed || false 
  };
};