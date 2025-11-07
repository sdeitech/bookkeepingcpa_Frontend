import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useHandleQuickBooksCallbackMutation } from '../features/quickbooks/quickbooksApi';
import './QuickBooksCallback.css';

const QuickBooksCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [handleCallback] = useHandleQuickBooksCallbackMutation();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    const processCallback = async () => {
      console.log('Processing QuickBooks OAuth callback...');
      
      // Get query parameters
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const realmId = searchParams.get('realmId');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      const qbConnected = searchParams.get('qb_connected');
      const company = searchParams.get('company');
      
      // Check for OAuth errors
      if (error) {
        console.error('OAuth error:', error, errorDescription);
        setStatus('error');
        setErrorMessage(errorDescription || 'Authorization denied or cancelled.');
        
        // Redirect to dashboard with quickbooks tab after delay
        setTimeout(() => {
          navigate('/dashboard?tab=quickbooks&error=true');
        }, 3000);
        return;
      }
      
      // Check for required parameters
      if (!code || !realmId) {
        console.error('Missing required OAuth parameters');
        setStatus('error');
        setErrorMessage('Invalid authorization response. Missing required parameters.');
        
        setTimeout(() => {
          navigate('/dashboard?tab=quickbooks&error=true');
        }, 3000);
        return;
      }
      
      try {
        console.log('Sending callback data to backend:', {
          code: code.substring(0, 20) + '...',
          realmId,
          state
        });
        
        // Send the authorization code to backend
        const result = await handleCallback({
          code,
          realmId,
          state
        }).unwrap();
        
        console.log('QuickBooks connection successful:', result);
        
        setStatus('success');
        
        // Redirect to dashboard with quickbooks tab after success
        const successParams = new URLSearchParams({
          tab: 'quickbooks',
          connected: 'true',
          ...(company && { company })
        });
        
        setTimeout(() => {
          navigate(`/dashboard?${successParams.toString()}`);
        }, 2000);
        
      } catch (error) {
        console.error('Failed to connect QuickBooks:', error);
        setStatus('error');
        setErrorMessage(
          error?.data?.message ||
          error?.message ||
          'Failed to connect your QuickBooks account. Please try again.'
        );
        
        // Redirect after error
        setTimeout(() => {
          navigate('/dashboard?tab=quickbooks&error=true');
        }, 3000);
      }
    };
    
    processCallback();
  }, [location, handleCallback, navigate]);
  
  return (
    <div className="quickbooks-callback-container">
      <div className="callback-card">
        {/* QuickBooks Logo/Icon */}
        <div className="qb-logo-container">
          <span className="qb-logo-large">📊</span>
        </div>
        
        {status === 'processing' && (
          <>
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
            <h2>Connecting to QuickBooks...</h2>
            <p>Please wait while we establish a secure connection with your QuickBooks account.</p>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#48BB78"/>
                <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>Successfully Connected!</h2>
            <p>Your QuickBooks account has been connected successfully.</p>
            <p className="redirect-message">Redirecting to your integration dashboard...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="error-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#F56565"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>Connection Failed</h2>
            <p className="error-message">{errorMessage}</p>
            <p className="redirect-message">Redirecting back to QuickBooks integration...</p>
          </>
        )}
        
        {/* Manual navigation option */}
        <div className="manual-nav">
          <button
            onClick={() => navigate('/dashboard?tab=quickbooks')}
            className="back-btn"
          >
            Return to QuickBooks Integration
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickBooksCallback;