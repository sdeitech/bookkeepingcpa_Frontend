/**
 * useOnboardingNavigation Hook
 * Custom hook for managing onboarding navigation and state
 * Encapsulates all navigation logic, validation, and data management
 */

import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  goToStep,
  setSubmitting,
  loadFromLocalStorage,
  clearLocalStorage,
  saveToLocalStorage,
  updateBusinessNeeds,
  updatePreviousBookkeeper,
  updateBusinessDetails,
  updateIndustry,
  markCompleted
} from '../../../features/onboarding/onboardingSlice';
import {
  useCompleteOnboardingMutation,
  useGetOnboardingDataQuery
} from '../../../features/onboarding/onboardingApi';
import { stepsConfig, getStepById } from '../config/stepsConfig';
import { validate, isAllDataValid } from '../config/validations';
import { onboardingStorage } from '../../../utils/onboardingStorage';

/**
 * Main hook for onboarding navigation
 * @returns {Object} Object containing navigation state and handlers
 */
const useOnboardingNavigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { 
    currentStep, 
    data, 
    isSubmitting, 
    isLoadingFromStorage,
    isCompleted 
  } = useSelector(state => state.onboarding);
  
  // RTK Query hooks
  const [completeOnboarding] = useCompleteOnboardingMutation();
  // Initialize onboarding record on backend (creates if doesn't exist)
  const { data: backendData, isLoading: isInitializing } = useGetOnboardingDataQuery();
  
  // Local state for validation errors
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Load data from localStorage on mount
  useEffect(() => {
    dispatch(loadFromLocalStorage());
  }, [dispatch]);
  
  // Log backend initialization
  useEffect(() => {
    if (backendData) {
      console.log('Onboarding record initialized on backend');
    }
  }, [backendData]);
  
  // Redirect if already completed
  useEffect(() => {
    if (isCompleted) {
      navigate('/pricing');
    }
  }, [isCompleted, navigate]);
  
  // Save to localStorage when data changes
  useEffect(() => {
    if (!isLoadingFromStorage && data) {
      dispatch(saveToLocalStorage());
    }
  }, [data, currentStep, dispatch, isLoadingFromStorage]);
  
  /**
   * Get the appropriate Redux action for updating a field
   * @param {string} stepType - Type of step being updated
   * @returns {Function} Redux action creator
   */
  const getUpdateAction = (stepType) => {
    const actionMap = {
      businessNeeds: updateBusinessNeeds,
      previousBookkeeper: updatePreviousBookkeeper,
      businessDetails: updateBusinessDetails,
      industry: updateIndustry
    };
    
    return actionMap[stepType];
  };
  
  /**
   * Validate current step data
   * @param {number} step - Step number to validate
   * @param {Object} overrideData - Optional data to validate instead of current Redux state
   * @returns {boolean} True if valid, false otherwise
   */
  const validateStep = useCallback((step, overrideData = null) => {
    const stepConfig = getStepById(step);
    if (!stepConfig) return false;
    
    const dataToValidate = overrideData || data[stepConfig.dataField];
    const errors = validate(stepConfig.validation, dataToValidate);
    
    if (errors) {
      // For object errors (like business details), set them directly
      // For string errors, wrap in object with field name as key
      if (typeof errors === 'object' && !Array.isArray(errors)) {
        setFieldErrors(errors);
      } else {
        setFieldErrors({ [stepConfig.dataField]: errors });
      }
      return false;
    }
    
    setFieldErrors({});
    return true;
  }, [data]);
  
  /**
   * Handle navigation to next step
   * @param {boolean} autoAdvance - Whether this is an automatic advance (from option click)
   * @param {Object} overrideData - Optional data to use for validation
   */
  const handleNext = useCallback(async (autoAdvance = false, overrideData = null) => {
    // Prevent navigation during submission
    if (isSubmitting) {
      return false;
    }
    
    // Validate current step
    if (!validateStep(currentStep, overrideData)) {
      // Don't show alert for auto-advance failures
      if (!autoAdvance && currentStep !== 3) {
        const stepConfig = getStepById(currentStep);
        alert(`Please complete the ${stepConfig.title.toLowerCase()} step before proceeding.`);
      }
      return false;
    }
    
    // Clear errors
    setFieldErrors({});
    
    // Check if this is the last step
    const isLastStep = currentStep === stepsConfig.length;
    
    if (isLastStep) {
      // Handle final submission
      dispatch(setSubmitting(true));
      
      try {
        // Get all data from localStorage for final submission
        const submissionData = onboardingStorage.getSubmissionData() || { data };
        
        console.log('Submitting onboarding data:', submissionData);
        const result = await completeOnboarding(submissionData).unwrap();
        console.log('Onboarding completion result:', result);
        
        if (result.success) {
          dispatch(markCompleted());
          dispatch(clearLocalStorage());
          navigate('/pricing');
          return true;
        } else {
          throw new Error(result.message || 'Failed to complete onboarding');
        }
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
        alert(`Failed to complete onboarding: ${error.message || 'Please try again.'}`);
        return false;
      } finally {
        dispatch(setSubmitting(false));
      }
    } else {
      // Move to next step
      dispatch(goToStep(currentStep + 1));
      return true;
    }
  }, [currentStep, isSubmitting, validateStep, data, dispatch, completeOnboarding, navigate]);
  
  /**
   * Handle navigation to previous step
   */
  const handleBack = useCallback(() => {
    if (currentStep > 1 && !isSubmitting) {
      dispatch(goToStep(currentStep - 1));
      setFieldErrors({});
    }
  }, [currentStep, isSubmitting, dispatch]);
  
  /**
   * Handle field value changes
   * @param {string} fieldName - Name of the field being updated
   * @param {*} value - New value for the field
   * @param {boolean} shouldAutoAdvance - Whether to auto-advance after update
   */
  const handleFieldChange = useCallback((fieldName, value, shouldAutoAdvance = false) => {
    const stepConfig = getStepById(currentStep);
    if (!stepConfig) return;
    
    // Get the appropriate action
    const updateAction = getUpdateAction(stepConfig.type);
    
    if (!updateAction) {
      console.error(`No update action found for step type: ${stepConfig.type}`);
      return;
    }
    
    // For business details, we need to merge the value
    if (stepConfig.type === 'businessDetails') {
      const updatedDetails = { ...data.businessDetails, [fieldName]: value };
      dispatch(updateAction(updatedDetails));
      
      // Clear specific field error
      if (fieldErrors[fieldName]) {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    } else {
      // For other steps, directly set the value
      dispatch(updateAction(value));
      
      // Clear errors for this field
      setFieldErrors({});
      
      // Handle auto-advance if configured
      if (shouldAutoAdvance && stepConfig.autoAdvance) {
        // Small delay to ensure Redux state is updated
        setTimeout(() => {
          // For auto-advance, we don't need to pass override data
          // since Redux state has been updated
          handleNext(true);
        }, 100);
      }
    }
  }, [currentStep, data, dispatch, fieldErrors, handleNext]);
  
  /**
   * Clear error for a specific field
   * @param {string} fieldName - Name of the field to clear error for
   */
  const clearFieldError = useCallback((fieldName) => {
    setFieldErrors(prev => {
      if (!prev[fieldName]) return prev;
      
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);
  
  /**
   * Get current step configuration
   */
  const currentStepConfig = getStepById(currentStep);
  
  return {
    // State
    currentStep,
    totalSteps: stepsConfig.length,
    stepData: data,
    fieldErrors,
    isSubmitting,
    isLoadingFromStorage,
    currentStepConfig,
    
    // Navigation handlers
    handleNext,
    handleBack,
    
    // Data handlers
    handleFieldChange,
    clearFieldError,
    
    // Validation
    validateStep,
    
    // Computed values
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === stepsConfig.length,
    progressPercentage: (currentStep / stepsConfig.length) * 100,
    
    // Debug: Add data directly for troubleshooting
    formData: data
  };
};

export default useOnboardingNavigation;