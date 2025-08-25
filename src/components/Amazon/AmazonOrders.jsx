import React, { useState } from 'react';
import { useGetAmazonOrdersQuery } from '../../features/amazon/amazonApi';
import './AmazonOrders.css';

const AmazonOrders = () => {
  const [dateRange, setDateRange] = useState({
    createdAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdBefore: new Date().toISOString().split('T')[0],
  });

  const { data: ordersData, isLoading, error, refetch } = useGetAmazonOrdersQuery({
    createdAfter: dateRange.createdAfter + 'T00:00:00Z',
    createdBefore: dateRange.createdBefore + 'T23:59:59Z',
    maxResults: 100,
  });

  const orders = ordersData?.data?.Orders || [];

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value,
    });
  };

  const getOrderStatusColor = (status) => {
    const statusColors = {
      'Unshipped': '#ff9800',
      'PartiallyShipped': '#2196f3',
      'Shipped': '#4caf50',
      'Canceled': '#f44336',
      'Unfulfillable': '#9e9e9e',
    };
    return statusColors[status] || '#757575';
  };

  const formatCurrency = (amount, currency) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="amazon-orders-container">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="amazon-orders-container">
        <div className="error">
          Failed to load orders: {error?.data?.message || 'Unknown error'}
          <button onClick={refetch} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="amazon-orders-container">
      <div className="orders-header">
        <h3>Amazon Orders</h3>
        <div className="date-filters">
          <div className="date-input-group">
            <label>From:</label>
            <input
              type="date"
              name="createdAfter"
              value={dateRange.createdAfter}
              onChange={handleDateChange}
              max={dateRange.createdBefore}
            />
          </div>
          <div className="date-input-group">
            <label>To:</label>
            <input
              type="date"
              name="createdBefore"
              value={dateRange.createdBefore}
              onChange={handleDateChange}
              min={dateRange.createdAfter}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <button onClick={refetch} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          No orders found for the selected date range.
        </div>
      ) : (
        <>
          <div className="orders-summary">
            <div className="summary-card">
              <span className="summary-label">Total Orders</span>
              <span className="summary-value">{orders.length}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Unshipped</span>
              <span className="summary-value">
                {orders.filter(o => o.OrderStatus === 'Unshipped').length}
              </span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Shipped</span>
              <span className="summary-value">
                {orders.filter(o => o.OrderStatus === 'Shipped').length}
              </span>
            </div>
          </div>

          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Purchase Date</th>
                  <th>Status</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Items</th>
                  <th>Ship By</th>
                  <th>Fulfillment</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.AmazonOrderId}>
                    <td className="order-id">{order.AmazonOrderId}</td>
                    <td>{new Date(order.PurchaseDate).toLocaleDateString()}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getOrderStatusColor(order.OrderStatus) }}
                      >
                        {order.OrderStatus}
                      </span>
                    </td>
                    <td>{order.BuyerInfo?.BuyerName || 'N/A'}</td>
                    <td className="order-total">
                      {formatCurrency(
                        order.OrderTotal?.Amount,
                        order.OrderTotal?.CurrencyCode
                      )}
                    </td>
                    <td>{order.NumberOfItemsShipped || 0} / {order.NumberOfItemsUnshipped || 0}</td>
                    <td>
                      {order.LatestShipDate
                        ? new Date(order.LatestShipDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td>
                      <span className={`fulfillment-type ${order.FulfillmentChannel?.toLowerCase()}`}>
                        {order.FulfillmentChannel || 'MFN'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {ordersData?.data?.NextToken && (
            <div className="pagination-info">
              More orders available. Showing first {orders.length} results.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AmazonOrders;