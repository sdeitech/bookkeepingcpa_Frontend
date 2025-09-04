/**
 * StepLayout Component
 * Common wrapper for all onboarding steps
 * Provides consistent layout with logo, progress bar, and navigation
 */

import React from 'react';
import logo from '../../../../Assets/images/plutus-logo.svg';
import './StepLayout.scss';

const StepLayout = ({
  children,
  question,
  subtext,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  isSubmitting,
  isFirstStep,
  isLastStep,
  className = ''
}) => {
  // Calculate progress percentage
  const progressPercentage = (currentStep / totalSteps) * 100;
  
  // Determine button text
  const nextButtonText = isLastStep 
    ? (isSubmitting ? 'Completing...' : 'Complete')
    : 'Next';
  
  return (
    <div className={`main_wrapper ${className}`}>
      <div className="outer-container">
        {/* Left Panel - Logo Section */}
        <div className="left-panel">
          <img src={logo} alt="Plutus Logo" />
        </div>
        
        {/* Right Panel - Content Section */}
        <div className="right-panel">
          {/* Progress Bar */}
          <div className="progress">
            <div 
              className="progress-bar" 
              style={{ width: `${progressPercentage}%` }}
              role="progressbar"
              aria-valuenow={currentStep}
              aria-valuemin={1}
              aria-valuemax={totalSteps}
            />
          </div>
          
          {/* Question Section */}
          <div className="ques-outer-wrapper">
            {/* Header with Question and Subtext */}
            <div className="heading_stepper">
              <div className="question">{question}</div>
              {subtext && <div className="subtext">{subtext}</div>}
            </div>
            
            {/* Step Content - Passed as children */}
            <div className="question_sec">
              {children}
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="buttons">
            <button 
              className="btn-back" 
              onClick={onBack}
              disabled={isFirstStep || isSubmitting}
              type="button"
              aria-label="Go to previous step"
            >
              Back
            </button>
            <button
              className="btn btn-next"
              onClick={() => {
                console.log('Next button clicked!');
                onNext();
              }}
              disabled={isSubmitting}
              type="button"
              aria-label={isLastStep ? "Complete onboarding" : "Go to next step"}
            >
              {nextButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepLayout;