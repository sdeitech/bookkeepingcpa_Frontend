import React from 'react';
import { onboardingStorage } from '../../../utils/onboardingStorage';

class OnboardingErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Onboarding Error:', error, errorInfo);
    
    // Save current state to localStorage as backup
    try {
      const currentData = onboardingStorage.get();
      if (currentData) {
        localStorage.setItem('onboarding_backup', JSON.stringify({
          data: currentData,
          error: error.toString(),
          timestamp: new Date().toISOString()
        }));
      }
    } catch (storageError) {
      console.error('Failed to save backup:', storageError);
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Optionally reload the page
    window.location.reload();
  };

  handleRecoverBackup = () => {
    try {
      const backup = localStorage.getItem('onboarding_backup');
      if (backup) {
        const { data } = JSON.parse(backup);
        onboardingStorage.save(data);
        this.handleReset();
      }
    } catch (error) {
      console.error('Failed to recover backup:', error);
      alert('Failed to recover backup data. Please try again.');
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="onboarding-error-boundary">
          <div className="error-container">
            <h2>Oops! Something went wrong</h2>
            <p>We encountered an error while processing your onboarding information.</p>
            <p>Don't worry, your progress has been saved.</p>
            
            {process.env.NODE_ENV === 'development' && (
              <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
                <summary>Error Details (Development Only)</summary>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </details>
            )}
            
            <div className="error-actions">
              <button onClick={this.handleReset} className="btn btn-primary">
                Try Again
              </button>
              <button onClick={this.handleRecoverBackup} className="btn btn-secondary">
                Recover Last Save
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default OnboardingErrorBoundary;