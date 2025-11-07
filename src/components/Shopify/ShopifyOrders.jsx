import React, { useState, useEffect } from 'react';
import { useGetShopifyOrdersQuery } from '../../features/shopify/shopifyApi';
import './ShopifyOrders.css';

const ShopifyOrders = () => {
  const [filters, setFilters] = useState({
    status: 'any',
    limit: 20,
  });
  
  const { data: ordersData, isLoading, error, refetch } = 
    useGetShopifyOrdersQuery(filters);
  
  const orders = ordersData?.data?.orders || [];
  const pagination = ordersData?.data?.pagination || {};
  const shopInfo = ordersData?.data?.store || {};
  
  // Format currency
  const formatPrice = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Get status badge class
  const getFinancialStatusClass = (status) => {
    const statusMap = {
      pending: 'status-pending',
      paid: 'status-paid',
      partially_paid: 'status-partial',
      refunded: 'status-refunded',
      voided: 'status-voided',
      authorized: 'status-authorized',
    };
    return statusMap[status] || 'status-default';
  };
  
  const getFulfillmentStatusClass = (status) => {
    if (status === 'fulfilled') return 'status-fulfilled';
    if (status === 'partial') return 'status-partial';
    if (status === 'unfulfilled' || !status) return 'status-unfulfilled';
    return 'status-default';
  };
  
  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Handle pagination
  const handlePageChange = (pageInfo) => {
    setFilters(prev => ({ ...prev, page_info: pageInfo }));
  };
  
  if (isLoading) {
    return (
      <div className="shopify-orders-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="shopify-orders-container">
        <div className="error-state">
          <span className="error-icon">❌</span>
          <p>Failed to load orders</p>
          <small>{error?.data?.message || error?.message || 'Unknown error occurred'}</small>
          <button onClick={refetch} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="shopify-orders-container">
      <div className="orders-header">
        <h3>📦 Orders ({orders.length})</h3>
        
        <div className="orders-filters">
          <select 
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="any">All Orders</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            className="filter-select"
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
          
          <button onClick={refetch} className="refresh-btn" title="Refresh orders">
            🔄 Refresh
          </button>
        </div>
      </div>
      
      {orders.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>No orders found</p>
          <small>Try adjusting your filters or check back later</small>
        </div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th>Items</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="order-number">
                    <strong>#{order.order_number || order.name?.replace('#', '')}</strong>
                    {order.name && (
                      <>
                        <br />
                        <small className="text-muted">
                          {order.name}
                        </small>
                      </>
                    )}
                  </td>
                  <td className="order-date">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="customer-info">
                    {order.customer ? (
                      <>
                        <strong>
                          {order.customer.first_name} {order.customer.last_name}
                        </strong>
                        {order.customer.email && (
                          <>
                            <br />
                            <small>{order.customer.email}</small>
                          </>
                        )}
                      </>
                    ) : order.email ? (
                      <>
                        <span>Guest Customer</span>
                        <br />
                        <small>{order.email}</small>
                      </>
                    ) : (
                      <span className="text-muted">Guest</span>
                    )}
                  </td>
                  <td className="order-total">
                    <strong>
                      {formatPrice(order.total_price || order.current_total_price, order.currency)}
                    </strong>
                    {order.total_discounts && parseFloat(order.total_discounts) > 0 && (
                      <>
                        <br />
                        <small className="discount">
                          -{formatPrice(order.total_discounts, order.currency)} discount
                        </small>
                      </>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${getFinancialStatusClass(order.financial_status)}`}>
                      {order.financial_status || 'pending'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getFulfillmentStatusClass(order.fulfillment_status)}`}>
                      {order.fulfillment_status || 'unfulfilled'}
                    </span>
                  </td>
                  <td className="order-items">
                    {order.line_items?.length || 0} items
                  </td>
                  <td className="order-actions">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => {
                        const shopDomain = shopInfo?.shopDomain || ordersData?.data?.store?.shopDomain;
                        if (shopDomain) {
                          window.open(
                            `https://${shopDomain}/admin/orders/${order.id}`,
                            '_blank'
                          );
                        } else {
                          alert('Unable to open order in Shopify admin');
                        }
                      }}
                      title="View in Shopify Admin"
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {(pagination.previous || pagination.next) && (
        <div className="pagination">
          <button 
            disabled={!pagination.previous}
            onClick={() => handlePageChange(pagination.previous)}
            className="pagination-btn"
          >
            ← Previous
          </button>
          <span className="pagination-info">
            Page {filters.page_info ? '...' : '1'}
          </span>
          <button 
            disabled={!pagination.next}
            onClick={() => handlePageChange(pagination.next)}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopifyOrders;