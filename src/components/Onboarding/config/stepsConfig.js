/**
 * Onboarding Steps Configuration
 * Centralized configuration for all onboarding steps
 * Makes it easy to add, remove, or reorder steps
 */

export const STEP_TYPES = {
  BUSINESS_NEEDS: 'businessNeeds',
  PREVIOUS_BOOKKEEPER: 'previousBookkeeper',
  BUSINESS_DETAILS: 'businessDetails',
  INDUSTRY: 'industry',
  // Add new step types here as needed
};

export const FIELD_NAMES = {
  // Step 1 - Business Needs
  BUSINESS_NEEDS: 'businessNeeds',
  
  // Step 2 - Previous Bookkeeper
  PREVIOUS_BOOKKEEPER: 'previousBookkeeper',
  
  // Step 3 - Business Details
  BUSINESS_NAME: 'businessName',
  BUSINESS_TYPE: 'businessType',
  YEAR_STARTED: 'yearStarted',
  EMPLOYEE_COUNT: 'employeeCount',
  MONTHLY_REVENUE: 'monthlyRevenue',
  
  // Step 4 - Industry
  INDUSTRY: 'industry',
};

export const stepsConfig = [
  {
    id: 1,
    type: STEP_TYPES.BUSINESS_NEEDS,
    title: "Business Needs",
    component: 'BusinessNeedsStep',
    question: "What kind of help does your business need?",
    subtext: "So we can focus on the areas that matter most to you.",
    autoAdvance: true,
    validation: 'validateBusinessNeeds',
    reduxAction: 'updateBusinessNeeds',
    dataField: 'businessNeeds'
  },
  {
    id: 2,
    type: STEP_TYPES.PREVIOUS_BOOKKEEPER,
    component: 'PreviousBookkeeperStep',
    title: "Previous Bookkeeper",
    question: "Were you previously working with a bookkeeper?",
    subtext: "Helps us understand your bookkeeping history.",
    autoAdvance: true,
    validation: 'validatePreviousBookkeeper',
    reduxAction: 'updatePreviousBookkeeper',
    dataField: 'previousBookkeeper'
  },
  {
    id: 3,
    type: STEP_TYPES.BUSINESS_DETAILS,
    component: 'BusinessDetailsStep',
    title: "Business Details",
    question: "Tell us about your business",
    subtext: "This helps us customize your experience.",
    autoAdvance: false,
    validation: 'validateBusinessDetails',
    reduxAction: 'updateBusinessDetails',
    dataField: 'businessDetails'
  },
  {
    id: 4,
    type: STEP_TYPES.INDUSTRY,
    component: 'IndustryStep',
    title: "Industry",
    question: "Select Your Industry",
    subtext: "So we can tailor your setup to your field.",
    autoAdvance: false,
    validation: 'validateIndustry',
    reduxAction: 'updateIndustry',
    dataField: 'industry'
  }
];

// Options for each step (where applicable)
export const stepOptions = {
  businessNeeds: [
    {
      id: 'browsing',
      label: 'Nothing yet, just browsing',
      value: 'browsing'
    },
    {
      id: 'bookkeeping',
      label: 'Bookkeeping with Plutify expert support.',
      value: 'bookkeeping'
    },
    {
      id: 'comprehensive',
      label: 'Clear understanding of where my business stands, maximizing my tax savings, and advisory from a licensed professional.',
      value: 'comprehensive'
    }
  ],
  
  previousBookkeeper: [
    {
      id: 'yes',
      label: 'Yes',
      value: 'yes'
    },
    {
      id: 'no',
      label: 'No',
      value: 'no'
    }
  ],
  
  businessType: [
    { value: '', label: 'Select business type' },
    { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
    { value: 'llc', label: 'LLC' },
    { value: 'corporation', label: 'Corporation' },
    { value: 'partnership', label: 'Partnership' },
    { value: 's_corp', label: 'S Corporation' },
    { value: 'nonprofit', label: 'Non-Profit' }
  ],
  
  employeeCount: [
    { value: '', label: 'Select range' },
    { value: '1', label: 'Just me' },
    { value: '2-5', label: '2-5 employees' },
    { value: '6-10', label: '6-10 employees' },
    { value: '11-25', label: '11-25 employees' },
    { value: '26-50', label: '26-50 employees' },
    { value: '50+', label: 'More than 50' }
  ],
  
  monthlyRevenue: [
    { value: '', label: 'Select revenue range' },
    { value: '0-10k', label: 'Less than $10,000' },
    { value: '10k-50k', label: '$10,000 - $50,000' },
    { value: '50k-100k', label: '$50,000 - $100,000' },
    { value: '100k-500k', label: '$100,000 - $500,000' },
    { value: '500k-1m', label: '$500,000 - $1M' },
    { value: '1m+', label: 'More than $1M' }
  ],
  
  industry: [
    { id: 'ecommerce', label: 'Ecommerce', value: 'ecommerce', icon: 'professional' },
    { id: 'professional_services', label: 'Professional Services', value: 'professional_services', icon: 'professional' },
    { id: 'social_media', label: 'Social Media', value: 'social_media', icon: 'socialicon' },
    { id: 'real_estate', label: 'Real Estate', value: 'real_estate', icon: 'realstate' },
    { id: 'agency', label: 'Agency', value: 'agency', icon: 'Agency' },
    { id: 'saas', label: 'Saas', value: 'saas', icon: 'saas' },
    { id: '3pl', label: '3PL', value: '3pl', icon: 'pllimg' },
    { id: 'retail', label: 'Retail', value: 'retail', icon: 'retails' },
    { id: 'ai_ventures', label: 'AI Ventures', value: 'ai_ventures', icon: 'ventures' },
    { id: 'others', label: 'Others', value: 'others', icon: 'others' }
  ]
};

// Helper functions
export const getStepById = (id) => stepsConfig.find(step => step.id === id);
export const getStepByType = (type) => stepsConfig.find(step => step.type === type);
export const getTotalSteps = () => stepsConfig.length;
export const isLastStep = (currentStep) => currentStep === stepsConfig.length;
export const getNextStep = (currentStep) => {
  if (currentStep < stepsConfig.length) {
    return currentStep + 1;
  }
  return currentStep;
};
export const getPreviousStep = (currentStep) => {
  if (currentStep > 1) {
    return currentStep - 1;
  }
  return currentStep;
};