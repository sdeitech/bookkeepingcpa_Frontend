import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { amazonApi } from '../features/amazon/amazonApi';
import { amazonSandboxApi } from '../features/amazon/amazonSandboxApi';
import { userApi } from '../features/user/userApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [amazonApi.reducerPath]: amazonApi.reducer,
    [amazonSandboxApi.reducerPath]: amazonSandboxApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      amazonApi.middleware,
      amazonSandboxApi.middleware,
      userApi.middleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
});