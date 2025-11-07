import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './ShopifyCallback.css';

const ShopifyCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Connecting to Shopify...');
  
  useEffect(() => {
    // Get callback parameters from URL
    const success = searchParams.get('success');
    const shop = searchParams.get('shop');
    const error = searchParams.get('error');
    
    // Log all parameters for debugging
    console.log('🔍 Shopify Callback Debug:');
    console.log('  - Current URL:', window.location.href);
    console.log('  - Search params:', Object.fromEntries(searchParams));
    console.log('  - Success:', success);
    console.log('  - Shop:', shop);
    console.log('  - Error:', error);
    
    // Handle the callback based on success/failure
    if (success === 'true') {
      setStatus('success');
      setMessage(`Successfully connected to ${shop || 'your Shopify store'}!`);
      
      // Redirect to dashboard after 2 seconds
      // Note: /dashboard/shopify doesn't exist as a route
      // Navigate to main dashboard instead
      console.log('✅ Success! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } else if (success === 'false') {
      setStatus('error');
      const errorMessage = error ? decodeURIComponent(error) : 'Failed to connect to Shopify';
      setMessage(errorMessage);
      
      // Redirect after 3 seconds
      console.log('❌ Error occurred. Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } else {
      // If no parameters or invalid parameters, something went wrong
      setStatus('error');
      setMessage('Invalid callback parameters. Please try connecting again.');
      console.log('⚠️ Invalid parameters. Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    }
  }, [searchParams, navigate]);
  
  return (
    <div className="shopify-callback-container">
      <div className="callback-card">
        <div className={`status-icon ${status}`}>
          {status === 'processing' && (
            <div className="spinner-icon">
              <div className="spinner"></div>
            </div>
          )}
          {status === 'success' && (
            <div className="success-icon">✅</div>
          )}
          {status === 'error' && (
            <div className="error-icon">❌</div>
          )}
        </div>
        
        <h2 className={`status-title ${status}`}>
          {status === 'processing' && 'Connecting to Shopify'}
          {status === 'success' && 'Connection Successful!'}
          {status === 'error' && 'Connection Failed'}
        </h2>
        
        <p className="message">{message}</p>
        
        <div className="redirect-info">
          <p className="redirect-message">
            Redirecting you back to the dashboard...
          </p>
          {status === 'processing' && (
            <div className="progress-bar">
              <div className="progress-bar-fill"></div>
            </div>
          )}
        </div>
        
        <button
          className="manual-redirect-btn"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  );
};

export default ShopifyCallback;