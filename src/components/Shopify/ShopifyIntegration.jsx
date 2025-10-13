import React, { useState, useEffect } from 'react';
import { 
  useGetShopifyConnectionStatusQuery, 
  useLazyGetShopifyAuthUrlQuery, 
  useDisconnectShopifyMutation 
} from '../../features/shopify/shopifyApi';
import ShopifyOrders from './ShopifyOrders';
import './ShopifyIntegration.css';

const ShopifyIntegration = () => {
  const { data: connectionStatus, isLoading: statusLoading, refetch: refetchStatus } = 
    useGetShopifyConnectionStatusQuery();
  const [getAuthUrl, { isLoading: authUrlLoading }] = useLazyGetShopifyAuthUrlQuery();
  const [disconnectShopify, { isLoading: disconnecting }] = useDisconnectShopifyMutation();
  
  const [shopDomain, setShopDomain] = useState('');
  const [showOrders, setShowOrders] = useState(false);
  const [error, setError] = useState(null);
  const [lastConnectedShop, setLastConnectedShop] = useState('');
  
  // Check if we're connected
  const isConnected = connectionStatus?.data?.connected;
  const storeInfo = connectionStatus?.data?.store;
  
  // Remember the last connected shop domain
  useEffect(() => {
    if (storeInfo?.shopDomain && !lastConnectedShop) {
      setLastConnectedShop(storeInfo.shopDomain);
      // Pre-fill the shop domain field if we disconnect
      if (!isConnected && storeInfo.shopDomain) {
        setShopDomain(storeInfo.shopDomain);
      }
    }
  }, [storeInfo, lastConnectedShop, isConnected]);
  
  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // Format shop domain
  const formatShopDomain = (domain) => {
    let formatted = domain.trim().toLowerCase();
    // Remove https:// or http:// if present
    formatted = formatted.replace(/^https?:\/\//, '');
    // Ensure it ends with .myshopify.com
    if (!formatted.includes('.myshopify.com')) {
      if (!formatted.includes('.')) {
        formatted = `${formatted}.myshopify.com`;
      }
    }
    return formatted;
  };
  
  // Handle Connect with Shopify button click
  const handleConnectShopify = async () => {
    if (!shopDomain) {
      setError('Please enter your shop domain');
      return;
    }
    
    try {
      setError(null);
      const formattedShop = formatShopDomain(shopDomain);
      console.log('Requesting auth URL for shop:', formattedShop);
      
      const result = await getAuthUrl(formattedShop).unwrap();
      console.log('Auth URL response:', result);
      
      // The backend returns { success, message, data: { authUrl, state } }
      // RTK Query unwraps this to just the response object
      if (result?.data?.authUrl) {
        console.log('Redirecting to:', result.data.authUrl);
        // Redirect to Shopify OAuth page
        window.location.href = result.data.authUrl;
      } else if (result?.authUrl) {
        // In case RTK Query already unwrapped it
        console.log('Redirecting to:', result.authUrl);
        window.location.href = result.authUrl;
      } else {
        console.error('No auth URL in response:', result);
        setError('Failed to get authorization URL from server.');
      }
    } catch (error) {
      console.error('Failed to get Shopify authorization URL:', error);
      setError(error?.data?.message || 'Failed to connect to Shopify. Please check your shop domain and try again.');
    }
  };
  
  // Handle disconnect
  const handleDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect your Shopify store?')) {
      try {
        console.log('Disconnecting Shopify store...');
        const currentShopDomain = storeInfo?.shopDomain;
        
        await disconnectShopify().unwrap();
        setShowOrders(false);
        
        // Pre-fill the shop domain for easy reconnection
        if (currentShopDomain) {
          setShopDomain(currentShopDomain);
          setLastConnectedShop(currentShopDomain);
        }
        
        // Force refresh the connection status
        setTimeout(() => {
          refetchStatus();
        }, 500);
        
        setError(null);
        console.log('✅ Shopify store disconnected successfully');
      } catch (error) {
        console.error('Failed to disconnect Shopify:', error);
        setError('Failed to disconnect Shopify store. Please try again.');
      }
    }
  };
  
  // Toggle orders view
  const toggleOrdersView = () => {
    setShowOrders(!showOrders);
  };
  
  if (statusLoading) {
    return (
      <div className="shopify-integration-container">
        <div className="loading">Checking Shopify connection status...</div>
      </div>
    );
  }
  
  return (
    <div className="shopify-integration-container">
      <div className="shopify-header">
        <h2>🛍️ Shopify Store Integration</h2>
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
      
      {!isConnected ? (
        <div className="shopify-connect-section">
          <div className="connect-info">
            <h3>Connect Your Shopify Store</h3>
            <p>
              Connect your Shopify store to view and manage orders directly from this dashboard.
            </p>
            <ul className="benefits-list">
              <li>📦 View and manage orders</li>
              <li>🛍️ Real-time order sync</li>
              <li>📊 Order analytics and insights</li>
              <li>🚀 Streamlined workflow</li>
            </ul>
          </div>
          
          <div className="connect-form">
            <label htmlFor="shop-domain">Store Domain</label>
            <input
              id="shop-domain"
              type="text"
              placeholder="your-store.myshopify.com"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleConnectShopify()}
              className="shop-domain-input"
            />
            <span className="input-hint">
              {lastConnectedShop
                ? `Previously connected: ${lastConnectedShop}`
                : 'Enter your Shopify store domain (e.g., store-name.myshopify.com)'}
            </span>
            
            <button 
              className="shopify-connect-btn"
              onClick={handleConnectShopify}
              disabled={authUrlLoading || !shopDomain}
            >
              {authUrlLoading ? 'Connecting...' : 'Connect with Shopify'}
            </button>
          </div>
        </div>
      ) : (
        <div className="shopify-connected-section">
          <div className="connection-details">
            <div className="store-info">
              <h3>Store Information</h3>
              <div className="info-row">
                <span className="label">Store Name:</span>
                <span className="value">{storeInfo?.shopName || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="label">Domain:</span>
                <span className="value">{storeInfo?.shopDomain || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{storeInfo?.shopEmail || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="label">Plan:</span>
                <span className="value">{storeInfo?.shopPlan || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="label">Country:</span>
                <span className="value">{storeInfo?.shopCountry || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="label">Currency:</span>
                <span className="value">{storeInfo?.shopCurrency || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="label">Last Synced:</span>
                <span className="value">
                  {storeInfo?.lastSyncedAt
                    ? new Date(storeInfo.lastSyncedAt).toLocaleString()
                    : 'Never'}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Connected Since:</span>
                <span className="value">
                  {storeInfo?.connectedAt
                    ? new Date(storeInfo.connectedAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="action-buttons">
              <button 
                className="view-orders-btn"
                onClick={toggleOrdersView}
              >
                {showOrders ? 'Hide Orders' : 'View Orders'}
              </button>
              <button 
                className="disconnect-btn"
                onClick={handleDisconnect}
                disabled={disconnecting}
              >
                {disconnecting ? 'Disconnecting...' : 'Disconnect Shopify'}
              </button>
            </div>
          </div>
          
          {showOrders && <ShopifyOrders />}
        </div>
      )}
    </div>
  );
};

export default ShopifyIntegration;