import { createSlice } from '@reduxjs/toolkit';

// Get initial state from localStorage with proper validation
const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');

// Parse user data safely
let userData = null;
let validToken = null;

if (userStr && userStr !== 'undefined' && userStr !== 'null') {
  try {
    userData = JSON.parse(userStr);
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
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set credentials after successful login/signup
    setCredentials: (state, action) => {
      const { user, token } = action.payload.data;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    
    // Logout action
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
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

export const { setCredentials, logout, setLoading, setError, clearError } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;