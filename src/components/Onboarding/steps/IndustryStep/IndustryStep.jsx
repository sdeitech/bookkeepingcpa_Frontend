/**
 * IndustryStep Component
 * Step 4 of onboarding - Select Your Industry
 */

import React from 'react';
import { stepOptions } from '../../config/stepsConfig';
// Import industry icons
import professional from '../../../../Assets/images/professional.svg';
import socialicon from '../../../../Assets/images/social-icons.svg';
import realstate from '../../../../Assets/images/real-estate.svg';
import Agency from '../../../../Assets/images/agency.svg';
import saas from '../../../../Assets/images/saas.svg';
import pllimg from '../../../../Assets/images/pl-img.svg';
import retails from '../../../../Assets/images/retails.svg';
import ventures from '../../../../Assets/images/ventures.svg';
import others from '../../../../Assets/images/other.svg';
import './IndustryStep.scss';

// Map icon names to imported images
const iconMap = {
  professional,
  socialicon,
  realstate,
  Agency,
  saas,
  pllimg,
  retails,
  ventures,
  others
};

const IndustryStep = ({ 
  value, 
  onChange, 
  fieldErrors,
  isSubmitting 
}) => {
  const options = stepOptions.industry;
  const error = fieldErrors?.industry || fieldErrors?.general;
  
  /**
   * Handle option click
   * @param {string} optionValue - Value of the clicked option
   */
  const handleOptionClick = (optionValue) => {
    if (isSubmitting) return;
    
    // Call onChange with the value (no auto-advance for industry step)
    onChange('industry', optionValue, false);
  };
  
  /**
   * Get the appropriate icon for an option
   * @param {string} iconName - Name of the icon
   * @returns {string} Icon source URL
   */
  const getIcon = (iconName) => {
    return iconMap[iconName] || others;
  };
  
  return (
    <div className="industry-step">
      <div className="industry_sec">
        {options.map(option => (
          <div
            key={option.id}
            className={`industry_option option ${value === option.value ? 'selected' : ''} ${isSubmitting ? 'disabled' : ''}`}
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
            <img 
              src={getIcon(option.icon)} 
              alt={`${option.label} icon`}
              className="industry-icon"
            />
            <span className="industry-label">{option.label}</span>
          </div>
        ))}
      </div>
      
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default IndustryStep;