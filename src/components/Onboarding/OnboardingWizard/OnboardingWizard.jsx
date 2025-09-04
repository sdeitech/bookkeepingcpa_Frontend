import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import StepLayout from '../components/StepLayout';
import BusinessNeedsStep from '../steps/BusinessNeedsStep';
import PreviousBookkeeperStep from '../steps/PreviousBookkeeperStep';
import BusinessDetailsStep from '../steps/BusinessDetailsStep';
import IndustryStep from '../steps/IndustryStep';
import { stepsConfig } from '../config/stepsConfig';
import useOnboardingNavigation from '../hooks/useOnboardingNavigation';
import { useGetOnboardingDataQuery } from '../../../features/onboarding/onboardingApi';
import './OnboardingWizard.scss';

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const userId = useSelector((state) => state.auth.user?.id);

  // Fetch onboarding data
  const { data: onboardingData, isLoading } = useGetOnboardingDataQuery(userId, {
    skip: !userId,
  });

  // Use the navigation hook
  const {
    currentStep,
    stepData,
    fieldErrors,
    isSubmitting,
    handleNext,
    handleBack,
    handleFieldChange,
    isFirstStep,
    isLastStep
  } = useOnboardingNavigation();

  // Check if already completed
  useEffect(() => {
    if (onboardingData?.is_onboarding_complete) {
      navigate('/dashboard');
    }
  }, [onboardingData, navigate]);

  if (isLoading) {
    return (
      <div className="onboarding-loader">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BusinessNeedsStep 
            value={stepData.businessNeeds}
            onChange={handleFieldChange} 
            fieldErrors={fieldErrors}
            isSubmitting={isSubmitting}
          />
        );
      case 2:
        return (
          <PreviousBookkeeperStep
            value={stepData.previousBookkeeper}
            onChange={handleFieldChange}
            fieldErrors={fieldErrors}
            isSubmitting={isSubmitting}
          />
        );
      case 3:
        return (
          <BusinessDetailsStep
            value={stepData.businessDetails}
            onChange={handleFieldChange}
            fieldErrors={fieldErrors}
            isSubmitting={isSubmitting}
          />
        );
      case 4:
        return (
          <IndustryStep
            value={stepData.industry}
            onChange={handleFieldChange}
            fieldErrors={fieldErrors}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  const currentStepConfig = stepsConfig[currentStep - 1];
  
  return (
    <StepLayout
      currentStep={currentStep}
      totalSteps={stepsConfig.length}
      question={currentStepConfig.question}
      subtext={currentStepConfig.subtext}
      onBack={handleBack}
      onNext={handleNext}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      isSubmitting={isSubmitting}
    >
      {renderStepContent()}
    </StepLayout>
  );
};

export default OnboardingWizard;