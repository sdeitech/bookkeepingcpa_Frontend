import { createSlice } from '@reduxjs/toolkit';

// Get initial state from localStorage with proper validation
const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');

// Parse user data safely
let userData = null;
let validToken = null;
let onboardingStatus = false;

if (userStr && userStr !== 'undefined' && userStr !== 'null') {
  try {
    userData = JSON.parse(userStr);
    // Extract onboarding status from stored user data
    onboardingStatus = userData?.onboarding_completed || false;
  } catch (e) {
    console.error('Failed to parse user data from localStorage:', e);
    localStorage.removeItem('user'); // Clean up invalid data
    localStorage.removeItem('token'); // Also remove token if user data is invalid
  }
}

// Only keep token if we also have valid user data
if (token && token !== 'undefined' && token !== 'null' && userData) {
  validToken = token;
} else {
  // Clean up if token or user is invalid
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

const initialState = {
  user: userData,
  token: validToken,
  isAuthenticated: !!(validToken && userData),
  onboardingCompleted: onboardingStatus, // Add onboarding status to auth state
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set credentials after successful login/signup
    setCredentials: (state, action) => {
      const { user, token } = action.payload.data || action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.onboardingCompleted = user?.onboarding_completed || false; // Get from response
      state.error = null;
      
      // Save to localStorage (including onboarding status)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    
    // Update only onboarding status (when onboarding is completed)
    updateOnboardingStatus: (state, action) => {
      state.onboardingCompleted = action.payload;
      if (state.user) {
        state.user.onboarding_completed = action.payload;
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    
    // Logout action
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.onboardingCompleted = false;
      state.error = null;
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setCredentials, 
  updateOnboardingStatus, 
  logout, 
  setLoading, 
  setError, 
  clearError 
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsOnboardingCompleted = (state) => state.auth.onboardingCompleted;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;