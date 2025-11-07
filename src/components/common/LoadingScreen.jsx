import React from 'react';

const LoadingScreen = ({ message = 'Loading...', inline = false }) => {
  // Inline styles to prevent any CSS conflicts
  const containerStyles = inline ? {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: 'transparent',
    position: 'relative'
  } : {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999
  };

  const spinnerStyles = inline ? {
    width: '30px',
    height: '30px',
    border: '3px solid rgba(102, 126, 234, 0.3)',
    borderTop: '3px solid #667eea',
    borderRadius: '50%',
    animation: 'plurify-spin 1s linear infinite',
    marginBottom: '15px'
  } : {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid #ffffff',
    borderRadius: '50%',
    animation: 'plurify-spin 1s linear infinite',
    marginBottom: '20px'
  };

  const messageStyles = inline ? {
    color: '#333',
    fontSize: '14px',
    fontWeight: '500',
    margin: 0,
    textAlign: 'center'
  } : {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '500',
    margin: 0,
    textAlign: 'center'
  };

  // Add keyframes animation using a style tag
  React.useEffect(() => {
    const styleId = 'plurify-loading-animation';
    
    // Check if animation already exists
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes plurify-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    // Cleanup on unmount
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle && !document.querySelector('[data-plurify-loading]')) {
        existingStyle.remove();
      }
    };
  }, []);

  return (
    <div style={containerStyles} data-plurify-loading="true">
      <div style={spinnerStyles}></div>
      <p style={messageStyles}>{message}</p>
    </div>
  );
};

export default LoadingScreen;