import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  CreditCard,
  Calendar,
  DollarSign,
  Download,
  AlertCircle,
  Check,
  X,
  RefreshCw,
  Shield,
  FileText
} from 'lucide-react';
import {
  useGetUserSubscriptionQuery,
  useGetBillingInfoQuery,
  useGetPaymentMethodsQuery,
  useGetPaymentHistoryQuery,
  useCancelSubscriptionMutation,
  useDownloadInvoiceMutation,
  useCreateCustomerPortalSessionMutation
} from '../../../features/subscription/subscriptionApi';
import './SubscriptionManagement.scss';

const SubscriptionManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get auth state
  const { token, isAuthenticated } = useSelector(state => state.auth);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpdatePaymentModal, setShowUpdatePaymentModal] = useState(false);
  
  // RTK Query hooks with skip condition for authentication
  const {
    data: subscriptionData,
    isLoading: subscriptionLoading,
    refetch: refetchSubscription
  } = useGetUserSubscriptionQuery(undefined, {
    skip: !isAuthenticated || !token
  });
  
  const {
    data: billingData,
    isLoading: billingLoading
  } = useGetBillingInfoQuery(undefined, {
    skip: !isAuthenticated || !token
  });
  
  const {
    data: paymentMethodsData,
    isLoading: methodsLoading
  } = useGetPaymentMethodsQuery(undefined, {
    skip: !isAuthenticated || !token
  });
  
  const {
    data: transactionsData,
    isLoading: transactionsLoading
  } = useGetPaymentHistoryQuery(
    { page: currentPage, limit: 10 },
    {
      skip: !isAuthenticated || !token || activeTab !== 'transactions'
    }
  );
  
  // Mutations
  const [cancelSubscription, { isLoading: cancelLoading }] = useCancelSubscriptionMutation();
  const [downloadInvoice] = useDownloadInvoiceMutation();
  const [createPortalSession] = useCreateCustomerPortalSessionMutation();
  
  // Extract data from responses
  const subscription = subscriptionData?.data;
  const billingInfo = billingData?.data;
  const paymentMethods = paymentMethodsData?.data || [];
  const transactions = transactionsData?.data?.transactions || [];
  const totalPages = transactionsData?.data?.pagination?.totalPages || 1;
  
  // Combined loading state
  const loading = subscriptionLoading || billingLoading || methodsLoading;

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || !token) {
      console.warn('[SubscriptionManagement] User not authenticated, redirecting to login');
      navigate('/login');
    }
  }, [isAuthenticated, token, navigate]);

  const handleCancelSubscription = async (immediately = false) => {
    try {
      const result = await cancelSubscription({
        subscriptionId: subscription._id,
        cancelImmediately: immediately
      }).unwrap();
      
      if (result.success) {
        setShowCancelModal(false);
        // Refresh subscription data
        refetchSubscription();
        alert(result.message);
      } else {
        alert('Failed to cancel subscription: ' + result.message);
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('An error occurred while cancelling subscription');
    }
  };

  const handleDownloadInvoice = async (transactionId) => {
    try {
      const result = await downloadInvoice(transactionId).unwrap();
      
      if (result?.data?.invoicePdf) {
        window.open(result.data.invoicePdf, '_blank');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice');
    }
  };

  const handleManagePaymentMethods = async () => {
    try {
      const result = await createPortalSession({
        returnUrl: window.location.href
      }).unwrap();
      
      if (result?.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      alert('Failed to open customer portal');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      active: 'success',
      trialing: 'info',
      past_due: 'warning',
      cancelled: 'danger',
      unpaid: 'danger',
      succeeded: 'success',
      failed: 'danger',
      pending: 'warning',
      refunded: 'secondary'
    };
    return statusColors[status] || 'secondary';
  };

  const getDaysRemaining = () => {
    if (!subscription?.currentPeriodEnd) return 0;
    const end = new Date(subscription.currentPeriodEnd);
    const now = new Date();
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="subscription-loading">
        <div className="spinner"></div>
        <p>Loading subscription details...</p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="no-subscription">
        <AlertCircle size={48} />
        <h2>No Active Subscription</h2>
        <p>You don't have an active subscription.</p>
        <button onClick={() => navigate('/pricing')} className="btn-primary">
          View Plans
        </button>
      </div>
    );
  }

  return (
    <div className="subscription-management-container">
      {/* Header */}
      <div className="subscription-header">
        <div className="header-content">
          <h1>Subscription Management</h1>
          <p>Manage your subscription, billing, and payment methods</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={() => navigate('/pricing')}
          >
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="subscription-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          Billing & Payment
        </button>
        <button
          className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transaction History
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Current Plan Card */}
            <div className="current-plan-card">
              <div className="plan-header">
                <h2>Current Plan</h2>
                <span className={`status-badge ${getStatusColor(subscription.status)}`}>
                  {subscription.status}
                </span>
              </div>

              <div className="plan-details">
                <div className="plan-info">
                  <h3>{subscription.subscriptionPlanId?.name || 'Plan Name'}</h3>
                  <p className="plan-price">
                    {formatCurrency(subscription.subscriptionPlanId?.pricePerMonth || 0)}
                    <span>/{subscription.billingPeriod}</span>
                  </p>
                </div>

                <div className="plan-meta">
                  <div className="meta-item">
                    <Calendar size={16} />
                    <div>
                      <span>Current Period</span>
                      <p>{formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}</p>
                    </div>
                  </div>
                  <div className="meta-item">
                    <RefreshCw size={16} />
                    <div>
                      <span>Next Billing</span>
                      <p>{formatDate(subscription.currentPeriodEnd)} ({getDaysRemaining()} days)</p>
                    </div>
                  </div>
                </div>

                {subscription.trialEnd && new Date(subscription.trialEnd) > new Date() && (
                  <div className="trial-banner">
                    <AlertCircle size={16} />
                    Trial ends on {formatDate(subscription.trialEnd)}
                  </div>
                )}

                {subscription.cancelAtPeriodEnd && (
                  <div className="cancel-banner">
                    <AlertCircle size={16} />
                    Subscription will be cancelled on {formatDate(subscription.currentPeriodEnd)}
                  </div>
                )}
              </div>

              <div className="plan-features">
                <h4>Included Features:</h4>
                <ul>
                  {subscription.subscriptionPlanId?.features?.map((feature, idx) => (
                    <li key={idx}>
                      <Check size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="plan-actions">
                {!subscription.cancelAtPeriodEnd && (
                  <button 
                    className="btn-danger"
                    onClick={() => setShowCancelModal(true)}
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>

            {/* Usage Stats */}
            <div className="usage-stats">
              <h3>Usage Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">
                    {subscription.subscriptionPlanId?.maxProducts || 0}
                  </div>
                  <div className="stat-label">Products Limit</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {subscription.subscriptionPlanId?.maxStores || 0}
                  </div>
                  <div className="stat-label">Stores Limit</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {getDaysRemaining()}
                  </div>
                  <div className="stat-label">Days Remaining</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="billing-tab">
            {/* Payment Method */}
            <div className="payment-method-section">
              <div className="section-header">
                <h3>Payment Method</h3>
                <button 
                  className="btn-link"
                  onClick={handleManagePaymentMethods}
                >
                  Manage Payment Methods
                </button>
              </div>

              {paymentMethods.length > 0 ? (
                <div className="payment-methods">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="payment-method-card">
                      <CreditCard size={24} />
                      <div className="method-details">
                        <p className="method-brand">
                          {method.card?.brand?.toUpperCase()} •••• {method.card?.last4}
                        </p>
                        <p className="method-exp">
                          Expires {method.card?.exp_month}/{method.card?.exp_year}
                        </p>
                      </div>
                      {subscription.defaultPaymentMethod === method.id && (
                        <span className="default-badge">Default</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-payment-methods">
                  <p>No payment methods on file</p>
                  <button className="btn-primary" onClick={handleManagePaymentMethods}>
                    Add Payment Method
                  </button>
                </div>
              )}
            </div>

            {/* Billing Information */}
            <div className="billing-info-section">
              <div className="section-header">
                <h3>Billing Information</h3>
                <button 
                  className="btn-link"
                  onClick={() => navigate('/settings/billing')}
                >
                  Edit
                </button>
              </div>

              {billingInfo ? (
                <div className="billing-details">
                  <div className="detail-row">
                    <span>Name:</span>
                    <p>{billingInfo.name}</p>
                  </div>
                  <div className="detail-row">
                    <span>Email:</span>
                    <p>{billingInfo.email}</p>
                  </div>
                  {billingInfo.companyName && (
                    <div className="detail-row">
                      <span>Company:</span>
                      <p>{billingInfo.companyName}</p>
                    </div>
                  )}
                  <div className="detail-row">
                    <span>Address:</span>
                    <p>
                      {billingInfo.address?.line1}<br />
                      {billingInfo.address?.line2 && `${billingInfo.address.line2}<br />`}
                      {billingInfo.address?.city}, {billingInfo.address?.state} {billingInfo.address?.postal_code}<br />
                      {billingInfo.address?.country}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="no-billing-info">
                  <p>No billing information on file</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="transactions-tab">
            <h3>Transaction History</h3>
            
            {transactions.length > 0 ? (
              <>
                <div className="transactions-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction._id}>
                          <td>{formatDate(transaction.createdAt)}</td>
                          <td>{transaction.description}</td>
                          <td>{formatCurrency(transaction.amount)}</td>
                          <td>
                            <span className={`status-badge ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td>
                            {transaction.invoiceUrl && (
                              <button
                                className="btn-icon"
                                onClick={() => handleDownloadInvoice(transaction._id)}
                                title="Download Invoice"
                              >
                                <Download size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-transactions">
                <FileText size={48} />
                <p>No transactions found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Subscription</h3>
              <button onClick={() => setShowCancelModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to cancel your subscription?</p>
              <div className="cancel-options">
                <div className="option">
                  <input
                    type="radio"
                    id="cancel-end"
                    name="cancel-type"
                    value="end"
                    defaultChecked
                  />
                  <label htmlFor="cancel-end">
                    <strong>Cancel at period end</strong>
                    <p>Keep access until {formatDate(subscription.currentPeriodEnd)}</p>
                  </label>
                </div>
                <div className="option">
                  <input
                    type="radio"
                    id="cancel-now"
                    name="cancel-type"
                    value="now"
                  />
                  <label htmlFor="cancel-now">
                    <strong>Cancel immediately</strong>
                    <p>Lose access immediately (no refund)</p>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Subscription
              </button>
              <button 
                className="btn-danger"
                onClick={() => {
                  const immediately = document.getElementById('cancel-now').checked;
                  handleCancelSubscription(immediately);
                }}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;