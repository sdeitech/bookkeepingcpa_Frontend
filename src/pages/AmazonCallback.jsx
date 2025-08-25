import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useHandleAmazonCallbackMutation } from '../features/amazon/amazonApi';
import './AmazonCallback.css';

const AmazonCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [handleCallback, { isLoading }] = useHandleAmazonCallbackMutation();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Check for authorization errors from Amazon
      if (errorParam) {
        setError(`Amazon authorization failed: ${errorDescription || errorParam}`);
        setTimeout(() => {
          navigate('/dashboard');
        }, 5000);
        return;
      }

      // Check if we have the required parameters
      if (!code || !state) {
        setError('Missing authorization code or state parameter');
        setTimeout(() => {
          navigate('/dashboard');
        }, 5000);
        return;
      }

      try {
        // Send the callback data to the backend
        const result = await handleCallback({ code, state }).unwrap();
        
        if (result.success) {
          // Success! Redirect to dashboard
          setTimeout(() => {
            navigate('/dashboard', { 
              state: { 
                amazonConnected: true,
                message: 'Amazon account connected successfully!' 
              } 
            });
          }, 2000);
        } else {
          setError(result.message || 'Failed to connect Amazon account');
          setTimeout(() => {
            navigate('/dashboard');
          }, 5000);
        }
      } catch (err) {
        console.error('Callback processing error:', err);
        setError(err.data?.message || 'Failed to process Amazon authorization');
        setTimeout(() => {
          navigate('/dashboard');
        }, 5000);
      }
    };

    processCallback();
  }, [searchParams, handleCallback, navigate]);

  return (
    <div className="amazon-callback-container">
      <div className="callback-content">
        {error ? (
          <>
            <div className="callback-error">
              <div className="error-icon">❌</div>
              <h2>Connection Failed</h2>
              <p>{error}</p>
              <p className="redirect-message">Redirecting to dashboard...</p>
            </div>
          </>
        ) : isLoading ? (
          <>
            <div className="callback-loading">
              <div className="spinner"></div>
              <h2>Connecting to Amazon</h2>
              <p>Please wait while we complete the connection...</p>
            </div>
          </>
        ) : (
          <>
            <div className="callback-success">
              <div className="success-icon">✅</div>
              <h2>Successfully Connected!</h2>
              <p>Your Amazon seller account has been connected.</p>
              <p className="redirect-message">Redirecting to dashboard...</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AmazonCallback;