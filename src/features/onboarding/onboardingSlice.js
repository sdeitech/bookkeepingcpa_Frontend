import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentStep: 1,
  totalSteps: 4,
  completed: false,
  data: {
    // Step 1: Business Needs
    businessNeeds: null,
    
    // Step 2: Bookkeeper History
    previousBookkeeper: null,
    
    // Step 3: Business Details
    businessDetails: {
      businessName: '',
      businessType: '',
      yearStarted: '',
      employeeCount: '',
      monthlyRevenue: ''
    },
    
    // Step 4: Industry
    industry: null
  },
  validationErrors: {},
  isSubmitting: false,
  lastSavedAt: null,
  hasUnsavedChanges: false
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    // Navigation actions
    nextStep: (state) => {
      if (state.currentStep < state.totalSteps) {
        state.currentStep += 1;
        state.hasUnsavedChanges = true;
      }
    },
    
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    
    goToStep: (state, action) => {
      const step = action.payload;
      if (step >= 1 && step <= state.totalSteps) {
        console.log("Going to step:", step);
        state.currentStep = step;
      }
    },
    
    // Data update actions
    updateBusinessNeeds: (state, action) => {
      state.data.businessNeeds = action.payload;
      state.hasUnsavedChanges = true;
      // Clear validation errors for this step
      delete state.validationErrors.businessNeeds;
    },
    
    updatePreviousBookkeeper: (state, action) => {
      state.data.previousBookkeeper = action.payload;
      state.hasUnsavedChanges = true;
      delete state.validationErrors.previousBookkeeper;
    },
    
    updateBusinessDetails: (state, action) => {
      state.data.businessDetails = {
        ...state.data.businessDetails,
        ...action.payload
      };
      state.hasUnsavedChanges = true;
      delete state.validationErrors.businessDetails;
    },
    
    updateIndustry: (state, action) => {
      state.data.industry = action.payload;
      state.hasUnsavedChanges = true;
      delete state.validationErrors.industry;
    },
    
    // Validation actions
    setValidationError: (state, action) => {
      const { step, error } = action.payload;
      state.validationErrors[step] = error;
    },
    
    clearValidationErrors: (state) => {
      state.validationErrors = {};
    },
    
    // Save/Submit actions
    setSubmitting: (state, action) => {
      state.isSubmitting = action.payload;
    },
    
    markSaved: (state) => {
      state.lastSavedAt = new Date().toISOString();
      state.hasUnsavedChanges = false;
    },
    
    markCompleted: (state) => {
      state.completed = true;
      state.hasUnsavedChanges = false;
    },
    
    // Reset action
    resetOnboarding: () => initialState,
    
    // Load saved data
    loadOnboardingData: (state, action) => {
      const savedData = action.payload;
      if (savedData) {
        state.data = savedData.data || state.data;
        state.currentStep = savedData.currentStep || 1;
        state.completed = savedData.completed || false;
        state.lastSavedAt = savedData.lastSavedAt;
        state.hasUnsavedChanges = false;
      }
    }
  }
});

// Export actions
export const {
  nextStep,
  previousStep,
  goToStep,
  updateBusinessNeeds,
  updatePreviousBookkeeper,
  updateBusinessDetails,
  updateIndustry,
  setValidationError,
  clearValidationErrors,
  setSubmitting,
  markSaved,
  markCompleted,
  resetOnboarding,
  loadOnboardingData
} = onboardingSlice.actions;

// Selectors
export const selectCurrentStep = (state) => state.onboarding.currentStep;
export const selectTotalSteps = (state) => state.onboarding.totalSteps;
export const selectOnboardingData = (state) => state.onboarding.data;
export const selectIsOnboardingCompleted = (state) => state.onboarding.completed;
export const selectValidationErrors = (state) => state.onboarding.validationErrors;
export const selectIsSubmitting = (state) => state.onboarding.isSubmitting;
export const selectHasUnsavedChanges = (state) => state.onboarding.hasUnsavedChanges;

// Export reducer
export default onboardingSlice.reducer;