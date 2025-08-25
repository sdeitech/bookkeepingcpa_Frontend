import React, { useEffect, useState } from 'react';
import { useGetAmazonConnectionStatusQuery, useLazyGetAmazonAuthUrlQuery, useDisconnectAmazonMutation } from '../../features/amazon/amazonApi';
import AmazonOrders from './AmazonOrders';
import './AmazonIntegration.css';

const AmazonIntegration = () => {
  const { data: connectionStatus, isLoading: statusLoading, refetch: refetchStatus } = useGetAmazonConnectionStatusQuery();
  const [getAuthUrl, { isLoading: authUrlLoading }] = useLazyGetAmazonAuthUrlQuery();
  const [disconnectAmazon, { isLoading: disconnecting }] = useDisconnectAmazonMutation();
  const [showOrders, setShowOrders] = useState(false);

  // Check if we're connected
  const isConnected = connectionStatus?.data?.connected;

  // Handle Connect with Amazon button click
  const handleConnectAmazon = async () => {
    try {
      const result = await getAuthUrl().unwrap();
      if (result?.data?.authUrl) {
        // Redirect to Amazon OAuth page
        window.location.href = result.data.authUrl;
      }
    } catch (error) {
      console.error('Failed to get Amazon authorization URL:', error);
      alert('Failed to connect to Amazon. Please try again.');
    }
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect your Amazon seller account?')) {
      try {
        await disconnectAmazon().unwrap();
        setShowOrders(false);
        refetchStatus();
        alert('Amazon account disconnected successfully');
      } catch (error) {
        console.error('Failed to disconnect Amazon:', error);
        alert('Failed to disconnect Amazon account. Please try again.');
      }
    }
  };

  // Toggle orders view
  const toggleOrdersView = () => {
    setShowOrders(!showOrders);
  };

  if (statusLoading) {
    return (
      <div className="amazon-integration-container">
        <div className="loading">Checking Amazon connection status...</div>
      </div>
    );
  }

  return (
    <div className="amazon-integration-container">
      <div className="amazon-header">
        <h2>Amazon Seller Integration</h2>
        {isConnected && (
          <span className="connection-status connected">
            <span className="status-dot"></span>
            Connected
          </span>
        )}
      </div>

      {!isConnected ? (
        <div className="amazon-connect-section">
          <div className="connect-info">
            <h3>Connect Your Amazon Seller Account</h3>
            <p>
              Connect your Amazon Seller account to view and manage your orders, inventory, and sales data directly from this dashboard.
            </p>
            <ul className="benefits-list">
              <li>📦 View and manage orders</li>
              <li>📊 Track inventory levels</li>
              <li>💰 Monitor financial data</li>
              <li>📈 Generate sales reports</li>
            </ul>
          </div>
          <button 
            className="amazon-connect-btn"
            onClick={handleConnectAmazon}
            disabled={authUrlLoading}
          >
            {authUrlLoading ? 'Connecting...' : 'Connect with Amazon'}
          </button>
        </div>
      ) : (
        <div className="amazon-connected-section">
          <div className="connection-details">
            <div className="seller-info">
              <h3>Seller Information</h3>
              <div className="info-row">
                <span className="label">Seller ID:</span>
                <span className="value">{connectionStatus?.data?.sellerId}</span>
              </div>
              <div className="info-row">
                <span className="label">Seller Name:</span>
                <span className="value">{connectionStatus?.data?.sellerName}</span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{connectionStatus?.data?.sellerEmail}</span>
              </div>
              <div className="info-row">
                <span className="label">Marketplace:</span>
                <span className="value">
                  {connectionStatus?.data?.marketplaceIds?.join(', ') || 'US'}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Last Synced:</span>
                <span className="value">
                  {connectionStatus?.data?.lastSyncedAt
                    ? new Date(connectionStatus.data.lastSyncedAt).toLocaleString()
                    : 'Never'}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Connected Since:</span>
                <span className="value">
                  {connectionStatus?.data?.connectedSince
                    ? new Date(connectionStatus.data.connectedSince).toLocaleDateString()
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
                {disconnecting ? 'Disconnecting...' : 'Disconnect Amazon'}
              </button>
            </div>
          </div>

          {showOrders && <AmazonOrders />}
        </div>
      )}
    </div>
  );
};

export default AmazonIntegration;