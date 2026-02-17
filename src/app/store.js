import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '../features/auth/authSlice';
import onboardingReducer from '../features/onboarding/onboardingSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import { authApi } from '../features/auth/authApi';
import { subscriptionApi } from '../features/subscription/subscriptionApi';
import { onboardingApi } from '../features/onboarding/onboardingApi';
import { amazonApi } from '../features/amazon/amazonApi';
import { amazonSandboxApi } from '../features/amazon/amazonSandboxApi';
import { userApi } from '../features/user/userApi';
import { notificationApi } from '../features/notifications/notificationApi';
import { shopifyApi } from '../features/shopify/shopifyApi';
import { documentApi } from '../features/document/documentApi';
import { quickbooksApi } from '../features/quickbooks/quickbooksApi';
import { questionnaireApi } from '../features/questionnaire/questionnaireApi';
import { tasksApi } from '@/features/tasks/tasksApi';

export const store = configureStore({
  reducer: {
    // Regular reducers
    auth: authReducer,
    onboarding: onboardingReducer,
    notifications: notificationReducer,

    // RTK Query reducers
    [authApi.reducerPath]: authApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
    [onboardingApi.reducerPath]: onboardingApi.reducer,
    [amazonApi.reducerPath]: amazonApi.reducer,
    [amazonSandboxApi.reducerPath]: amazonSandboxApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [shopifyApi.reducerPath]: shopifyApi.reducer,
    [documentApi.reducerPath]: documentApi.reducer,
    [quickbooksApi.reducerPath]: quickbooksApi.reducer,
    [questionnaireApi.reducerPath]: questionnaireApi.reducer,
    [tasksApi.reducerPath]: tasksApi.reducer,
   
  },

  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // serializableCheck: {
      //   // Ignore these action types
      //   ignoredActions: ['auth/setCredentials', 'onboarding/loadOnboardingData'],
      //   // Ignore these field paths in all actions
      //   ignoredActionPaths: ['payload.timestamp', 'payload.lastSavedAt'],
      //   // Ignore these paths in the state
      //   ignoredPaths: ['auth.user', 'onboarding.lastSavedAt'],
      // },
      serializableCheck: false,
    })
      .concat(authApi.middleware)
      .concat(subscriptionApi.middleware)
      .concat(onboardingApi.middleware)
      .concat(amazonApi.middleware)
      .concat(amazonSandboxApi.middleware)
      .concat(userApi.middleware)
      .concat(notificationApi.middleware)
      .concat(shopifyApi.middleware)
      .concat(documentApi.middleware)
      .concat(quickbooksApi.middleware)
      .concat(questionnaireApi.middleware)
      .concat(tasksApi.middleware),
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);

export default store;