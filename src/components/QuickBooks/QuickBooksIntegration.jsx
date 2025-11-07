import React, { useEffect, useState } from 'react';
import { 
  useGetQuickBooksConnectionStatusQuery, 
  useGetQuickBooksAuthUrlMutation, 
  useDisconnectQuickBooksMutation 
} from '../../features/quickbooks/quickbooksApi';
import QuickBooksData from './QuickBooksData';
import './QuickBooksIntegration.css';

const QuickBooksIntegration = () => {
  const { data: connectionStatus, isLoading: statusLoading, refetch: refetchStatus } = 
    useGetQuickBooksConnectionStatusQuery();
  const [getAuthUrl, { isLoading: authUrlLoading }] = useGetQuickBooksAuthUrlMutation();
  const [disconnectQuickBooks, { isLoading: disconnecting }] = useDisconnectQuickBooksMutation();
  
  const [showData, setShowData] = useState(false);
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices', 'customers', 'expenses', 'reports'
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Check if we're connected
  const isConnected = connectionStatus?.data?.connected;
  const companyInfo = connectionStatus?.data;
  
  // Handle query parameters from OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const qbConnected = urlParams.get('qb_connected');
    const company = urlParams.get('company');
    const qbError = urlParams.get('qb_error');
    
    if (qbConnected === 'true' && company) {
      setSuccessMessage(`QuickBooks account "${company}" connected successfully!`);
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (qbError) {
      setError(decodeURIComponent(qbError));
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  
  // Clear messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  // Handle Connect with QuickBooks button click
  const handleConnectQuickBooks = async () => {
    try {
      setError(null);
      console.log('Requesting QuickBooks auth URL...');
      
      const result = await getAuthUrl().unwrap();
      console.log('Auth URL response:', result);
      
      if (result?.data?.authUrl) {
        console.log('Redirecting to QuickBooks OAuth:', result.data.authUrl);
        // Redirect to QuickBooks OAuth page
        window.location.href = result.data.authUrl;
      } else {
        console.error('No auth URL in response:', result);
        setError('Failed to get authorization URL from server.');
      }
    } catch (error) {
      console.error('Failed to get QuickBooks authorization URL:', error);
      setError(error?.data?.message || 'Failed to connect to QuickBooks. Please try again.');
    }
  };
  
  // Handle disconnect
  const handleDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect your QuickBooks account? This will remove access to all QuickBooks data.')) {
      try {
        console.log('Disconnecting QuickBooks...');
        
        await disconnectQuickBooks().unwrap();
        setShowData(false);
        
        // Force refresh the connection status
        setTimeout(() => {
          refetchStatus();
        }, 500);
        
        setError(null);
        alert('QuickBooks account disconnected successfully');
        console.log('✅ QuickBooks disconnected successfully');
      } catch (error) {
        console.error('Failed to disconnect QuickBooks:', error);
        setError('Failed to disconnect QuickBooks account. Please try again.');
      }
    }
  };
  
  // Toggle data view
  const toggleDataView = () => {
    setShowData(!showData);
  };
  
  if (statusLoading) {
    return (
      <div className="quickbooks-integration-container">
        <div className="loading">Checking QuickBooks connection status...</div>
      </div>
    );
  }
  
  return (
    <div className="quickbooks-integration-container">
      <div className="quickbooks-header">
        <div className="header-title">
          <span className="qb-logo">📊</span>
          <h2>QuickBooks Integration</h2>
        </div>
        {isConnected && (
          <span className="connection-status connected">
            <span className="status-dot"></span>
            Connected
          </span>
        )}
      </div>
      
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          {successMessage}
        </div>
      )}
      
      {!isConnected ? (
        <div className="quickbooks-connect-section">
          <div className="connect-info">
            <h3>Connect Your QuickBooks Account</h3>
            <p>
              Connect your QuickBooks Online account to sync financial data, manage invoices, 
              track expenses, and generate comprehensive financial reports directly from this dashboard.
            </p>
            <ul className="benefits-list">
              <li>💰 Manage invoices and bills</li>
              <li>👥 Sync customers and vendors</li>
              <li>📈 Track expenses and revenue</li>
              <li>📊 Generate financial reports (P&L, Balance Sheet)</li>
              <li>🧾 Export tax-ready documents</li>
              <li>🔄 Real-time data synchronization</li>
            </ul>
            
            <div className="quickbooks-badges">
              <span className="badge">QuickBooks Online</span>
              <span className="badge">Bank-Level Security</span>
              <span className="badge">OAuth 2.0</span>
            </div>
          </div>
          
          <button 
            className="quickbooks-connect-btn"
            onClick={handleConnectQuickBooks}
            disabled={authUrlLoading}
          >
            {authUrlLoading ? (
              <>
                <span className="spinner"></span>
                Connecting...
              </>
            ) : (
              <>
                <span className="qb-icon">🔗</span>
                Connect with QuickBooks
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="quickbooks-connected-section">
          <div className="connection-details">
            <div className="company-info">
              <h3>Company Information</h3>
              <div className="info-grid">
                <div className="info-row">
                  <span className="label">Company Name:</span>
                  <span className="value">{companyInfo?.companyName || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Company ID:</span>
                  <span className="value">{companyInfo?.companyId || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{companyInfo?.companyEmail || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Currency:</span>
                  <span className="value">{companyInfo?.baseCurrency || 'USD'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Address:</span>
                  <span className="value">
                    {companyInfo?.companyAddress ? 
                      `${companyInfo.companyAddress.city || ''}, ${companyInfo.companyAddress.state || ''} ${companyInfo.companyAddress.postalCode || ''}`.trim() 
                      : 'N/A'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Last Synced:</span>
                  <span className="value">
                    {companyInfo?.lastSyncedAt
                      ? new Date(companyInfo.lastSyncedAt).toLocaleString()
                      : 'Never'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Connected Since:</span>
                  <span className="value">
                    {companyInfo?.connectedSince
                      ? new Date(companyInfo.connectedSince).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Status:</span>
                  <span className="value">
                    {companyInfo?.isPaused ? (
                      <span className="status-paused">⏸️ Paused</span>
                    ) : companyInfo?.tokenExpired ? (
                      <span className="status-expired">⚠️ Token Expired</span>
                    ) : (
                      <span className="status-active">✅ Active</span>
                    )}
                  </span>
                </div>
              </div>
              
              {/* Company Stats */}
              {companyInfo?.stats && (
                <div className="company-stats">
                  <h4>Quick Stats</h4>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-value">{companyInfo.stats.totalInvoices || 0}</span>
                      <span className="stat-label">Invoices</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">{companyInfo.stats.totalCustomers || 0}</span>
                      <span className="stat-label">Customers</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">{companyInfo.stats.totalExpenses || 0}</span>
                      <span className="stat-label">Expenses</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">{companyInfo.stats.totalBills || 0}</span>
                      <span className="stat-label">Bills</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="action-buttons">
              <button 
                className="view-data-btn"
                onClick={toggleDataView}
              >
                {showData ? 'Hide Data' : 'View QuickBooks Data'}
              </button>
              <button 
                className="disconnect-btn"
                onClick={handleDisconnect}
                disabled={disconnecting}
              >
                {disconnecting ? (
                  <>
                    <span className="spinner"></span>
                    Disconnecting...
                  </>
                ) : (
                  'Disconnect QuickBooks'
                )}
              </button>
            </div>
          </div>
          
          {showData && (
            <div className="quickbooks-data-section">
              <div className="data-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
                  onClick={() => setActiveTab('invoices')}
                >
                  📄 Invoices
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('customers')}
                >
                  👥 Customers
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
                  onClick={() => setActiveTab('expenses')}
                >
                  💸 Expenses
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reports')}
                >
                  📊 Reports
                </button>
              </div>
              <QuickBooksData activeTab={activeTab} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuickBooksIntegration;