import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  Check,
  Star,
  Zap,
  Shield,
  Users,
  ArrowLeft,
  X
} from 'lucide-react';
import {
  useGetSubscriptionPlansQuery,
  useGetUserSubscriptionQuery
} from '../../../features/subscription/subscriptionApi';
import CheckoutForm from './components/CheckoutForm';
import './PricingCheckout.scss';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51S0gniDBKob6EriCGAcsv8r6PFJX9I0Vi8EnjXpew9qfEg64YgKzbpj2TjC31piigQNSlv0Tw9bUBDJBWQMelQt600e8nOWh6Q');

const PricingCheckout = () => {
  const navigate = useNavigate();

  // State management
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [showCheckout, setShowCheckout] = useState(false);

  // Redux state
  const { isAuthenticated, user } = useSelector(state => state.auth);

  // RTK Query hooks
  const {
    data: plansData,
    isLoading: plansLoading,
    error: plansError,
    refetch: refetchPlans
  } = useGetSubscriptionPlansQuery(undefined, {
    refetchOnMountOrArgChange: true
  });

  const {
    data: subscriptionData,
    isLoading: subscriptionLoading
  } = useGetUserSubscriptionQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true
  });

  const plans = plansData?.data || [];
  const currentSubscription = subscriptionData?.data;
  const selectedPlan = plans.find(plan => plan._id === selectedPlanId);

  const handleSelectPlan = (plan) => {
    if (isCurrentPlan(plan)) return;

    if (!isAuthenticated) {
      // Save selection to session storage before redirecting to login
      sessionStorage.setItem('selectedPlan', JSON.stringify(plan));
      sessionStorage.setItem('billingPeriod', billingPeriod);
      navigate('/login', {
        state: {
          from: '/pricing',
          message: 'Please login to continue with your purchase'
        }
      });
      return;
    }

    // Set selected plan and show checkout
    setSelectedPlanId(plan._id);
    setShowCheckout(true);
  };

  const handleBackToPlans = () => {
    setShowCheckout(false);
    // Small delay to reset selected plan after animation
    setTimeout(() => {
      setSelectedPlanId(null);
    }, 600);
  };

  const handlePaymentSuccess = () => {
    // Redirect to dashboard after successful payment
    navigate('/dashboard', {
      state: {
        message: 'Welcome! Your subscription is now active.',
        subscriptionSuccess: true
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
    if (plan.features && Array.isArray(plan.features) && typeof plan.features[0] === 'string') {
      return plan.features;
    }

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
        <p>Error loading plans: {plansError?.data?.message || 'An error occurred'}</p>
        <button onClick={() => refetchPlans()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className={`pricing-checkout-container ${showCheckout ? 'checkout-mode' : 'plans-mode'}`}>
      {/* Header - Always visible */}
      <div className="pricing-header">
        {!showCheckout ? (
          <>
            <div className="pricing_header_innerwrapper">
              <h1 className="pricing-title" >Choose the <span> Best Plan </span>for you</h1>
              <p className="pricing-subtitle">
                Select the perfect plan for your e-commerce business
              </p>
            </div>


            {/* Current subscription info */}
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
          </>
        ) : (
          <button className="back-button" onClick={handleBackToPlans}>
            <ArrowLeft className="w-5 h-5" />
            <span>Back to all plans</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="content_container">
        <div className="content-area">
          {/* Plans Grid with selected plan moving to left */}
          <div className="plans-section payment_sec">
            <div className="plans-grid">
              {plans.map((plan) => {
                const savings = calculateSavings(plan);
                const isCurrentUserPlan = isCurrentPlan(plan);
                const isSelected = plan._id === selectedPlanId;

                return (
                  <div
                    key={plan._id}
                    className={`plan-card ${plan.isPopular ? 'popular' : ''} ${isCurrentUserPlan ? 'current' : ''} ${isSelected ? 'selected' : ''} ${showCheckout && !isSelected ? 'hidden' : ''}`}
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
                      <div className="current-badge">Your Current Plan</div>
                    )}
                    <div className="plan_upperwrapper">
                      <div className="plan-icon">{getPlanIcon(plan.name)}</div>
                      <div className="plan_wrapper">
                        <h3 className="plan-name">{plan.name}</h3>
                        {plan.description && (
                          <p className="plan-description">{plan.description}</p>
                        )}
                      </div>


                      <div className="plan-pricing">
                        <div className="price-container">
                          <span className="currency">$</span>
                          <span className="price">{getPlanPrice(plan)}</span>
                          <span className="period">/{billingPeriod === 'yearly' ? 'year' : 'month'}</span>
                        </div>

                        {billingPeriod === 'yearly' && savings.amount > 0 && (
                          <div className="savings-text">
                            Save ${savings.amount.toFixed(2)} ({savings.percent}% off)
                          </div>
                        )}
                      </div>
                    </div>



                    <div className="mid_wrapper">
                      {(!showCheckout || !isSelected) && (
                        <button
                          className={`plan-button ${isCurrentUserPlan ? 'current' : ''}`}
                          onClick={() => handleSelectPlan(plan)}
                          disabled={isCurrentUserPlan}
                        >
                          {isCurrentUserPlan ? 'Current Plan' : 'Choose This Plan'}
                        </button>
                      )}
                    </div>


                    {/* Features List */}
                    <div className="bottom_wrapper">
                      <h4 class="includes">Startup Plan Includes</h4>
                      <ul className="features-list">
                        {getPlanFeatures(plan).map((feature, idx) => (
                          <li key={idx} className="feature-item">
                            <Check className="feature-check" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>


                    {/* Trial Info */}
                    {plan.trialDays > 0 && !isCurrentUserPlan && (
                      <div className="trial-info">
                        <span className="trial-badge">{plan.trialDays} day free trial</span>
                      </div>
                    )}



                    {/* Billing toggle when selected */}
                    {showCheckout && isSelected && (
                      <div className="billing-toggle-selected">
                        <label>Billing Period:</label>
                        <div className="toggle-buttons">
                          <button
                            className={billingPeriod === 'monthly' ? 'active' : ''}
                            onClick={() => setBillingPeriod('monthly')}
                          >
                            Monthly
                          </button>
                          <button
                            className={billingPeriod === 'yearly' ? 'active' : ''}
                            onClick={() => setBillingPeriod('yearly')}
                          >
                            Yearly
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Checkout Form - Slides in from right */}
          <div className={`checkout-section ${showCheckout ? 'visible' : ''}`}>
            {showCheckout && selectedPlan && (
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  plan={selectedPlan}
                  billingPeriod={billingPeriod}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handleBackToPlans}
                />
              </Elements>
            )}
          </div>
        </div>
      </div>


      {/* Trust Badges - Only show in plans mode */}
      {!showCheckout && (
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
      )}
    </div>
  );
};

export default PricingCheckout;