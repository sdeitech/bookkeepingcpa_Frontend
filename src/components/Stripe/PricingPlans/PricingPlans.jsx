import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Check, Star, Zap, Shield, Users } from 'lucide-react';
import { 
  useGetSubscriptionPlansQuery,
  useGetUserSubscriptionQuery 
} from '../../../features/subscription/subscriptionApi';
import './PricingPlans.scss';

const PricingPlans = () => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  
  // Get authentication state from Redux
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  // Debug logging
  useEffect(() => {
    console.log('PricingPlans - Auth State:', { isAuthenticated, user });
  }, [isAuthenticated, user]);
  
  // RTK Query hooks - Always fetch plans (public endpoint)
  const { 
    data: plansData, 
    isLoading: plansLoading, 
    error: plansError,
    refetch: refetchPlans,
    isUninitialized: plansUninitialized
  } = useGetSubscriptionPlansQuery(undefined, {
    refetchOnMountOrArgChange: true
  });
  
  // Only fetch user subscription if authenticated
  const { 
    data: subscriptionData,
    isLoading: subscriptionLoading,
    error: subscriptionError
  } = useGetUserSubscriptionQuery(undefined, {
    skip: !isAuthenticated, // Skip query if user is not authenticated
    refetchOnMountOrArgChange: true
  });
  
  // Debug logging for API calls
  useEffect(() => {
    console.log('Plans Query State:', {
      data: plansData,
      loading: plansLoading,
      error: plansError,
      uninitialized: plansUninitialized
    });
  }, [plansData, plansLoading, plansError, plansUninitialized]);
  
  useEffect(() => {
    console.log('Subscription Query State:', {
      authenticated: isAuthenticated,
      data: subscriptionData,
      loading: subscriptionLoading,
      error: subscriptionError
    });
  }, [isAuthenticated, subscriptionData, subscriptionLoading, subscriptionError]);
  
  const plans = plansData?.data || [];
  const currentSubscription = subscriptionData?.data;

  useEffect(() => {
    // Set the popular plan as default selected
    if (plans.length > 0 && !selectedPlanId) {
      const popularPlan = plans.find(plan => plan.isPopular);
      if (popularPlan) setSelectedPlanId(popularPlan._id);
    }
  }, [plans, selectedPlanId]);

  const handleSelectPlan = (plan) => {
    if (isCurrentPlan(plan)) return;
    
    // User is logged in, proceed to checkout
    // Save plan info in session storage for checkout page
    sessionStorage.setItem('selectedPlan', JSON.stringify(plan));
    sessionStorage.setItem('billingPeriod', billingPeriod);
    
    navigate('/checkout', {
      state: {
        plan,
        billingPeriod
      }
    });
  };

  const isCurrentPlan = (plan) => {
    return currentSubscription?.subscriptionPlanId?._id === plan._id;
  };

  const getPlanPrice = (plan) => {
    return billingPeriod === 'yearly' ? plan.pricePerYear : plan.pricePerMonth;
  };

  const getPlanFeatures = (plan) => {
    // Check if features is an array of strings
    if (plan.features && Array.isArray(plan.features) && typeof plan.features[0] === 'string') {
      return plan.features;
    }

    // Check if features is an object with feature flags
    const integrationFeatures = [];
    if (plan.features) {
      if (plan.features.amazonIntegration) integrationFeatures.push('Amazon Integration');
      if (plan.features.walmartIntegration) integrationFeatures.push('Walmart Integration');
      if (plan.features.shopifyIntegration) integrationFeatures.push('Shopify Integration');
      if (plan.features.advancedAnalytics) integrationFeatures.push('Advanced Analytics');
      if (plan.features.prioritySupport) integrationFeatures.push('Priority Support');
      if (plan.features.customReports) integrationFeatures.push('Custom Reports');
    }

    return integrationFeatures;
  };

  const getPlanIcon = (planName) => {
    const name = planName.toLowerCase();
    if (name.includes('starter') || name.includes('basic')) return <Zap className="w-8 h-8" />;
    if (name.includes('pro') || name.includes('professional')) return <Star className="w-8 h-8" />;
    if (name.includes('enterprise') || name.includes('business')) return <Shield className="w-8 h-8" />;
    if (name.includes('team')) return <Users className="w-8 h-8" />;
    return <Star className="w-8 h-8" />;
  };

  const calculateSavings = (plan) => {
    const monthlyTotal = (plan.pricePerMonth || 0) * 12;
    const yearlyTotal = plan.pricePerYear || monthlyTotal;
    const savings = monthlyTotal - yearlyTotal;
    const percentSaved = monthlyTotal > 0 ? Math.round((savings / monthlyTotal) * 100) : 0;
    return { amount: savings, percent: percentSaved };
  };

  // No auto-redirect needed - users should select a plan
  // The redirect only happens if they have an active subscription and try to access pricing

  if (plansLoading || subscriptionLoading) {
    return (
      <div className="pricing-loading">
        <div className="spinner"></div>
        <p>Loading plans...</p>
      </div>
    );
  }

  if (plansError) {
    return (
      <div className="pricing-error">
        <p>Error loading plans: {plansError?.data?.message || plansError?.error || 'An error occurred'}</p>
        <button onClick={() => refetchPlans()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="pricing-plans-container">
      {/* Header Section */}
      <div className="pricing-header">
        <h1 className="pricing-title">Choose Your Plan</h1>
        <p className="pricing-subtitle">
          Select the perfect plan for your e-commerce business
        </p>

        {/* Show current subscription info if user has one */}
        {currentSubscription && (
          <div className="current-subscription-info">
            <p>
              You are currently on the <strong>{currentSubscription.subscriptionPlanId?.name}</strong> plan.
              <button
                onClick={() => navigate('/dashboard')}
                className="dashboard-btn"
                style={{ marginLeft: '10px', padding: '5px 15px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                Go to Dashboard
              </button>
              <a href="/subscription" style={{ marginLeft: '10px' }}> Manage Subscription</a>
            </p>
          </div>
        )}

        {/* Billing Period Toggle */}
        <div className="billing-toggle">
          <button
            className={`toggle-btn ${billingPeriod === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingPeriod('monthly')}
          >
            Monthly
          </button>
          <button
            className={`toggle-btn ${billingPeriod === 'yearly' ? 'active' : ''}`}
            onClick={() => setBillingPeriod('yearly')}
          >
            Yearly
            {plans.length > 0 && (
              <span className="save-badge">
                Save up to {Math.max(...plans.map(p => calculateSavings(p).percent))}%
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="plans-grid">
        {plans.map((plan) => {
          const savings = calculateSavings(plan);
          const isCurrentUserPlan = isCurrentPlan(plan);
          
          return (
            <div
              key={plan._id}
              className={`plan-card ${plan.isPopular ? 'popular' : ''} ${isCurrentUserPlan ? 'current' : ''} ${selectedPlanId === plan._id ? 'selected' : ''}`}
              onClick={() => setSelectedPlanId(plan._id)}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="popular-badge">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentUserPlan && (
                <div className="current-badge">
                  Your Current Plan
                </div>
              )}

              {/* Plan Icon */}
              <div className="plan-icon">
                {getPlanIcon(plan.name)}
              </div>

              {/* Plan Name */}
              <h3 className="plan-name">{plan.name}</h3>
              
              {/* Plan Description */}
              {plan.description && (
                <p className="plan-description">{plan.description}</p>
              )}

              {/* Pricing */}
              <div className="plan-pricing">
                <div className="price-container">
                  <span className="currency">$</span>
                  <span className="price">{getPlanPrice(plan)}</span>
                  <span className="period">
                    /{billingPeriod === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>
                
                {billingPeriod === 'yearly' && savings.amount > 0 && (
                  <div className="savings-text">
                    Save ${savings.amount.toFixed(2)} ({savings.percent}% off)
                  </div>
                )}
              </div>

              {/* Features List */}
              <ul className="features-list">
                {getPlanFeatures(plan).map((feature, idx) => (
                  <li key={idx} className="feature-item">
                    <Check className="feature-check" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Trial Info */}
              {plan.trialDays > 0 && !isCurrentUserPlan && (
                <div className="trial-info">
                  <span className="trial-badge">
                    {plan.trialDays} day free trial
                  </span>
                </div>
              )}

              {/* CTA Button - Only show for logged in users */}
              {isAuthenticated ? (
                <button
                  className={`plan-button ${isCurrentUserPlan ? 'current' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlan(plan);
                  }}
                  disabled={isCurrentUserPlan}
                >
                  {isCurrentUserPlan ? 'Current Plan' : 'Choose This Plan'}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Trust Badges */}
      <div className="trust-section">
        <div className="trust-badges">
          <div className="trust-badge">
            <Shield className="w-6 h-6" />
            <span>Secure Payments</span>
          </div>
          <div className="trust-badge">
            <Check className="w-6 h-6" />
            <span>Cancel Anytime</span>
          </div>
          <div className="trust-badge">
            <Star className="w-6 h-6" />
            <span>24/7 Support</span>
          </div>
        </div>
      </div>

      {/* FAQ Link */}
      <div className="pricing-footer">
        <p className="questions-text">
          Have questions? <a href="/faq">Check our FAQ</a> or{' '}
          <a href="/contact">contact support</a>
        </p>
      </div>
    </div>
  );
};

export default PricingPlans;