import React, { useState, useEffect } from 'react';
import {
  useInitializeSandboxMutation,
  useGetSandboxStatusQuery,
  useResetSandboxMutation,
  useGetSandboxOrdersQuery,
  useGetSandboxInventoryQuery,
  useLazyTestSandboxConnectionQuery,
} from '../../features/amazon/amazonSandboxApi';
import './AmazonSandbox.css';

const AmazonSandbox = () => {
  const [refreshToken, setRefreshToken] = useState('');
  const [showOrders, setShowOrders] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [orderFilters, setOrderFilters] = useState({
    maxResults: 10,
    createdAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // RTK Query hooks
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useGetSandboxStatusQuery();
  const [initializeSandbox, { isLoading: initLoading }] = useInitializeSandboxMutation();
  const [resetSandbox, { isLoading: resetLoading }] = useResetSandboxMutation();
  const [testConnection, { data: testResult }] = useLazyTestSandboxConnectionQuery();
  
  // Conditional queries
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useGetSandboxOrdersQuery(
    orderFilters,
    { skip: !showOrders || !status?.data?.connected }
  );
  
  const { data: inventoryData, isLoading: inventoryLoading, refetch: refetchInventory } = useGetSandboxInventoryQuery(
    {},
    { skip: !showInventory || !status?.data?.connected }
  );

  const isConnected = status?.data?.connected;
  const isSandbox = status?.data?.isSandbox;

  const handleInitialize = async () => {
    try {
      const payload = refreshToken ? { refreshToken } : {};
      const result = await initializeSandbox(payload).unwrap();
      
      if (result.success) {
        alert('Sandbox initialized successfully!');
        setRefreshToken('');
        refetchStatus();
      } else {
        alert(`Failed to initialize: ${result.message}`);
      }
    } catch (error) {
      console.error('Initialize error:', error);
      alert(`Error: ${error.data?.message || error.message}`);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the sandbox configuration?')) return;
    
    try {
      const result = await resetSandbox().unwrap();
      if (result.success) {
        alert('Sandbox reset successfully!');
        setShowOrders(false);
        setShowInventory(false);
        refetchStatus();
      }
    } catch (error) {
      console.error('Reset error:', error);
      alert(`Error: ${error.data?.message || error.message}`);
    }
  };

  const handleTestConnection = async () => {
    try {
      const result = await testConnection().unwrap();
      if (result.success && result.data.tokenValid) {
        alert('Connection test successful! Token is valid.');
      } else {
        alert('Connection test failed! Token may be invalid.');
      }
    } catch (error) {
      console.error('Test error:', error);
      alert(`Test failed: ${error.data?.message || error.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount, currencyCode = 'USD') => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  };

  return (
    <div className="amazon-sandbox-container">
      <div className="sandbox-header">
        <h2>🧪 Amazon Sandbox Testing</h2>
        <div className="sandbox-badge">SANDBOX MODE</div>
      </div>

      {/* Status Section */}
      <div className="sandbox-section">
        <h3>Connection Status</h3>
        {statusLoading ? (
          <div className="loading">Loading status...</div>
        ) : (
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Connected:</span>
              <span className={`status-value ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            {isConnected && (
              <>
                <div className="status-item">
                  <span className="status-label">Seller ID:</span>
                  <span className="status-value">{status?.data?.sellerId}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Marketplaces:</span>
                  <span className="status-value">{status?.data?.marketplaceIds?.join(', ')}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Last Synced:</span>
                  <span className="status-value">{formatDate(status?.data?.lastSyncedAt)}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Token Expired:</span>
                  <span className={`status-value ${status?.data?.tokenExpired ? 'error' : 'success'}`}>
                    {status?.data?.tokenExpired ? '⚠️ Yes' : '✅ No'}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Initialize Section */}
      {!isConnected && (
        <div className="sandbox-section">
          <h3>Initialize Sandbox</h3>
          <div className="init-form">
            <div className="form-group">
              <label htmlFor="refreshToken">
                Refresh Token (Optional - uses env variable if not provided):
              </label>
              <input
                type="text"
                id="refreshToken"
                value={refreshToken}
                onChange={(e) => setRefreshToken(e.target.value)}
                placeholder="Atzr|..."
                className="token-input"
              />
            </div>
            <button
              onClick={handleInitialize}
              disabled={initLoading}
              className="btn btn-primary"
            >
              {initLoading ? 'Initializing...' : 'Initialize Sandbox'}
            </button>
          </div>
        </div>
      )}

      {/* Actions Section */}
      {isConnected && (
        <div className="sandbox-section">
          <h3>Actions</h3>
          <div className="action-buttons">
            <button onClick={handleTestConnection} className="btn btn-secondary">
              Test Connection
            </button>
            <button 
              onClick={() => setShowOrders(!showOrders)} 
              className={`btn ${showOrders ? 'btn-active' : 'btn-secondary'}`}
            >
              {showOrders ? 'Hide Orders' : 'Show Orders'}
            </button>
            <button 
              onClick={() => setShowInventory(!showInventory)} 
              className={`btn ${showInventory ? 'btn-active' : 'btn-secondary'}`}
            >
              {showInventory ? 'Hide Inventory' : 'Show Inventory'}
            </button>
            <button 
              onClick={handleReset} 
              disabled={resetLoading}
              className="btn btn-danger"
            >
              {resetLoading ? 'Resetting...' : 'Reset Sandbox'}
            </button>
          </div>
        </div>
      )}

      {/* Orders Section */}
      {showOrders && isConnected && (
        <div className="sandbox-section">
          <div className="section-header">
            <h3>Orders</h3>
            <button onClick={() => refetchOrders()} className="btn-small">
              Refresh
            </button>
          </div>
          
          <div className="filters">
            <input
              type="date"
              value={orderFilters.createdAfter}
              onChange={(e) => setOrderFilters({...orderFilters, createdAfter: e.target.value})}
              className="filter-input"
            />
            <input
              type="number"
              value={orderFilters.maxResults}
              onChange={(e) => setOrderFilters({...orderFilters, maxResults: e.target.value})}
              placeholder="Max Results"
              min="1"
              max="100"
              className="filter-input"
            />
          </div>

          {(() => {
            console.log('Full Orders Response:', ordersData);
            console.log('Orders success?:', ordersData?.success);
            console.log('Orders data field:', ordersData?.data);
            console.log('Orders Array:', ordersData?.data?.Orders);
            
            if (ordersLoading) {
              return <div className="loading">Loading orders...</div>;
            }
            
            // Check if we have the Orders array in the expected location
            const orders = ordersData?.data?.Orders;
            
            if (!orders || !Array.isArray(orders) || orders.length === 0) {
              return <div className="no-data">No orders found</div>;
            }
            
            return (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.AmazonOrderId} className="order-card">
                    <div className="order-header">
                      <span className="order-id">{order.AmazonOrderId}</span>
                      <span className={`order-status status-${order.OrderStatus?.toLowerCase()}`}>
                        {order.OrderStatus}
                      </span>
                    </div>
                    <div className="order-details">
                      <div className="detail-item">
                        <span>Purchase Date:</span>
                        <span>{formatDate(order.PurchaseDate)}</span>
                      </div>
                      <div className="detail-item">
                        <span>Total:</span>
                        <span>{formatCurrency(order.OrderTotal?.Amount, order.OrderTotal?.CurrencyCode)}</span>
                      </div>
                      <div className="detail-item">
                        <span>Items:</span>
                        <span>{order.NumberOfItemsShipped || 0} shipped, {order.NumberOfItemsUnshipped || 0} unshipped</span>
                      </div>
                      <div className="detail-item">
                        <span>Fulfillment:</span>
                        <span>{order.FulfillmentChannel}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Inventory Section */}
      {showInventory && isConnected && (
        <div className="sandbox-section">
          <div className="section-header">
            <h3>Inventory</h3>
            <button onClick={() => refetchInventory()} className="btn-small">
              Refresh
            </button>
          </div>

          {(() => {
            console.log('Full Inventory Response:', inventoryData);
            console.log('Inventory data field:', inventoryData?.data);
            console.log('Inventory Array:', inventoryData?.data?.inventorySummaries);
            
            if (inventoryLoading) {
              return <div className="loading">Loading inventory...</div>;
            }
            
            const inventories = inventoryData?.data?.inventorySummaries;
            
            if (!inventories || !Array.isArray(inventories) || inventories.length === 0) {
              return <div className="no-data">No inventory found</div>;
            }
            
            return (
              <div className="inventory-list">
                {inventories.map((item, index) => (
                  <div key={index} className="inventory-card">
                    <div className="inventory-header">
                      <span className="sku">{item.sellerSku}</span>
                      <span className="asin">{item.asin}</span>
                    </div>
                    <div className="inventory-details">
                      <div className="detail-item">
                        <span>Fulfillable:</span>
                        <span className="quantity">{item.totalQuantity || 0}</span>
                      </div>
                      <div className="detail-item">
                        <span>Condition:</span>
                        <span>{item.condition || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span>Product Name:</span>
                        <span>{item.productName || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Test Result Display */}
      {testResult && (
        <div className="sandbox-section">
          <h3>Test Result</h3>
          <pre className="test-result">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AmazonSandbox;