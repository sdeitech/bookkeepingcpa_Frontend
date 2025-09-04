/**
 * localStorage utility for managing onboarding data
 * This replaces the need for multiple API calls during the onboarding process
 */

const STORAGE_KEY = 'onboarding_progress';
const STORAGE_VERSION = '1.0';

/**
 * Onboarding storage utility object
 */
export const onboardingStorage = {
  /**
   * Save onboarding data to localStorage
   * @param {Object} data - The onboarding data to save
   * @returns {boolean} - Success status
   */
  save: (data) => {
    try {
      const storageData = {
        version: STORAGE_VERSION,
        timestamp: new Date().toISOString(),
        data: {
          currentStep: data.currentStep || 1,
          businessNeeds: data.businessNeeds || null,
          previousBookkeeper: data.previousBookkeeper || null,
          businessDetails: {
            businessName: data.businessDetails?.businessName || '',
            businessType: data.businessDetails?.businessType || '',
            yearStarted: data.businessDetails?.yearStarted || '',
            employeeCount: data.businessDetails?.employeeCount || '',
            monthlyRevenue: data.businessDetails?.monthlyRevenue || ''
          },
          industry: data.industry || null
        }
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      // Handle quota exceeded or other errors
      if (error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded');
      }
      return false;
    }
  },

  /**
   * Get onboarding data from localStorage
   * @returns {Object|null} - The stored onboarding data or null if not found
   */
  get: () => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (!storedData) {
        return null;
      }

      const parsed = JSON.parse(storedData);
      
      // Check version compatibility
      if (parsed.version !== STORAGE_VERSION) {
        console.warn('Stored data version mismatch. Clearing old data.');
        onboardingStorage.clear();
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  /**
   * Update specific field in stored data
   * @param {string} field - The field to update
   * @param {any} value - The new value
   * @returns {boolean} - Success status
   */
  updateField: (field, value) => {
    try {
      const currentData = onboardingStorage.get() || {};
      
      if (field === 'businessDetails') {
        currentData.businessDetails = {
          ...currentData.businessDetails,
          ...value
        };
      } else {
        currentData[field] = value;
      }
      
      return onboardingStorage.save(currentData);
    } catch (error) {
      console.error('Error updating field in localStorage:', error);
      return false;
    }
  },

  /**
   * Clear onboarding data from localStorage
   * @returns {boolean} - Success status
   */
  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  /**
   * Check if onboarding data exists in localStorage
   * @returns {boolean} - True if data exists
   */
  exists: () => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch (error) {
      console.error('Error checking localStorage:', error);
      return false;
    }
  },

  /**
   * Get the timestamp of when data was last saved
   * @returns {string|null} - ISO timestamp or null
   */
  getLastSaved: () => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (!storedData) {
        return null;
      }
      
      const parsed = JSON.parse(storedData);
      return parsed.timestamp || null;
    } catch (error) {
      console.error('Error getting timestamp from localStorage:', error);
      return null;
    }
  },

  /**
   * Check if all required fields are completed
   * @returns {Object} - Validation result with status and missing fields
   */
  validateCompletion: () => {
    const data = onboardingStorage.get();
    if (!data) {
      return { 
        isComplete: false, 
        missingFields: ['All data'] 
      };
    }

    const missingFields = [];

    if (!data.businessNeeds) {
      missingFields.push('Business needs');
    }
    if (!data.previousBookkeeper) {
      missingFields.push('Previous bookkeeper information');
    }
    if (!data.businessDetails?.businessName) {
      missingFields.push('Business name');
    }
    if (!data.businessDetails?.businessType) {
      missingFields.push('Business type');
    }
    if (!data.industry) {
      missingFields.push('Industry');
    }

    return {
      isComplete: missingFields.length === 0,
      missingFields
    };
  },

  /**
   * Check if localStorage is available
   * @returns {boolean} - True if localStorage is supported
   */
  isSupported: () => {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Get all data for final submission
   * @returns {Object} - Formatted data ready for API submission
   */
  getSubmissionData: () => {
    const data = onboardingStorage.get();
    if (!data) {
      return null;
    }

    // Format data for API submission
    return {
      data: {
        businessNeeds: data.businessNeeds,
        previousBookkeeper: data.previousBookkeeper,
        businessDetails: data.businessDetails,
        industry: data.industry
      },
      currentStep: data.currentStep || 4,
      completed: true
    };
  }
};

// Check localStorage support on module load
if (!onboardingStorage.isSupported()) {
  console.warn('localStorage is not supported in this browser. Onboarding data will not persist.');
}

export default onboardingStorage;