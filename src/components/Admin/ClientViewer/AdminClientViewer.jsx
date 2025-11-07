import React, { useState } from 'react';
import { 
  User, 
  Store, 
  ShoppingBag,
  DollarSign,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
// Import from existing API slices
import { useGetAllClientsQuery, useGetClientProfileQuery } from '../../../features/user/userApi';
import { useLazyGetShopifyOrdersQuery } from '../../../features/shopify/shopifyApi';
import { useLazyGetAmazonOrdersQuery } from '../../../features/amazon/amazonApi';
import { useLazyGetQuickBooksInvoicesQuery } from '../../../features/quickbooks/quickbooksApi';
import './AdminClientViewer.css';

const AdminClientViewer = () => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [activeTab, setActiveTab] = useState('shopify');
  
  // RTK Query hooks
  const { data: clientsData, isLoading: loadingClients, error: clientsError } = useGetAllClientsQuery();
  const { data: profileData, isLoading: loadingProfile, error: profileError } = useGetClientProfileQuery(selectedClientId, {
    skip: !selectedClientId
  });
  
  // Lazy queries for integration data (only fetched when button clicked) - using clientId for admin override
  const [triggerShopifyFetch, { data: shopifyData, isLoading: loadingShopify }] = useLazyGetShopifyOrdersQuery();
  const [triggerAmazonFetch, { data: amazonData, isLoading: loadingAmazon }] = useLazyGetAmazonOrdersQuery();
  const [triggerQuickBooksFetch, { data: quickbooksData, isLoading: loadingQuickBooks }] = useLazyGetQuickBooksInvoicesQuery();
  
  const clients = clientsData?.data || [];
  const clientProfile = profileData?.data;
  
  const loading = loadingClients || loadingProfile || loadingShopify || loadingAmazon || loadingQuickBooks;
  const error = clientsError || profileError;

  const handleClientChange = (event) => {
    const clientId = event.target.value;
    setSelectedClientId(clientId);
  };

  const fetchShopifyOrders = () => {
    if (selectedClientId) {
      // Pass clientId for admin override
      triggerShopifyFetch({ clientId: selectedClientId });
    }
  };

  const fetchAmazonOrders = () => {
    if (selectedClientId) {
      // Pass clientId for admin override
      triggerAmazonFetch({ clientId: selectedClientId });
    }
  };

  const fetchQuickBooksData = () => {
    if (selectedClientId) {
      // Pass clientId for admin override
      triggerQuickBooksFetch({ clientId: selectedClientId });
    }
  };

  const renderIntegrationStatus = (integration) => {
    if (integration.connected) {
      return (
        <div>
          <span className="badge bg-success mb-2">
            <CheckCircle size={14} className="me-1" />
            Connected
          </span>
          <div className="small text-muted mt-2">
            <strong>Last Sync:</strong> {new Date(integration.lastSync).toLocaleString()}
          </div>
          <div className="small text-muted">
            <strong>Connected Since:</strong> {new Date(integration.connectedSince).toLocaleString()}
          </div>
        </div>
      );
    }
    return (
      <span className="badge bg-secondary">
        <XCircle size={14} className="me-1" />
        Not Connected
      </span>
    );
  };

  const renderClientInfo = () => {
    if (!clientProfile) return null;

    return (
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">
            <User size={20} className="me-2" />
            Client Information
          </h5>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="text-muted small">Name</label>
              <div className="fw-semibold">{clientProfile.client.name || 'N/A'}</div>
            </div>
            <div className="col-md-6 mb-3">
              <label className="text-muted small">Email</label>
              <div className="fw-semibold">{clientProfile.client.email}</div>
            </div>
            <div className="col-md-6 mb-3">
              <label className="text-muted small">Business Name</label>
              <div className="fw-semibold">{clientProfile.client.businessName || 'N/A'}</div>
            </div>
            <div className="col-md-6 mb-3">
              <label className="text-muted small">Phone</label>
              <div className="fw-semibold">{clientProfile.client.phone || 'N/A'}</div>
            </div>
            <div className="col-md-6 mb-3">
              <label className="text-muted small">Status</label>
              <div>
                <span className={`badge ${clientProfile.client.active ? 'bg-success' : 'bg-secondary'}`}>
                  {clientProfile.client.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <label className="text-muted small">Member Since</label>
              <div className="fw-semibold">
                {new Date(clientProfile.client.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderIntegrationCards = () => {
    if (!clientProfile) return null;

    return (
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">
                <Store size={20} className="me-2" />
                Shopify
              </h6>
              {renderIntegrationStatus(clientProfile.integrations.shopify)}
              {clientProfile.integrations.shopify.connected && (
                <div className="mt-3">
                  <div className="small">
                    <strong>Store:</strong> {clientProfile.integrations.shopify.shopName}
                  </div>
                  <div className="small">
                    <strong>Domain:</strong> {clientProfile.integrations.shopify.shopDomain}
                  </div>
                  <button
                    className="btn btn-sm btn-primary mt-2"
                    onClick={fetchShopifyOrders}
                    disabled={loadingShopify}
                  >
                    {loadingShopify ? (
                      <>
                        <Loader2 size={14} className="spinner-border spinner-border-sm me-2" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={14} className="me-2" />
                        Load Orders
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">
                <ShoppingBag size={20} className="me-2" />
                Amazon
              </h6>
              {renderIntegrationStatus(clientProfile.integrations.amazon)}
              {clientProfile.integrations.amazon.connected && (
                <div className="mt-3">
                  <div className="small">
                    <strong>Seller:</strong> {clientProfile.integrations.amazon.sellerName}
                  </div>
                  <div className="small">
                    <strong>ID:</strong> {clientProfile.integrations.amazon.sellerId}
                  </div>
                  <button
                    className="btn btn-sm btn-primary mt-2"
                    onClick={fetchAmazonOrders}
                    disabled={loadingAmazon}
                  >
                    {loadingAmazon ? (
                      <>
                        <Loader2 size={14} className="spinner-border spinner-border-sm me-2" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={14} className="me-2" />
                        Load Orders
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">
                <DollarSign size={20} className="me-2" />
                QuickBooks
              </h6>
              {renderIntegrationStatus(clientProfile.integrations.quickbooks)}
              {clientProfile.integrations.quickbooks.connected && (
                <div className="mt-3">
                  <div className="small">
                    <strong>Company:</strong> {clientProfile.integrations.quickbooks.companyName}
                  </div>
                  <div className="small">
                    <strong>ID:</strong> {clientProfile.integrations.quickbooks.companyId}
                  </div>
                  <button
                    className="btn btn-sm btn-primary mt-2"
                    onClick={fetchQuickBooksData}
                    disabled={loadingQuickBooks}
                  >
                    {loadingQuickBooks ? (
                      <>
                        <Loader2 size={14} className="spinner-border spinner-border-sm me-2" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={14} className="me-2" />
                        Load Data
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderIntegrationData = () => {
    return (
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'shopify' ? 'active' : ''}`}
                onClick={() => setActiveTab('shopify')}
              >
                Shopify Orders
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'amazon' ? 'active' : ''}`}
                onClick={() => setActiveTab('amazon')}
              >
                Amazon Orders
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'quickbooks' ? 'active' : ''}`}
                onClick={() => setActiveTab('quickbooks')}
              >
                QuickBooks Data
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {activeTab === 'shopify' && (
            <div>
              <h6>Shopify Orders</h6>
              {shopifyData ? (
                <>
                  <p className="text-muted">
                    Total Orders: {shopifyData.data?.orders?.length || 0}
                  </p>
                  <pre className="bg-light p-3" style={{ maxHeight: '400px', overflow: 'auto' }}>
                    {JSON.stringify(shopifyData.data, null, 2)}
                  </pre>
                </>
              ) : (
                <p className="text-muted">Click "Load Orders" to fetch Shopify data</p>
              )}
            </div>
          )}

          {activeTab === 'amazon' && (
            <div>
              <h6>Amazon Orders</h6>
              {amazonData ? (
                <>
                  <p className="text-muted">
                    Total Orders: {amazonData.data?.orders?.length || 0}
                  </p>
                  <pre className="bg-light p-3" style={{ maxHeight: '400px', overflow: 'auto' }}>
                    {JSON.stringify(amazonData.data, null, 2)}
                  </pre>
                </>
              ) : (
                <p className="text-muted">Click "Load Orders" to fetch Amazon data</p>
              )}
            </div>
          )}

          {activeTab === 'quickbooks' && (
            <div>
              <h6>QuickBooks Data</h6>
              {quickbooksData ? (
                <pre className="bg-light p-3" style={{ maxHeight: '400px', overflow: 'auto' }}>
                  {JSON.stringify(quickbooksData.data, null, 2)}
                </pre>
              ) : (
                <p className="text-muted">Click "Load Data" to fetch QuickBooks data</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-client-viewer">
      <div className="container-fluid">
        <div className="mb-4">
          <h4>Admin Client Viewer</h4>
          <p className="text-muted">View client profiles and access their integration data</p>
        </div>

        {/* Client Selector */}
        <div className="mb-4">
          <label className="form-label">Select Client</label>
          <select
            className="form-select"
            value={selectedClientId}
            onChange={handleClientChange}
            disabled={loadingClients}
          >
            <option value="">Choose a client...</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name || client.email}
                {client.businessName && ` - ${client.businessName}`}
              </option>
            ))}
          </select>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error?.message || 'An error occurred'}
          </div>
        )}

        {/* Loading State */}
        {loadingProfile && (
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* Client Information */}
        {!loadingProfile && clientProfile && (
          <>
            {renderClientInfo()}
            {renderIntegrationCards()}
            {renderIntegrationData()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminClientViewer;