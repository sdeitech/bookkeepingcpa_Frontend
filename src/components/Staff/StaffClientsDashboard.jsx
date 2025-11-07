import { useState, useEffect } from 'react';
import { useGetMyClientsQuery, useGetStaffDashboardQuery } from '../../features/auth/authApi';
import { 
  OnboardingStatus, 
  SubscriptionStatus, 
  IntegrationStatus,
  ProgressIndicators
} from '../Progress/StatusIndicator';
import './StaffClientsDashboard.css';

const StaffClientsDashboard = () => {
  const [activeFilters, setActiveFilters] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  
  // Fetch staff's assigned clients and dashboard stats
  const { data: clientsData, isLoading: isLoadingClients, refetch: refetchClients } = useGetMyClientsQuery();
  const { data: dashboardData, isLoading: isLoadingDashboard } = useGetStaffDashboardQuery();
  
  // Filter clients based on active filters
  const getFilteredClients = () => {
    let filtered = clientsData?.data || [];
    
    activeFilters.forEach(filter => {
      switch(filter) {
        case 'onboarding_complete':
          filtered = filtered.filter(c => c.progress?.onboarding?.completed === true);
          break;
        case 'onboarding_incomplete':
          filtered = filtered.filter(c => c.progress?.onboarding?.completed === false);
          break;
        case 'subscription_active':
          filtered = filtered.filter(c => 
            c.progress?.subscription?.status === 'active' || 
            c.progress?.subscription?.status === 'trial'
          );
          break;
        case 'subscription_expired':
          filtered = filtered.filter(c => 
            c.progress?.subscription?.status === 'expired' || 
            c.progress?.subscription?.status === 'none'
          );
          break;
        case 'amazon_connected':
          filtered = filtered.filter(c => c.progress?.integrations?.amazon === true);
          break;
        case 'shopify_connected':
          filtered = filtered.filter(c => c.progress?.integrations?.shopify === true);
          break;
        case 'needs_attention':
          filtered = filtered.filter(c => 
            !c.progress?.onboarding?.completed || 
            c.progress?.subscription?.status === 'expired' ||
            c.progress?.subscription?.status === 'none'
          );
          break;
      }
    });
    
    return filtered;
  };
  
  const toggleFilter = (filter) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };
  
  const filteredClients = getFilteredClients();
  
  // Get quick action suggestions for a client
  const getQuickActions = (client) => {
    const actions = [];
    
    if (!client.progress?.onboarding?.completed) {
      actions.push({
        type: 'onboarding',
        label: 'Complete Onboarding',
        icon: '📋',
        color: 'warning'
      });
    }
    
    if (client.progress?.subscription?.status === 'none') {
      actions.push({
        type: 'subscription',
        label: 'Setup Subscription',
        icon: '💳',
        color: 'danger'
      });
    } else if (client.progress?.subscription?.status === 'expired') {
      actions.push({
        type: 'subscription',
        label: 'Renew Subscription',
        icon: '⚠️',
        color: 'danger'
      });
    }
    
    if (!client.progress?.integrations?.amazon) {
      actions.push({
        type: 'amazon',
        label: 'Connect Amazon',
        icon: '📦',
        color: 'info'
      });
    }
    
    if (!client.progress?.integrations?.shopify) {
      actions.push({
        type: 'shopify',
        label: 'Connect Shopify',
        icon: '🛍️',
        color: 'info'
      });
    }
    
    return actions;
  };
  
  const handleActionClick = (client, actionType) => {
    // Handle quick actions - you can implement navigation or modals here
    console.log(`Action ${actionType} for client ${client._id}`);
    alert(`This would navigate to ${actionType} setup for ${client.first_name} ${client.last_name}`);
  };
  
  if (isLoadingClients || isLoadingDashboard) {
    return <div className="loading-container">Loading your clients...</div>;
  }
  
  return (
    <div className="staff-clients-dashboard">
      {/* Dashboard Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value">{dashboardData?.data?.stats?.assignedClients || 0}</div>
          <div className="stat-label">Total Clients</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{dashboardData?.data?.stats?.onboardingComplete || 0}</div>
          <div className="stat-label">Onboarding Complete</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{dashboardData?.data?.stats?.activeSubscriptions || 0}</div>
          <div className="stat-label">Active Subscriptions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{dashboardData?.data?.stats?.amazonIntegrations || 0}</div>
          <div className="stat-label">Amazon Connected</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{dashboardData?.data?.stats?.shopifyIntegrations || 0}</div>
          <div className="stat-label">Shopify Connected</div>
        </div>
      </div>
      
      {/* Filter Pills */}
      <div className="filter-section">
        <h3>Quick Filters</h3>
        <div className="filter-pills">
          <button 
            className={`filter-pill ${activeFilters.includes('needs_attention') ? 'active' : ''}`}
            onClick={() => toggleFilter('needs_attention')}
          >
            ⚠️ Needs Attention
          </button>
          <button 
            className={`filter-pill ${activeFilters.includes('onboarding_incomplete') ? 'active' : ''}`}
            onClick={() => toggleFilter('onboarding_incomplete')}
          >
            📋 Incomplete Onboarding
          </button>
          <button 
            className={`filter-pill ${activeFilters.includes('subscription_expired') ? 'active' : ''}`}
            onClick={() => toggleFilter('subscription_expired')}
          >
            💳 Expired Subscriptions
          </button>
          <button 
            className={`filter-pill ${activeFilters.includes('amazon_connected') ? 'active' : ''}`}
            onClick={() => toggleFilter('amazon_connected')}
          >
            ✅ Amazon Connected
          </button>
          <button 
            className={`filter-pill ${activeFilters.includes('shopify_connected') ? 'active' : ''}`}
            onClick={() => toggleFilter('shopify_connected')}
          >
            ✅ Shopify Connected
          </button>
          
          {activeFilters.length > 0 && (
            <button 
              className="clear-filters-btn"
              onClick={() => setActiveFilters([])}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
      
      {/* Clients List */}
      <div className="clients-section">
        <h3>
          My Assigned Clients 
          {activeFilters.length > 0 && (
            <span className="filtered-count">
              (Showing {filteredClients.length} of {clientsData?.data?.length || 0})
            </span>
          )}
        </h3>
        
        <div className="clients-grid">
          {filteredClients?.length > 0 ? (
            filteredClients.map((client) => {
              const quickActions = getQuickActions(client);
              
              return (
                <div key={client._id} className="client-card">
                  <div className="client-header">
                    <h4>{client.first_name} {client.last_name}</h4>
                    <span className={`client-status ${client.active ? 'active' : 'inactive'}`}>
                      {client.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="client-info">
                    <p className="client-email">📧 {client.email}</p>
                    {client.phoneNumber && (
                      <p className="client-phone">📱 {client.phoneNumber}</p>
                    )}
                    <p className="client-since">
                      Client since: {new Date(client.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="progress-section">
                    <h5>Progress Status</h5>
                    <ProgressIndicators 
                      progress={client.progress} 
                      clientId={client._id}
                    />
                  </div>
                  
                  {quickActions.length > 0 && (
                    <div className="quick-actions">
                      <h5>Quick Actions</h5>
                      <div className="action-buttons">
                        {quickActions.map((action, index) => (
                          <button
                            key={index}
                            className={`action-btn action-${action.color}`}
                            onClick={() => handleActionClick(client, action.type)}
                            title={action.label}
                          >
                            <span className="action-icon">{action.icon}</span>
                            <span className="action-label">{action.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="client-actions">
                    <button 
                      className="btn-view-details"
                      onClick={() => setSelectedClient(client)}
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-clients">
              {activeFilters.length > 0 
                ? 'No clients match the selected filters' 
                : 'No clients assigned to you yet'
              }
            </div>
          )}
        </div>
      </div>
      
      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="modal-overlay" onClick={() => setSelectedClient(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedClient.first_name} {selectedClient.last_name}</h3>
              <button className="modal-close" onClick={() => setSelectedClient(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h4>Contact Information</h4>
                <p><strong>Email:</strong> {selectedClient.email}</p>
                <p><strong>Phone:</strong> {selectedClient.phoneNumber || 'Not provided'}</p>
                <p><strong>Status:</strong> {selectedClient.active ? 'Active' : 'Inactive'}</p>
                <p><strong>Member Since:</strong> {new Date(selectedClient.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div className="detail-section">
                <h4>Progress Details</h4>
                <div className="progress-details">
                  <div className="progress-item">
                    <span className="progress-label">Onboarding:</span>
                    <OnboardingStatus 
                      onboarding={selectedClient.progress?.onboarding || {}} 
                      clientId={selectedClient._id}
                    />
                    {selectedClient.progress?.onboarding?.step && !selectedClient.progress?.onboarding?.completed && (
                      <span className="progress-note">Currently at step {selectedClient.progress.onboarding.step}</span>
                    )}
                  </div>
                  
                  <div className="progress-item">
                    <span className="progress-label">Subscription:</span>
                    <SubscriptionStatus 
                      subscription={selectedClient.progress?.subscription || {}} 
                      clientId={selectedClient._id}
                    />
                    {selectedClient.progress?.subscription?.planName && (
                      <span className="progress-note">
                        Plan: {selectedClient.progress.subscription.planName} 
                        ({selectedClient.progress.subscription.interval})
                      </span>
                    )}
                  </div>
                  
                  <div className="progress-item">
                    <span className="progress-label">Amazon Integration:</span>
                    <IntegrationStatus 
                      platform="amazon"
                      connected={selectedClient.progress?.integrations?.amazon || false} 
                      clientId={selectedClient._id}
                    />
                  </div>
                  
                  <div className="progress-item">
                    <span className="progress-label">Shopify Integration:</span>
                    <IntegrationStatus 
                      platform="shopify"
                      connected={selectedClient.progress?.integrations?.shopify || false} 
                      clientId={selectedClient._id}
                    />
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Recommended Actions</h4>
                <ul className="recommendations">
                  {!selectedClient.progress?.onboarding?.completed && (
                    <li>📋 Help client complete onboarding process</li>
                  )}
                  {(selectedClient.progress?.subscription?.status === 'expired' || 
                    selectedClient.progress?.subscription?.status === 'none') && (
                    <li>💳 Assist with subscription setup or renewal</li>
                  )}
                  {!selectedClient.progress?.integrations?.amazon && (
                    <li>📦 Guide client through Amazon integration</li>
                  )}
                  {!selectedClient.progress?.integrations?.shopify && (
                    <li>🛍️ Help connect Shopify store</li>
                  )}
                  {selectedClient.progress?.onboarding?.completed && 
                   selectedClient.progress?.subscription?.status === 'active' &&
                   selectedClient.progress?.integrations?.amazon &&
                   selectedClient.progress?.integrations?.shopify && (
                    <li>✅ Client is fully set up - provide ongoing support</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffClientsDashboard;