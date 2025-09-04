/**
 * PreviousBookkeeperStep Component
 * Step 2 of onboarding - Were you previously working with a bookkeeper?
 */

import React from 'react';
import { stepOptions } from '../../config/stepsConfig';
import './PreviousBookkeeperStep.scss';

const PreviousBookkeeperStep = ({ 
  value, 
  onChange, 
  fieldErrors,
  isSubmitting 
}) => {
  const options = stepOptions.previousBookkeeper;
  const error = fieldErrors?.previousBookkeeper || fieldErrors?.general;
  
  /**
   * Handle option click
   * @param {string} optionValue - Value of the clicked option
   */
  const handleOptionClick = (optionValue) => {
    if (isSubmitting) return;
    
    // Call onChange with the value and indicate this should auto-advance
    onChange('previousBookkeeper', optionValue, true);
  };
  
  return (
    <div className="previous-bookkeeper-step">
      <div className="options-container">
        {options.map(option => (
          <div
            key={option.id}
            className={`option ${value === option.value ? 'selected' : ''} ${isSubmitting ? 'disabled' : ''}`}
            onClick={() => handleOptionClick(option.value)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleOptionClick(option.value);
              }
            }}
            aria-label={option.label}
            aria-selected={value === option.value}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviousBookkeeperStep;