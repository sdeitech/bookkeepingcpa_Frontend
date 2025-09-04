import { createSlice } from '@reduxjs/toolkit';
import { onboardingStorage } from '../../utils/onboardingStorage';

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
  hasUnsavedChanges: false,
  isLoadingFromStorage: false,
  storageError: null
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
    
    // Data update actions with localStorage sync
    updateBusinessNeeds: (state, action) => {
      state.data.businessNeeds = action.payload;
      state.hasUnsavedChanges = true;
      // Clear validation errors for this step
      delete state.validationErrors.businessNeeds;
      // Save to localStorage
      const savedData = {
        ...state.data,
        businessNeeds: action.payload,
        currentStep: state.currentStep
      };
      onboardingStorage.save(savedData);
      state.lastSavedAt = new Date().toISOString();
    },
    
    updatePreviousBookkeeper: (state, action) => {
      state.data.previousBookkeeper = action.payload;
      state.hasUnsavedChanges = true;
      delete state.validationErrors.previousBookkeeper;
      // Save to localStorage
      const savedData = {
        ...state.data,
        previousBookkeeper: action.payload,
        currentStep: state.currentStep
      };
      onboardingStorage.save(savedData);
      state.lastSavedAt = new Date().toISOString();
    },
    
    updateBusinessDetails: (state, action) => {
      state.data.businessDetails = {
        ...state.data.businessDetails,
        ...action.payload
      };
      state.hasUnsavedChanges = true;
      delete state.validationErrors.businessDetails;
      // Save to localStorage
      const savedData = {
        ...state.data,
        businessDetails: state.data.businessDetails,
        currentStep: state.currentStep
      };
      onboardingStorage.save(savedData);
      state.lastSavedAt = new Date().toISOString();
    },
    
    updateIndustry: (state, action) => {
      state.data.industry = action.payload;
      state.hasUnsavedChanges = true;
      delete state.validationErrors.industry;
      // Save to localStorage
      const savedData = {
        ...state.data,
        industry: action.payload,
        currentStep: state.currentStep
      };
      onboardingStorage.save(savedData);
      state.lastSavedAt = new Date().toISOString();
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
    
    // Reset action with localStorage clear
    resetOnboarding: () => {
      onboardingStorage.clear();
      return initialState;
    },
    
    // Load saved data from API (for initial check)
    loadOnboardingData: (state, action) => {
      const savedData = action.payload;
      if (savedData) {
        state.data = savedData.data || state.data;
        state.currentStep = savedData.currentStep || 1;
        state.completed = savedData.completed || false;
        state.lastSavedAt = savedData.lastSavedAt;
        state.hasUnsavedChanges = false;
      }
    },
    
    // Load data from localStorage
    loadFromLocalStorage: (state) => {
      state.isLoadingFromStorage = true;
      state.storageError = null;
      
      try {
        const storedData = onboardingStorage.get();
        if (storedData) {
          state.data = {
            businessNeeds: storedData.businessNeeds || null,
            previousBookkeeper: storedData.previousBookkeeper || null,
            businessDetails: storedData.businessDetails || initialState.data.businessDetails,
            industry: storedData.industry || null
          };
          state.currentStep = storedData.currentStep || 1;
          state.lastSavedAt = onboardingStorage.getLastSaved();
          state.hasUnsavedChanges = false;
        }
      } catch (error) {
        state.storageError = error.message;
        console.error('Failed to load from localStorage:', error);
      } finally {
        state.isLoadingFromStorage = false;
      }
    },
    
    // Save current state to localStorage
    saveToLocalStorage: (state) => {
      try {
        const dataToSave = {
          ...state.data,
          currentStep: state.currentStep
        };
        const success = onboardingStorage.save(dataToSave);
        if (success) {
          state.lastSavedAt = new Date().toISOString();
          state.hasUnsavedChanges = false;
        }
      } catch (error) {
        state.storageError = error.message;
        console.error('Failed to save to localStorage:', error);
      }
    },
    
    // Clear localStorage data
    clearLocalStorage: (state) => {
      onboardingStorage.clear();
      state.lastSavedAt = null;
      state.hasUnsavedChanges = false;
    },
    
    // Set storage error
    setStorageError: (state, action) => {
      state.storageError = action.payload;
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
  loadOnboardingData,
  loadFromLocalStorage,
  saveToLocalStorage,
  clearLocalStorage,
  setStorageError
} = onboardingSlice.actions;

// Selectors
export const selectCurrentStep = (state) => state.onboarding.currentStep;
export const selectTotalSteps = (state) => state.onboarding.totalSteps;
export const selectOnboardingData = (state) => state.onboarding.data;
export const selectIsOnboardingCompleted = (state) => state.onboarding.completed;
export const selectValidationErrors = (state) => state.onboarding.validationErrors;
export const selectIsSubmitting = (state) => state.onboarding.isSubmitting;
export const selectHasUnsavedChanges = (state) => state.onboarding.hasUnsavedChanges;
export const selectIsLoadingFromStorage = (state) => state.onboarding.isLoadingFromStorage;
export const selectStorageError = (state) => state.onboarding.storageError;

// Export reducer
export default onboardingSlice.reducer;