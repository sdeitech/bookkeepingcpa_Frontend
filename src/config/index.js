/**
 * Application Configuration
 * Centralized configuration using environment variables
 */

const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  },

  // Stripe Configuration
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    enabled: import.meta.env.VITE_ENABLE_STRIPE === 'true',
  },

  // Amazon Configuration
  amazon: {
    clientId: import.meta.env.VITE_AMAZON_CLIENT_ID || '',
    redirectUri: import.meta.env.VITE_AMAZON_REDIRECT_URI || '',
    enabled: import.meta.env.VITE_ENABLE_AMAZON === 'true',
  },


  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Plurify',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    env: import.meta.env.VITE_ENV || 'development',
  },

  // Feature Flags
  features: {
    stripe: import.meta.env.VITE_ENABLE_STRIPE === 'true',
    amazon: import.meta.env.VITE_ENABLE_AMAZON === 'true',
    walmart: import.meta.env.VITE_ENABLE_WALMART === 'true',
    onboarding: import.meta.env.VITE_ENABLE_ONBOARDING === 'true',
  },
  // Environment checks
  isDevelopment: import.meta.env.VITE_ENV === 'development',
  isStaging: import.meta.env.VITE_ENV === 'staging',
  isProduction: import.meta.env.VITE_ENV === 'production',
};

Object.freeze(config);

export default config;

/**
 * Helper function to log config in development
 */
export const logConfig = () => {
  if (config.isDevelopment && config.debug.enabled) {
    console.group('🔧 Application Configuration');
    console.log('Environment:', config.app.env);
    console.log('API Base URL:', config.api.baseUrl);
    console.log('Features Enabled:', config.features);
    console.groupEnd();
  }
};