import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import config from '../../../../config';
import {
  CreditCard,
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import {
  useCreateSubscriptionMutation,
  useProcessPaymentMutation,
  useUpdateBillingInfoMutation
} from '../../../../features/subscription/subscriptionApi';
import './CheckoutForm.scss';

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

const CheckoutForm = ({ plan, billingPeriod, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  // Redux state
  const { user } = useSelector(state => state.auth);
  
  // RTK Query mutations
  const [createSubscription] = useCreateSubscriptionMutation();
  const [processPayment] = useProcessPaymentMutation();
  const [updateBillingInfo] = useUpdateBillingInfoMutation();
  
  // Local state
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
    
    if (!plan) {
      setErrorMessage('No plan selected. Please go back and select a plan.');
      return;
    }
    
    setProcessing(true);
    setErrorMessage('');
    
    // Debug logging for checkout process
    console.log('[DEBUG] Starting checkout process:', {
      planId: plan._id,
      planName: plan.name,
      billingPeriod,
      stripeLoaded: !!stripe,
      elementsLoaded: !!elements
    });
    
    try {
      // Step 1: Create payment method
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
      
      // Step 2: Update billing info
      await updateBillingInfo({
        ...billingInfo,
        paymentMethodId: paymentMethod.id
      }).unwrap();
      
      // Step 3: Create subscription
      console.log('[DEBUG] Creating subscription with:', {
        planId: plan._id,
        billingPeriod,
        paymentMethodId: paymentMethod.id,
        apiEndpoint: config?.api?.baseUrl
      });
      
      const subscriptionResult = await createSubscription({
        planId: plan._id,
        billingPeriod: billingPeriod,
        paymentMethodId: paymentMethod.id,
        billingInfo
      }).unwrap();
      
      console.log('[DEBUG] Subscription API Response:', {
        status: subscriptionResult?.data?.status || subscriptionResult?.status,
        requiresAction: subscriptionResult?.data?.requiresAction || subscriptionResult?.requiresAction,
        hasClientSecret: !!(subscriptionResult?.data?.clientSecret || subscriptionResult?.clientSecret)
      });
      
      const subscriptionData = subscriptionResult.data || subscriptionResult;
      
      // Step 4: Check if payment confirmation is needed
      if (subscriptionData.requiresAction ||
          subscriptionData.status === 'incomplete' ||
          subscriptionData.paymentIntentStatus === 'requires_confirmation' ||
          subscriptionData.paymentIntentStatus === 'requires_action') {
        
        if (!subscriptionData.clientSecret) {
          setErrorMessage('Payment confirmation required but no client secret provided');
          setProcessing(false);
          return;
        }
        
        // Confirm payment
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          subscriptionData.clientSecret,
          {
            payment_method: paymentMethod.id
          }
        );
        
        if (confirmError) {
          setErrorMessage(confirmError.message);
          setProcessing(false);
          return;
        }
        
        // Optional: Notify backend about successful payment
        if (subscriptionData.paymentIntentId && paymentIntent?.status === 'succeeded') {
          try {
            await processPayment({
              subscriptionId: subscriptionData.subscriptionId,
              paymentIntentId: subscriptionData.paymentIntentId
            }).unwrap();
          } catch (processError) {
            console.warn('Payment processing notification failed:', processError);
          }
        }
      }
      
      // Success!
      setSuccessMessage('Payment successful! Redirecting to your dashboard...');
      setProcessing(false);
      
      // Trigger success callback
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (error) {
      console.error('[DEBUG] Payment error full details:', {
        errorType: error?.data?.error?.type,
        errorMessage: error?.data?.error?.message || error?.data?.message,
        errorStatus: error?.status,
        fullError: error
      });
      
      // Check if it's specifically a Stripe API key error
      if (error?.data?.error?.message?.includes('Invalid API Key')) {
        console.error('[CRITICAL] Stripe API Key Error Detected!', {
          errorMessage: error.data.error.message,
          suggestedFix: 'Backend is likely using publishable key (pk_) instead of secret key (sk_)'
        });
      }
      
      setErrorMessage(error?.data?.error?.message || error?.data?.message || error?.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };
  
  const calculatePrice = () => {
    if (!plan) return 0;
    return billingPeriod === 'yearly' 
      ? plan.pricePerYear || 0
      : plan.pricePerMonth || 0;
  };
  
  const getPeriodLabel = () => {
    return billingPeriod === 'yearly' ? 'per year' : 'per month';
  };
  
  return (
    <div className="checkout-form-container">

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
                disabled={processing}
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
                disabled={processing}
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
                disabled={processing}
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
                disabled={processing}
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
                disabled={processing}
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
                disabled={processing}
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
                disabled={processing}
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
        
        {/* Order Summary */}
        <div className="order-summary-inline">
          <div className="summary-row">
            <span>Total Due Today</span>
            <span className="total-amount">
              ${plan?.trialDays > 0 ? '0.00' : calculatePrice()}
            </span>
          </div>
          {plan?.trialDays > 0 && (
            <p className="trial-note">
              You won't be charged until after your {plan.trialDays}-day trial ends.
            </p>
          )}
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          className="submit-button"
          disabled={processing || !stripe || !cardComplete}
        >
          {processing ? (
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
      
      {/* Need Help */}
      <div className="need-help">
        <h3>Need Help?</h3>
        <p>Contact our support team</p>
        <a href="mailto:support@plurify.com">support@plurify.com</a>
      </div>
    </div>
  );
};

export default CheckoutForm;