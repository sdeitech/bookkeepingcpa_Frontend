/**
 * BusinessDetailsStep Component
 * Step 3 of onboarding - Tell us about your business
 */

import React from 'react';
import { stepOptions } from '../../config/stepsConfig';
import './BusinessDetailsStep.scss';

const BusinessDetailsStep = ({ 
  value = {}, 
  onChange, 
  fieldErrors = {},
  isSubmitting 
}) => {
  // Extract values with defaults
  const {
    businessName = '',
    businessType = '',
    yearStarted = '',
    employeeCount = '',
    monthlyRevenue = ''
  } = value;
  
  /**
   * Handle input change for text fields
   * @param {string} fieldName - Name of the field
   * @param {Event} e - Change event
   */
  const handleInputChange = (fieldName, e) => {
    if (isSubmitting) return;
    
    let fieldValue = e.target.value;
    
    // Special handling for year field - only allow 4 digits
    if (fieldName === 'yearStarted') {
      fieldValue = fieldValue.replace(/\D/g, '').substring(0, 4);
    }
    
    onChange(fieldName, fieldValue, false);
  };
  
  return (
    <div className="business-details-step form_section">
      <div className="form-group">
        <label>
          Business Name <span className="required">*</span>
        </label>
        <input
          type="text"
          className={`form-control ${fieldErrors.businessName ? 'error' : ''}`}
          placeholder="Enter your business name"
          value={businessName}
          onChange={(e) => handleInputChange('businessName', e)}
          disabled={isSubmitting}
          required
          aria-label="Business Name"
          aria-invalid={!!fieldErrors.businessName}
          aria-describedby={fieldErrors.businessName ? 'businessName-error' : undefined}
        />
        {fieldErrors.businessName && (
          <span id="businessName-error" className="error-message">
            {fieldErrors.businessName}
          </span>
        )}
      </div>
      
      <div className="form-group">
        <label>
          Business Type <span className="required">*</span>
        </label>
        <select
          className={`form-control ${businessType === '' ? 'placeholder' : ''} ${fieldErrors.businessType ? 'error' : ''}`}
          value={businessType}
          onChange={(e) => handleInputChange('businessType', e)}
          disabled={isSubmitting}
          required
          aria-label="Business Type"
          aria-invalid={!!fieldErrors.businessType}
          aria-describedby={fieldErrors.businessType ? 'businessType-error' : undefined}
        >
          {stepOptions.businessType.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {fieldErrors.businessType && (
          <span id="businessType-error" className="error-message">
            {fieldErrors.businessType}
          </span>
        )}
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>
            Year Started <span className="required">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${fieldErrors.yearStarted ? 'error' : ''}`}
            placeholder="YYYY"
            maxLength="4"
            pattern="[0-9]{4}"
            value={yearStarted}
            onChange={(e) => handleInputChange('yearStarted', e)}
            disabled={isSubmitting}
            required
            aria-label="Year Started"
            aria-invalid={!!fieldErrors.yearStarted}
            aria-describedby={fieldErrors.yearStarted ? 'yearStarted-error' : undefined}
          />
          {fieldErrors.yearStarted && (
            <span id="yearStarted-error" className="error-message">
              {fieldErrors.yearStarted}
            </span>
          )}
        </div>
        
        <div className="form-group">
          <label>
            Number of Employees <span className="required">*</span>
          </label>
          <select
            className={`form-control ${employeeCount === '' ? 'placeholder' : ''} ${fieldErrors.employeeCount ? 'error' : ''}`}
            value={employeeCount}
            onChange={(e) => handleInputChange('employeeCount', e)}
            disabled={isSubmitting}
            required
            aria-label="Number of Employees"
            aria-invalid={!!fieldErrors.employeeCount}
            aria-describedby={fieldErrors.employeeCount ? 'employeeCount-error' : undefined}
          >
            {stepOptions.employeeCount.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.employeeCount && (
            <span id="employeeCount-error" className="error-message">
              {fieldErrors.employeeCount}
            </span>
          )}
        </div>
      </div>
      
      <div className="form-group">
        <label>
          Monthly Revenue Range <span className="required">*</span>
        </label>
        <select
          className={`form-control ${monthlyRevenue === '' ? 'placeholder' : ''} ${fieldErrors.monthlyRevenue ? 'error' : ''}`}
          value={monthlyRevenue}
          onChange={(e) => handleInputChange('monthlyRevenue', e)}
          disabled={isSubmitting}
          required
          aria-label="Monthly Revenue Range"
          aria-invalid={!!fieldErrors.monthlyRevenue}
          aria-describedby={fieldErrors.monthlyRevenue ? 'monthlyRevenue-error' : undefined}
        >
          {stepOptions.monthlyRevenue.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {fieldErrors.monthlyRevenue && (
          <span id="monthlyRevenue-error" className="error-message">
            {fieldErrors.monthlyRevenue}
          </span>
        )}
      </div>
    </div>
  );
};

export default BusinessDetailsStep;