import { useState, useEffect } from 'react';
import {
  useGetUsersQuery,
  useGetAllStaffQuery,
  useGetClientsWithAssignmentsQuery,
  useAssignClientMutation,
  useUnassignClientMutation
} from '../features/auth/authApi';
import {
  OnboardingStatus,
  SubscriptionStatus,
  IntegrationStatus
} from './Progress/StatusIndicator';

const ClientAssignment = () => {
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  
  // Fetch data
  const { data: usersData, refetch: refetchUsers } = useGetUsersQuery();
  const { data: staffData, refetch: refetchStaff } = useGetAllStaffQuery();
  const { data: assignmentsData, isLoading, refetch: refetchAssignments } = useGetClientsWithAssignmentsQuery();
  
  // Mutations
  const [assignClient, { isLoading: isAssigning }] = useAssignClientMutation();
  const [unassignClient, { isLoading: isUnassigning }] = useUnassignClientMutation();
  
  // Filter clients from users (role_id: 3)
  const clients = usersData?.data?.filter(user => user.role_id === '3') || [];
  const staff = staffData?.data?.filter(s => s.active) || [];
  
  // Filter clients based on active filters
  const getFilteredClients = () => {
    let filtered = assignmentsData?.data || [];
    
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
        case 'amazon_disconnected':
          filtered = filtered.filter(c => c.progress?.integrations?.amazon === false);
          break;
        case 'shopify_connected':
          filtered = filtered.filter(c => c.progress?.integrations?.shopify === true);
          break;
        case 'shopify_disconnected':
          filtered = filtered.filter(c => c.progress?.integrations?.shopify === false);
          break;
        case 'unassigned':
          filtered = filtered.filter(c => !c.assignedStaff);
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
  
  // Calculate filter counts
  const filterCounts = {
    onboarding_complete: assignmentsData?.data?.filter(c => c.progress?.onboarding?.completed === true).length || 0,
    onboarding_incomplete: assignmentsData?.data?.filter(c => c.progress?.onboarding?.completed === false).length || 0,
    subscription_active: assignmentsData?.data?.filter(c =>
      c.progress?.subscription?.status === 'active' ||
      c.progress?.subscription?.status === 'trial'
    ).length || 0,
    subscription_expired: assignmentsData?.data?.filter(c =>
      c.progress?.subscription?.status === 'expired' ||
      c.progress?.subscription?.status === 'none'
    ).length || 0,
    amazon_connected: assignmentsData?.data?.filter(c => c.progress?.integrations?.amazon === true).length || 0,
    amazon_disconnected: assignmentsData?.data?.filter(c => c.progress?.integrations?.amazon === false).length || 0,
    shopify_connected: assignmentsData?.data?.filter(c => c.progress?.integrations?.shopify === true).length || 0,
    shopify_disconnected: assignmentsData?.data?.filter(c => c.progress?.integrations?.shopify === false).length || 0,
    unassigned: assignmentsData?.data?.filter(c => !c.assignedStaff).length || 0
  };
  
  const handleAssign = async (e) => {
    e.preventDefault();
    
    if (!selectedClient || !selectedStaff) {
      alert('Please select both client and staff member');
      return;
    }
    
    try {
      const result = await assignClient({
        clientId: selectedClient,
        staffId: selectedStaff
      }).unwrap();
      
      if (result.success) {
        alert('Client assigned successfully!');
        setSelectedClient('');
        setSelectedStaff('');
        setShowAssignForm(false);
        refetchAssignments();
      }
    } catch (err) {
      alert(err.data?.message || 'Failed to assign client');
    }
  };
  
  const handleUnassign = async (clientId, staffId, clientName, staffName) => {
    if (window.confirm(`Are you sure you want to unassign ${clientName} from ${staffName}?`)) {
      try {
        const result = await unassignClient({
          clientId,
          staffId
        }).unwrap();
        
        if (result.success) {
          alert('Client unassigned successfully');
          refetchAssignments();
        }
      } catch (err) {
        alert('Failed to unassign client');
      }
    }
  };
  
  return (
    <div className="client-assignment">
      <div className="assignment-header">
        <h2>Client Assignment Management</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowAssignForm(!showAssignForm)}
        >
          {showAssignForm ? 'Cancel' : 'Assign Client'}
        </button>
      </div>
      
      {showAssignForm && (
        <div className="assign-form-card">
          <h3>Assign Client to Staff</h3>
          <form onSubmit={handleAssign}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="client">Select Client *</label>
                <select
                  id="client"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="form-select"
                  required
                > 
                  <option value="">-- Select Client --</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.first_name} {client.last_name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="staff">Select Staff Member *</label>
                <select
                  id="staff"
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="">-- Select Staff --</option>
                  {staff.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.first_name} {member.last_name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn-submit"
              disabled={isAssigning}
            >
              {isAssigning ? 'Assigning...' : 'Assign Client'}
            </button>
          </form>
        </div>
      )}
      
      {/* Filter Pills */}
      <div className="filter-pills-container">
        <h3>Quick Filters</h3>
        <div className="filter-pills">
          <div className="filter-group">
            <span className="filter-group-label">Onboarding:</span>
            <button
              className={`filter-pill ${activeFilters.includes('onboarding_complete') ? 'active' : ''}`}
              onClick={() => toggleFilter('onboarding_complete')}
            >
              ✅ Complete <span className="count">{filterCounts.onboarding_complete}</span>
            </button>
            <button
              className={`filter-pill ${activeFilters.includes('onboarding_incomplete') ? 'active' : ''}`}
              onClick={() => toggleFilter('onboarding_incomplete')}
            >
              ❌ Incomplete <span className="count">{filterCounts.onboarding_incomplete}</span>
            </button>
          </div>
          
          <div className="filter-group">
            <span className="filter-group-label">Subscription:</span>
            <button
              className={`filter-pill ${activeFilters.includes('subscription_active') ? 'active' : ''}`}
              onClick={() => toggleFilter('subscription_active')}
            >
              💳 Active/Trial <span className="count">{filterCounts.subscription_active}</span>
            </button>
            <button
              className={`filter-pill ${activeFilters.includes('subscription_expired') ? 'active' : ''}`}
              onClick={() => toggleFilter('subscription_expired')}
            >
              ⚠️ Expired/None <span className="count">{filterCounts.subscription_expired}</span>
            </button>
          </div>
          
          <div className="filter-group">
            <span className="filter-group-label">Amazon:</span>
            <button
              className={`filter-pill ${activeFilters.includes('amazon_connected') ? 'active' : ''}`}
              onClick={() => toggleFilter('amazon_connected')}
            >
              ✅ Connected <span className="count">{filterCounts.amazon_connected}</span>
            </button>
            <button
              className={`filter-pill ${activeFilters.includes('amazon_disconnected') ? 'active' : ''}`}
              onClick={() => toggleFilter('amazon_disconnected')}
            >
              ❌ Not Connected <span className="count">{filterCounts.amazon_disconnected}</span>
            </button>
          </div>
          
          <div className="filter-group">
            <span className="filter-group-label">Shopify:</span>
            <button
              className={`filter-pill ${activeFilters.includes('shopify_connected') ? 'active' : ''}`}
              onClick={() => toggleFilter('shopify_connected')}
            >
              ✅ Connected <span className="count">{filterCounts.shopify_connected}</span>
            </button>
            <button
              className={`filter-pill ${activeFilters.includes('shopify_disconnected') ? 'active' : ''}`}
              onClick={() => toggleFilter('shopify_disconnected')}
            >
              ❌ Not Connected <span className="count">{filterCounts.shopify_disconnected}</span>
            </button>
          </div>
          
          <div className="filter-group">
            <span className="filter-group-label">Assignment:</span>
            <button
              className={`filter-pill ${activeFilters.includes('unassigned') ? 'active' : ''}`}
              onClick={() => toggleFilter('unassigned')}
            >
              👤 Unassigned <span className="count">{filterCounts.unassigned}</span>
            </button>
          </div>
          
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
      
      <div className="assignments-list">
        <h3>
          Current Assignments
          {activeFilters.length > 0 && (
            <span className="filtered-count">
              (Showing {filteredClients.length} of {assignmentsData?.data?.length || 0})
            </span>
          )}
        </h3>
        {isLoading ? (
          <div className="loading">Loading assignments...</div>
        ) : (
          <div className="assignments-table-container">
            <table className="assignments-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Client Email</th>
                  <th>Phone</th>
                  <th>Onboarding</th>
                  <th>Subscription</th>
                  <th>Amazon</th>
                  <th>Shopify</th>
                  <th>Assigned Staff</th>
                  <th>Staff Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients?.length > 0 ? (
                  filteredClients.map((client) => (
                    <tr key={client._id}>
                      <td>{client.first_name} {client.last_name}</td>
                      <td>{client.email}</td>
                      <td>{client.phoneNumber || 'N/A'}</td>
                      <td>
                        <OnboardingStatus
                          onboarding={client.progress?.onboarding || {}}
                          clientId={client._id}
                        />
                      </td>
                      <td>
                        <SubscriptionStatus
                          subscription={client.progress?.subscription || {}}
                          clientId={client._id}
                        />
                      </td>
                      <td>
                        <IntegrationStatus
                          platform="amazon"
                          connected={client.progress?.integrations?.amazon || false}
                          clientId={client._id}
                        />
                      </td>
                      <td>
                        <IntegrationStatus
                          platform="shopify"
                          connected={client.progress?.integrations?.shopify || false}
                          clientId={client._id}
                        />
                      </td>
                      <td>
                        {client.assignedStaff ? (
                          <span className="staff-badge">
                            {client.assignedStaff.staffName}
                          </span>
                        ) : (
                          <span className="unassigned-badge">Unassigned</span>
                        )}
                      </td>
                      <td>
                        {client.assignedStaff?.staffEmail || '-'}
                      </td>
                      <td>
                        <span className={`status-badge ${client.active ? 'active' : 'inactive'}`}>
                          {client.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {client.assignedStaff ? (
                          <button
                            className="btn-danger-small"
                            onClick={() => handleUnassign(
                              client._id,
                              client.assignedStaff.staffId,
                              `${client.first_name} ${client.last_name}`,
                              client.assignedStaff.staffName
                            )}
                            disabled={isUnassigning}
                          >
                            Unassign
                          </button>
                        ) : (
                          <button
                            className="btn-primary-small"
                            onClick={() => {
                              setSelectedClient(client._id);
                              setShowAssignForm(true);
                            }}
                          >
                            Assign
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center">
                      {activeFilters.length > 0 ? 'No clients match the selected filters' : 'No clients found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Staff Overview Section */}
      <div className="staff-overview">
        <h3>Staff Assignment Overview</h3>
        <div className="staff-cards">
          {staff.map(member => {
            const assignedClients = assignmentsData?.data?.filter(
              client => client.assignedStaff?.staffId === member._id
            ) || [];
            
            return (
              <div key={member._id} className="staff-card">
                <div className="staff-card-header">
                  <h4>{member.first_name} {member.last_name}</h4>
                  <span className="client-count-badge">
                    {assignedClients.length} clients
                  </span>
                </div>
                <div className="staff-card-body">
                  <p className="staff-email">{member.email}</p>
                  {assignedClients.length > 0 ? (
                    <div className="assigned-clients-list">
                      <strong>Assigned Clients:</strong>
                      <ul>
                        {assignedClients.slice(0, 3).map(client => (
                          <li key={client._id}>
                            {client.first_name} {client.last_name}
                          </li>
                        ))}
                        {assignedClients.length > 3 && (
                          <li className="more-clients">
                            +{assignedClients.length - 3} more...
                          </li>
                        )}
                      </ul>
                    </div>
                  ) : (
                    <p className="no-clients">No clients assigned</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <style jsx>{`
        .client-assignment {
          padding: 20px;
        }
        
        .assignment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .assign-form-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        .form-group label {
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        .form-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .assignments-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .assignments-table th,
        .assignments-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        .assignments-table th {
          background: #f5f5f5;
          font-weight: 600;
        }
        
        .staff-badge {
          background: #4CAF50;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .unassigned-badge {
          background: #ff9800;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .btn-danger-small,
        .btn-primary-small {
          padding: 4px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .btn-danger-small {
          background: #f44336;
          color: white;
        }
        
        .btn-primary-small {
          background: #2196F3;
          color: white;
        }
        
        .staff-overview {
          margin-top: 40px;
        }
        
        .staff-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        
        .staff-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .staff-card-header {
          background: #f5f5f5;
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .staff-card-header h4 {
          margin: 0;
          font-size: 16px;
        }
        
        .client-count-badge {
          background: #2196F3;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
        }
        
        .staff-card-body {
          padding: 15px;
        }
        
        .staff-email {
          color: #666;
          font-size: 14px;
          margin-bottom: 10px;
        }
        
        .assigned-clients-list ul {
          list-style: none;
          padding: 0;
          margin: 5px 0 0 0;
        }
        
        .assigned-clients-list li {
          padding: 3px 0;
          font-size: 14px;
        }
        
        .more-clients {
          color: #2196F3;
          font-style: italic;
        }
        
        .no-clients {
          color: #999;
          font-style: italic;
          font-size: 14px;
        }
        
        /* Filter Pills Styles */
        .filter-pills-container {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        
        .filter-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-top: 15px;
        }
        
        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .filter-group-label {
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }
        
        .filter-pill {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .filter-pill:hover {
          background-color: #e9ecef;
          border-color: #adb5bd;
        }
        
        .filter-pill.active {
          background-color: #007bff;
          color: white;
          border-color: #007bff;
        }
        
        .filter-pill .count {
          margin-left: 6px;
          padding: 2px 6px;
          background-color: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
          font-size: 11px;
        }
        
        .filter-pill.active .count {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .clear-filters-btn {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          background-color: #dc3545;
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .clear-filters-btn:hover {
          background-color: #c82333;
        }
        
        .filtered-count {
          font-size: 14px;
          color: #666;
          font-weight: normal;
          margin-left: 10px;
        }
      `}</style>
    </div>
  );
};

export default ClientAssignment;