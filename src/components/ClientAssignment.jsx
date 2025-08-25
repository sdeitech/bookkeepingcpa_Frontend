import { useState, useEffect } from 'react';
import { 
  useGetUsersQuery,
  useGetAllStaffQuery,
  useGetClientsWithAssignmentsQuery,
  useAssignClientMutation,
  useUnassignClientMutation 
} from '../features/auth/authApi';

const ClientAssignment = () => {
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [showAssignForm, setShowAssignForm] = useState(false);
  
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
      
      <div className="assignments-list">
        <h3>Current Assignments</h3>
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
                  <th>Assigned Staff</th>
                  <th>Staff Email</th>
                  <th>Client Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignmentsData?.data?.length > 0 ? (
                  assignmentsData.data.map((client) => (
                    <tr key={client._id}>
                      <td>{client.first_name} {client.last_name}</td>
                      <td>{client.email}</td>
                      <td>{client.phoneNumber || 'N/A'}</td>
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
                    <td colSpan="7" className="text-center">
                      No clients found
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
      `}</style>
    </div>
  );
};

export default ClientAssignment;