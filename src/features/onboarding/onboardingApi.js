import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const onboardingApi = createApi({
  reducerPath: 'onboardingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'}/api`,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token || localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['OnboardingStatus', 'OnboardingData'],
  endpoints: (builder) => ({
    // Get onboarding status for current user
    getOnboardingStatus: builder.query({
      query: () => '/onboarding/status',
      providesTags: ['OnboardingStatus'],
    }),
    
    // Get saved onboarding data
    getOnboardingData: builder.query({
      query: () => '/onboarding/data',
      providesTags: ['OnboardingData'],
    }),
    
    // Save onboarding progress
    saveOnboardingProgress: builder.mutation({
      query: (data) => ({
        url: '/onboarding/save-progress',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['OnboardingData'],
    }),
    
    // Complete onboarding
    completeOnboarding: builder.mutation({
      query: (data) => ({
        url: '/onboarding/complete',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['OnboardingStatus', 'OnboardingData'],
    }),
    
    // Validate a specific step
    validateOnboardingStep: builder.mutation({
      query: ({ step, data }) => ({
        url: `/onboarding/validate-step/${step}`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetOnboardingStatusQuery,
  useGetOnboardingDataQuery,
  useSaveOnboardingProgressMutation,
  useCompleteOnboardingMutation,
  useValidateOnboardingStepMutation,
} = onboardingApi;