import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  goToStep,
  markSaved,
  markCompleted,
  loadOnboardingData,
  setSubmitting,
  updateBusinessNeeds,
  updatePreviousBookkeeper,
  updateBusinessDetails,
  updateIndustry
} from '../../../features/onboarding/onboardingSlice';
import {
  useGetOnboardingDataQuery,
  useSaveOnboardingProgressMutation,
  useCompleteOnboardingMutation
} from '../../../features/onboarding/onboardingApi';
import logo from "../../../Assets/images/plutus-logo.svg";
import './OnboardingWizard.scss';

// Import icons for Industry step
import professional from "../../../Assets/images/professional.svg";
import socialicon from "../../../Assets/images/social-icons.svg";
import realstate from "../../../Assets/images/real-estate.svg";
import Agency from "../../../Assets/images/agency.svg";
import saas from "../../../Assets/images/saas.svg";
import pllimg from "../../../Assets/images/pl-img.svg";
import retails from "../../../Assets/images/retails.svg";
import ventures from "../../../Assets/images/ventures.svg";
import others from "../../../Assets/images/other.svg";

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentStep, data, isSubmitting } = useSelector(state => state.onboarding);
  
  // RTK Query hooks
  const { data: onboardingData, isLoading } = useGetOnboardingDataQuery();
  const [saveProgress] = useSaveOnboardingProgressMutation();
  const [completeOnboarding] = useCompleteOnboardingMutation();
  
  // Local state for form data - initialize from Redux store
  const [businessNeeds, setBusinessNeeds] = useState(data.businessNeeds || '');
  const [previousBookkeeper, setPreviousBookkeeper] = useState(data.previousBookkeeper || '');
  const [businessDetails, setBusinessDetails] = useState({
    businessName: data.businessDetails?.businessName || '',
    businessType: data.businessDetails?.businessType || '',
    yearStarted: data.businessDetails?.yearStarted || '',
    employeeCount: data.businessDetails?.employeeCount || '',
    monthlyRevenue: data.businessDetails?.monthlyRevenue || ''
  });
  const [industry, setIndustry] = useState(data.industry || '');
  
  // Auto-save timer
  const [lastSaveTime, setLastSaveTime] = useState(Date.now());
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    // Load existing onboarding data when fetched (only on initial load)
    if (onboardingData && isInitialLoad) {
      dispatch(loadOnboardingData(onboardingData));
      if (onboardingData.data) {
        setBusinessNeeds(onboardingData.data.businessNeeds || '');
        setPreviousBookkeeper(onboardingData.data.previousBookkeeper || '');
        setBusinessDetails(prev => ({ ...prev, ...(onboardingData.data.businessDetails || {}) }));
        setIndustry(onboardingData.data.industry || '');
      }
      // Only set the step if it's different from current step to avoid duplicate calls
      if (onboardingData.currentStep && onboardingData.currentStep !== currentStep) {
        dispatch(goToStep(onboardingData.currentStep));
      }
      setIsInitialLoad(false);
    }
  }, [onboardingData, isInitialLoad]); // Remove dispatch and currentStep from dependencies to prevent loops
  
  // Auto-save every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (Date.now() - lastSaveTime > 30000) {
        handleSaveProgress();
      }
    }, 30000);
    
    return () => clearInterval(autoSaveInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSaveTime, businessNeeds, previousBookkeeper, businessDetails, industry]); // Remove currentStep to prevent re-runs on step change
  
  const handleSaveProgress = async () => {
    const progressData = {
      currentStep,
      data: {
        businessNeeds,
        previousBookkeeper,
        businessDetails,
        industry
      }
    };
    
    try {
      await saveProgress(progressData).unwrap();
      dispatch(markSaved());
      setLastSaveTime(Date.now());
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };
  
  const validateStep = (step) => {
    switch (step) {
      case 1:
        return businessNeeds && businessNeeds !== '';
      case 2:
        return previousBookkeeper && previousBookkeeper !== '';
      case 3:
        return businessDetails.businessName && businessDetails.businessType;
      case 4:
        return industry && industry !== '';
      default:
        return false;
    }
  };
  
  const handleNext = async (autoAdvance = false) => {
    // Don't show alert on auto-advance, just don't proceed
    if (!validateStep(currentStep)) {
      if (!autoAdvance) {
        alert('Please complete all required fields before proceeding.');
      }
      return;
    }
    
    await handleSaveProgress();
    
    if (currentStep === 4) {
      // Complete onboarding
      dispatch(setSubmitting(true));
      try {
        const finalData = {
          data: {
            businessNeeds,
            previousBookkeeper,
            businessDetails,
            industry
          }
        };
        
        const result = await completeOnboarding(finalData).unwrap();
        if (result.success) {
          dispatch(markCompleted());
          navigate('/pricing');
        }
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
        alert('Failed to complete onboarding. Please try again.');
      } finally {
        dispatch(setSubmitting(false));
      }
    } else {
      dispatch(goToStep(currentStep + 1));
    }
  };
  
  // Auto-advance handler for option clicks (steps 1, 2, and 4)
  const handleOptionClick = async (setter, value, updater) => {
    setter(value);
    dispatch(updater(value));
    // Add small delay for visual feedback before advancing
    setTimeout(() => {
      handleNext(true); // true indicates auto-advance
    }, 300);
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      dispatch(goToStep(currentStep - 1));
    }
  };
  
  // Calculate progress percentage correctly (25% per step)
  const progressPercentage = (currentStep / 4) * 100;
  
  // Step 1: PersonelInfo (Business Needs)
  const renderStep1 = () => (
    <div className="main_wrapper">
      <div className="outer-container">
        <div className="left-panel">
          <img src={logo} alt="" />
        </div>
        
        <div className="right-panel">
          <div className="progress">
            <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          
          <div className="ques-outer-wrapper">
            <div className="heading_stepper">
              <div className="question">What kind of help does your business need?</div>
              <div className="subtext">So we can focus on the areas that matter most to you.</div>
            </div>
            
            <div className="question_sec">
              <div
                className={`option ${businessNeeds === 'browsing' ? 'selected' : ''}`}
                onClick={() => handleOptionClick(setBusinessNeeds, 'browsing', updateBusinessNeeds)}
              >
                Nothing yet, just browsing
              </div>
              <div
                className={`option ${businessNeeds === 'bookkeeping' ? 'selected' : ''}`}
                onClick={() => handleOptionClick(setBusinessNeeds, 'bookkeeping', updateBusinessNeeds)}
              >
                Bookkeeping with Plutify expert support.
              </div>
              <div
                className={`option ${businessNeeds === 'comprehensive' ? 'selected' : ''}`}
                onClick={() => handleOptionClick(setBusinessNeeds, 'comprehensive', updateBusinessNeeds)}
              >
                Clear understanding of where my business stands, maximizing my tax savings, and
                advisory from a licensed professional.
              </div>
            </div>
          </div>
          
          <div className="buttons">
            <button className="btn-back" onClick={handleBack} disabled={currentStep === 1}>Back</button>
            <button className="btn btn-next" onClick={() => handleNext(false)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Step 2: InfoHistory (Previous Bookkeeper)
  const renderStep2 = () => (
    <div className="main_wrapper">
      <div className="outer-container">
        <div className="left-panel">
          <img src={logo} alt="" />
        </div>
        
        <div className="right-panel">
          <div className="progress">
            <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          
          <div className="ques-outer-wrapper">
            <div className="heading_stepper">
              <div className="question">Were you previously working with a bookkeeper?</div>
              <div className="subtext">Helps us understand your bookkeeping history.</div>
            </div>
            
            <div className="question_sec">
              <div
                className={`option ${previousBookkeeper === 'yes' ? 'selected' : ''}`}
                onClick={() => handleOptionClick(setPreviousBookkeeper, 'yes', updatePreviousBookkeeper)}
              >
                Yes
              </div>
              <div
                className={`option ${previousBookkeeper === 'no' ? 'selected' : ''}`}
                onClick={() => handleOptionClick(setPreviousBookkeeper, 'no', updatePreviousBookkeeper)}
              >
                No
              </div>
            </div>
          </div>
          
          <div className="buttons">
            <button className="btn-back" onClick={handleBack}>Back</button>
            <button className="btn btn-next" onClick={() => handleNext(false)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Step 3: BusinessTrack (Business Details)
  const renderStep3 = () => (
    <div className="main_wrapper">
      <div className="outer-container">
        <div className="left-panel">
          <img src={logo} alt="" />
        </div>
        
        <div className="right-panel">
          <div className="progress">
            <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          
          <div className="ques-outer-wrapper">
            <div className="heading_stepper">
              <div className="question">Tell us about your business</div>
              <div className="subtext">This helps us customize your experience.</div>
            </div>
            
            <div className="question_sec form_section">
              <div className="form-group">
                <label>Business Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter your business name"
                  value={businessDetails.businessName}
                  onChange={(e) => {
                    const newDetails = {...businessDetails, businessName: e.target.value};
                    setBusinessDetails(newDetails);
                    dispatch(updateBusinessDetails(newDetails));
                  }}
                />
              </div>
              
              <div className="form-group">
                <label>Business Type</label>
                <select 
                  className="form-control"
                  value={businessDetails.businessType}
                  onChange={(e) => {
                    const newDetails = {...businessDetails, businessType: e.target.value};
                    setBusinessDetails(newDetails);
                    dispatch(updateBusinessDetails(newDetails));
                  }}
                >
                  <option value="">Select business type</option>
                  <option value="sole_proprietorship">Sole Proprietorship</option>
                  <option value="llc">LLC</option>
                  <option value="corporation">Corporation</option>
                  <option value="partnership">Partnership</option>
                  <option value="s_corp">S Corporation</option>
                  <option value="nonprofit">Non-Profit</option>
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Year Started</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="YYYY"
                    value={businessDetails.yearStarted}
                    onChange={(e) => {
                      const newDetails = {...businessDetails, yearStarted: e.target.value};
                      setBusinessDetails(newDetails);
                      dispatch(updateBusinessDetails(newDetails));
                    }}
                  />
                </div>
                
                <div className="form-group">
                  <label>Number of Employees</label>
                  <select 
                    className="form-control"
                    value={businessDetails.employeeCount}
                    onChange={(e) => {
                      const newDetails = {...businessDetails, employeeCount: e.target.value};
                      setBusinessDetails(newDetails);
                      dispatch(updateBusinessDetails(newDetails));
                    }}
                  >
                    <option value="">Select range</option>
                    <option value="1">Just me</option>
                    <option value="2-5">2-5 employees</option>
                    <option value="6-10">6-10 employees</option>
                    <option value="11-25">11-25 employees</option>
                    <option value="26-50">26-50 employees</option>
                    <option value="50+">More than 50</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Monthly Revenue Range</label>
                <select 
                  className="form-control"
                  value={businessDetails.monthlyRevenue}
                  onChange={(e) => {
                    const newDetails = {...businessDetails, monthlyRevenue: e.target.value};
                    setBusinessDetails(newDetails);
                    dispatch(updateBusinessDetails(newDetails));
                  }}
                >
                  <option value="">Select revenue range</option>
                  <option value="0-10k">Less than $10,000</option>
                  <option value="10k-50k">$10,000 - $50,000</option>
                  <option value="50k-100k">$50,000 - $100,000</option>
                  <option value="100k-500k">$100,000 - $500,000</option>
                  <option value="500k-1m">$500,000 - $1M</option>
                  <option value="1m+">More than $1M</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="buttons">
            <button className="btn-back" onClick={handleBack}>Back</button>
            <button className="btn btn-next" onClick={() => handleNext(false)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Step 4: Industry
  const renderStep4 = () => (
    <div className="main_wrapper">
      <div className="outer-container">
        <div className="left-panel">
          <img src={logo} alt="" />
        </div>
        
        <div className="right-panel">
          <div className="progress">
            <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          
          <div className="ques-outer-wrapper">
            <div className="heading_stepper">
              <div className="question">Select Your Industry</div>
              <div className="subtext">So we can tailor your setup to your field.</div>
            </div>
            
            <div className="question_sec industry_sec">
              <div
                className={`industry_option option ${industry === 'ecommerce' ? 'selected' : ''}`}
                onClick={() => handleOptionClick(setIndustry, 'ecommerce', updateIndustry)}
              >
                <img src={professional} alt="" />
                Ecommerce
              </div>
              <div
                className={`industry_option option ${industry === 'professional_services' ? 'selected' : ''}`}
                onClick={() => handleOptionClick(setIndustry, 'professional_services', updateIndustry)}
              >
                <img src={professional} alt="" />
                Professional Services
              </div>
              <div
                className={`industry_option option ${industry === 'social_media' ? 'selected' : ''}`}
                onClick={() => handleOptionClick(setIndustry, 'social_media', updateIndustry)}
              >
                <img src={socialicon} alt="" />
                Social Media
              </div>
              <div
                className={`industry_option option ${industry === 'real_estate' ? 'selected' : ''}`}
                onClick={() => handleOptionClick(setIndustry, 'real_estate', updateIndustry)}
              >
                <img src={realstate} alt="" />
                Real Estate
              </div>
              <div
                className={`industry_option option ${industry === 'agency' ? 'selected' : ''}`}
                onClick={() => handleOptionClick(setIndustry, 'agency', updateIndustry)}
              >
                <img src={Agency} alt="" />
                Agency
              </div>
              <div
                className={`industry_option option ${industry === 'saas' ? 'selected' : ''}`}
                onClick={() => handleOptionClick(setIndustry, 'saas', updateIndustry)}
              >
                <img src={saas} alt="" />
                Saas
              </div>
              <div
                className={`industry_option option ${industry === '3pl' ? 'selected' : ''}`}
                onClick={() => handleOptionClick(setIndustry, '3pl', updateIndustry)}
              >
                <img src={pllimg} alt="" />
                3PL
              </div>
              <div
                className={`industry_option option ${industry === 'retail' ? 'selected' : ''}`}
                onClick={() => handleOptionClick(setIndustry, 'retail', updateIndustry)}
              >
                <img src={retails} alt="" />
                Retail
              </div>
              <div
                className={`industry_option option ${industry === 'ai_ventures' ? 'selected' : ''}`}
                onClick={() => handleOptionClick(setIndustry, 'ai_ventures', updateIndustry)}
              >
                <img src={ventures} alt="" />
                AI Ventures
              </div>
              <div
                className={`industry_option option ${industry === 'others' ? 'selected' : ''}`}
                onClick={() => handleOptionClick(setIndustry, 'others', updateIndustry)}
              >
                <img src={others} alt="" />
                Others
              </div>
            </div>
          </div>
          
          <div className="buttons">
            <button className="btn-back" onClick={handleBack}>Back</button>
            <button className="btn btn-next" onClick={() => handleNext(false)}>
              {currentStep === 4 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };
  
  if (isLoading) {
    return (
      <div className="onboarding-loading">
        <div className="spinner"></div>
        <p>Loading your onboarding data...</p>
      </div>
    );
  }
  
  return renderCurrentStep();
};

export default OnboardingWizard;