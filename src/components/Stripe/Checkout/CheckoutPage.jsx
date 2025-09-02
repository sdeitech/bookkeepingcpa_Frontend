import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  CardElement,
  useStripe,
  useElements,
  Elements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  CreditCard,
  Lock,
  Shield,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  useCreateSubscriptionMutation,
  useProcessPaymentMutation,
  useUpdateBillingInfoMutation,
  useCreatePaymentIntentMutation
} from '../../../features/subscription/subscriptionApi';
import './CheckoutPage.scss';

// Initialize Stripe (replace with your publishable key from env)
const stripePromise = loadStripe('pk_test_51S0gniDBKob6EriCGAcsv8r6PFJX9I0Vi8EnjXpew9qfEg64YgKzbpj2TjC31piigQNSlv0Tw9bUBDJBWQMelQt600e8nOWh6Q');

// Card Element Options
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    invalid: {
      color: '#dc3545',
      iconColor: '#dc3545'
    }
  },
  hidePostalCode: false
};

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redux state
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  // RTK Query mutations
  const [createSubscription, { isLoading: isCreatingSubscription }] = useCreateSubscriptionMutation();
  const [processPayment, { isLoading: isProcessingPayment }] = useProcessPaymentMutation();
  const [updateBillingInfo, { isLoading: isUpdatingBilling }] = useUpdateBillingInfoMutation();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  
  // Local state
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [billingInfo, setBillingInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });
  
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Get plan from navigation state or session storage
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: '/checkout',
          message: 'Please login to continue with checkout'
        }
      });
      return;
    }

    // Get plan from location state or session storage
    const statePlan = location.state?.plan;
    const stateBillingPeriod = location.state?.billingPeriod;
    
    if (statePlan) {
      setSelectedPlan(statePlan);
      if (stateBillingPeriod) {
        setBillingPeriod(stateBillingPeriod);
      }
    } else {
      // Check session storage
      const savedPlan = sessionStorage.getItem('selectedPlan');
      const savedBillingPeriod = sessionStorage.getItem('billingPeriod');
      
      if (savedPlan) {
        try {
          setSelectedPlan(JSON.parse(savedPlan));
          if (savedBillingPeriod) {
            setBillingPeriod(savedBillingPeriod);
          }
          // Clear session storage
          sessionStorage.removeItem('selectedPlan');
          sessionStorage.removeItem('billingPeriod');
        } catch (e) {
          console.error('Failed to parse saved plan:', e);
          navigate('/pricing');
        }
      } else {
        // No plan selected, redirect to pricing
        navigate('/pricing');
      }
    }
  }, [isAuthenticated, location, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setErrorMessage(event.error.message);
    } else {
      setErrorMessage('');
    }
  };

  const validateForm = () => {
    if (!billingInfo.name || !billingInfo.email) {
      setErrorMessage('Please fill in all required fields');
      return false;
    }
    
    if (!cardComplete) {
      setErrorMessage('Please enter valid card details');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!stripe || !elements) {
      setErrorMessage('Stripe has not loaded yet. Please try again.');
      return;
    }
    
    if (!selectedPlan) {
      setErrorMessage('No plan selected. Please go back and select a plan.');
      return;
    }
    
    setProcessing(true);
    setErrorMessage('');
    
    try {
      // Step 1: Create payment method with Stripe
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          name: billingInfo.name,
          email: billingInfo.email,
          address: {
            line1: billingInfo.address,
            city: billingInfo.city,
            state: billingInfo.state,
            postal_code: billingInfo.zipCode,
            country: billingInfo.country
          }
        }
      });
      
      if (stripeError) {
        setErrorMessage(stripeError.message);
        setProcessing(false);
        return;
      }
      
      // Step 2: Update billing info in backend
      await updateBillingInfo({
        ...billingInfo,
        paymentMethodId: paymentMethod.id
      }).unwrap();
      
      // Step 3: Create subscription with the payment method
      const subscriptionResult = await createSubscription({
        planId: selectedPlan._id,
        billingPeriod: billingPeriod,
        paymentMethodId: paymentMethod.id,
        billingInfo
      }).unwrap();
      
      console.log('Subscription created response:', subscriptionResult);
      
      // Extract the data from the response
      const subscriptionData = subscriptionResult.data || subscriptionResult;
      
      // Step 4: Check if payment confirmation is needed
      // For subscriptions, we need to confirm payment when status is 'incomplete'
      if (subscriptionData.requiresAction ||
          subscriptionData.status === 'incomplete' ||
          subscriptionData.paymentIntentStatus === 'requires_confirmation' ||
          subscriptionData.paymentIntentStatus === 'requires_action') {
        
        if (!subscriptionData.clientSecret) {
          console.error('No client secret provided for payment confirmation');
          setErrorMessage('Payment confirmation required but no client secret provided');
          setProcessing(false);
          return;
        }
        
        console.log('Confirming payment with client secret...');
        
        // Confirm the payment
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          subscriptionData.clientSecret,
          {
            payment_method: paymentMethod.id
          }
        );
        
        if (confirmError) {
          console.error('Payment confirmation error:', confirmError);
          setErrorMessage(confirmError.message);
          setProcessing(false);
          return;
        }
        
        console.log('Payment confirmed successfully:', paymentIntent);
        
        // Optional: Notify backend about successful payment
        if (subscriptionData.paymentIntentId && paymentIntent?.status === 'succeeded') {
          try {
            await processPayment({
              subscriptionId: subscriptionData.subscriptionId,
              paymentIntentId: subscriptionData.paymentIntentId
            }).unwrap();
          } catch (processError) {
            console.warn('Payment processing notification failed:', processError);
            // Don't fail the whole flow if this optional step fails
          }
        }
      } else if (subscriptionData.status === 'trialing') {
        console.log('Subscription is in trial period, no payment needed');
      } else if (subscriptionData.status === 'active') {
        console.log('Subscription is already active');
      }
      
      // Success!
      setSuccessMessage('Payment successful! Redirecting to your dashboard...');
      setProcessing(false);
      
      // Clear form and redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard', {
          state: {
            message: 'Welcome! Your subscription is now active.',
            subscriptionSuccess: true
          }
        });
      }, 2000);
      
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error?.data?.message || error?.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const calculatePrice = () => {
    if (!selectedPlan) return 0;
    return billingPeriod === 'yearly' 
      ? selectedPlan.pricePerYear || 0
      : selectedPlan.pricePerMonth || 0;
  };

  const getPeriodLabel = () => {
    return billingPeriod === 'yearly' ? 'per year' : 'per month';
  };

  const isLoading = isCreatingSubscription || isProcessingPayment || isUpdatingBilling || processing;

  if (!selectedPlan) {
    return (
      <div className="checkout-loading">
        <Loader2 className="spinner" />
        <p>Loading checkout...</p>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">
        {/* Back Button */}
        <button 
          className="back-button"
          onClick={() => navigate('/pricing')}
          disabled={isLoading}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Pricing
        </button>

        <div className="checkout-content">
          {/* Left Column - Form */}
          <div className="checkout-form-section">
            <h1 className="checkout-title">Complete Your Purchase</h1>
            
            {/* Success Message */}
            {successMessage && (
              <div className="alert alert-success">
                <CheckCircle className="w-5 h-5" />
                <span>{successMessage}</span>
              </div>
            )}
            
            {/* Error Message */}
            {errorMessage && (
              <div className="alert alert-error">
                <AlertCircle className="w-5 h-5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="checkout-form">
              {/* Billing Information */}
              <div className="form-section">
                <h2 className="section-title">Billing Information</h2>
                
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={billingInfo.name}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={billingInfo.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label htmlFor="address">Street Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={billingInfo.address}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="123 Main St"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={billingInfo.city}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="New York"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={billingInfo.state}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="NY"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="zipCode">ZIP Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={billingInfo.zipCode}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="10001"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <select
                      id="country"
                      name="country"
                      value={billingInfo.country}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="IN">India</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="form-section">
                <h2 className="section-title">
                  <CreditCard className="w-5 h-5" />
                  Payment Details
                </h2>
                
                <div className="card-element-wrapper">
                  <CardElement 
                    options={cardElementOptions}
                    onChange={handleCardChange}
                  />
                </div>
                
                <div className="security-badges">
                  <div className="badge">
                    <Lock className="w-4 h-4" />
                    <span>Secure SSL Encryption</span>
                  </div>
                  <div className="badge">
                    <Shield className="w-4 h-4" />
                    <span>PCI Compliant</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading || !stripe || !cardComplete}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="spinner mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Pay ${calculatePrice()} {getPeriodLabel()}
                  </>
                )}
              </button>

              {/* Terms */}
              <p className="terms-text">
                By confirming your subscription, you agree to our{' '}
                <a href="/terms">Terms of Service</a> and{' '}
                <a href="/privacy">Privacy Policy</a>.
                You can cancel your subscription at any time.
              </p>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-summary-section">
            <div className="order-summary">
              <h2 className="summary-title">Order Summary</h2>
              
              {/* Selected Plan */}
              <div className="plan-details">
                <h3 className="plan-name">{selectedPlan.name}</h3>
                <p className="plan-description">{selectedPlan.description}</p>
                
                <div className="plan-features">
                  <h4>Includes:</h4>
                  <ul>
                    {selectedPlan.maxProducts && (
                      <li>Up to {selectedPlan.maxProducts} products</li>
                    )}
                    {selectedPlan.maxStores && (
                      <li>{selectedPlan.maxStores} store{selectedPlan.maxStores > 1 ? 's' : ''}</li>
                    )}
                    {selectedPlan.features && Array.isArray(selectedPlan.features) && 
                      selectedPlan.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))
                    }
                  </ul>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="pricing-breakdown">
                <div className="price-row">
                  <span>Subscription ({billingPeriod})</span>
                  <span>${calculatePrice()}</span>
                </div>
                
                {selectedPlan.trialDays > 0 && (
                  <div className="trial-info">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{selectedPlan.trialDays}-day free trial included</span>
                  </div>
                )}
                
                <div className="divider"></div>
                
                <div className="price-row total">
                  <span>Total Due Today</span>
                  <span className="total-amount">
                    ${selectedPlan.trialDays > 0 ? '0.00' : calculatePrice()}
                  </span>
                </div>
                
                {selectedPlan.trialDays > 0 && (
                  <p className="trial-note">
                    You won't be charged until after your {selectedPlan.trialDays}-day trial ends.
                  </p>
                )}
              </div>

              {/* Guarantees */}
              <div className="guarantees">
                <div className="guarantee-item">
                  <CheckCircle className="w-5 h-5" />
                  <div>
                    <strong>Cancel Anytime</strong>
                    <p>No questions asked</p>
                  </div>
                </div>
                <div className="guarantee-item">
                  <Shield className="w-5 h-5" />
                  <div>
                    <strong>Secure Payment</strong>
                    <p>256-bit SSL encryption</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Need Help */}
            <div className="need-help">
              <h3>Need Help?</h3>
              <p>Contact our support team</p>
              <a href="mailto:support@plurify.com">support@plurify.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component wrapped with Stripe Elements provider
const CheckoutPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default CheckoutPage;