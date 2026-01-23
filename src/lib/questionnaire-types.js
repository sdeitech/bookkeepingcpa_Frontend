/**
 * Questionnaire Types and Logic
 * 
 * This file contains all types, options, and recommendation logic for the questionnaire flow.
 */

/**
 * @typedef {'R1' | 'R2' | 'R3'} RevenueValue
 * @typedef {'S1' | 'S2' | 'S3'} SupportValue
 * @typedef {'C1' | 'C2'} CustomizationValue
 * @typedef {'T1' | 'T2' | 'T3'} CleanupValue
 * @typedef {'X1' | 'X2' | 'X3'} TaxValue
 * @typedef {'single-llc' | 'partnership' | 's-corp' | 'c-corp'} BusinessStructure
 * @typedef {'startup' | 'essential' | 'enterprise'} PlanType
 */

/**
 * @typedef {Object} QuestionnaireAnswers
 * @property {RevenueValue | null} q1Revenue
 * @property {SupportValue | null} q2Support
 * @property {CustomizationValue | null} q3Customization
 * @property {BusinessStructure | null} q4Structure
 * @property {CleanupValue | null} q5Cleanup
 * @property {TaxValue | null} q6Tax
 */

/**
 * Initial answers object with all values set to null
 * @type {QuestionnaireAnswers}
 */
export const initialAnswers = {
  q1Revenue: null,
  q2Support: null,
  q3Customization: null,
  q4Structure: null,
  q5Cleanup: null,
  q6Tax: null,
};

/**
 * Plan recommendation logic based on questionnaire answers
 * 
 * Priority 1: Enterprise
 * - High Revenue (R3) OR High Customization (C2) OR High Strategy (S3)
 * 
 * Priority 2: Essential
 * - Medium Revenue (R2) OR Medium Strategy (S2)
 * 
 * Priority 3: Startup (Default)
 * - Low Revenue (R1) AND Low Strategy (S1) AND No Customization (C1)
 * 
 * @param {QuestionnaireAnswers} answers - The questionnaire answers object
 * @returns {PlanType} The recommended plan type
 */
export function recommendPlan(answers) {
  const { q1Revenue, q2Support, q3Customization } = answers;

  // Priority 1: Enterprise
  // E1: High Revenue OR E2: High Customization OR E3: High Strategy
  if (q1Revenue === 'R3' || q3Customization === 'C2' || q2Support === 'S3') {
    return 'enterprise';
  }

  // Priority 2: Essential
  // L1: Medium Revenue OR L2: Medium Strategy
  if (q1Revenue === 'R2' || q2Support === 'S2') {
    return 'essential';
  }

  // Priority 3: Startup (Default)
  // D1: Low Revenue AND Low Strategy AND No Customization
  return 'startup';
}

/**
 * Plan details for each plan type
 * @type {Record<PlanType, { name: string; description: string }>}
 */
export const planDetails = {
  startup: {
    name: 'Startup',
    description: 'Core monthly bookkeeping and financial reporting for growing businesses.',
  },
  essential: {
    name: 'Essential',
    description: 'Enhanced bookkeeping with quarterly strategy calls and priority support.',
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Dedicated CFO relationship with custom solutions for complex business needs.',
  },
};

/**
 * Revenue question options
 * @type {Array<{ value: RevenueValue; label: string }>}
 */
export const revenueOptions = [
  { value: 'R1', label: 'Less than $750,000' },
  { value: 'R2', label: '$750,000 to $3,000,000' },
  { value: 'R3', label: 'More than $3,000,000' },
];

/**
 * Support level question options
 * @type {Array<{ value: SupportValue; label: string }>}
 */
export const supportOptions = [
  { value: 'S1', label: 'Primarily core monthly bookkeeping/reporting' },
  { value: 'S2', label: 'I need quarterly strategy calls and priority support' },
  { value: 'S3', label: 'I need a dedicated CFO relationship for complex growth strategy' },
];

/**
 * Customization question options
 * @type {Array<{ value: CustomizationValue; label: string }>}
 */
export const customizationOptions = [
  { value: 'C1', label: 'No, standard financial reporting is sufficient' },
  { value: 'C2', label: 'Yes, I have specific industry, compliance, or complex tax needs' },
];

/**
 * Business structure question options
 * @type {Array<{ value: BusinessStructure; label: string }>}
 */
export const structureOptions = [
  { value: 'single-llc', label: 'Single-Member LLC' },
  { value: 'partnership', label: 'Partnership' },
  { value: 's-corp', label: 'S-Corporation' },
  { value: 'c-corp', label: 'C-Corporation' },
];

/**
 * Cleanup question options
 * @type {Array<{ value: CleanupValue; label: string }>}
 */
export const cleanupOptions = [
  { value: 'T1', label: 'Yes' },
  { value: 'T2', label: 'No' },
  { value: 'T3', label: 'I am not sure' },
];

/**
 * Tax question options
 * @type {Array<{ value: TaxValue; label: string }>}
 */
export const taxOptions = [
  { value: 'X1', label: 'Yes' },
  { value: 'X2', label: 'No' },
  { value: 'X3', label: 'I am not sure' },
];

