import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, selectCurrentUser } from '../features/auth/authSlice';
import { useGetMyClientsQuery, useGetStaffDashboardQuery } from '../features/auth/authApi';

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('clients');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  
  // Fetch assigned clients and dashboard data
  const { data: myClients, isLoading: loadingClients, refetch: refetchClients } = useGetMyClientsQuery();
  const { data: dashboardData, isLoading: loadingDashboard } = useGetStaffDashboardQuery();
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Staff Dashboard</h1>
          <div className="user-section">
            <span className="welcome-text">
              Welcome, {user?.first_name} {user?.last_name}!
            </span>
            <span className="role-badge">Staff Member</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Staff Profile Section */}
          <section className="user-info-card">
            <h2>Staff Profile</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Name:</label>
                <span>{user?.first_name} {user?.last_name}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{user?.email}</span>
              </div>
              <div className="info-item">
                <label>Phone:</label>
                <span>{user?.phoneNumber || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>Role:</label>
                <span>Staff Member</span>
              </div>
              <div className="info-item">
                <label>Account Status:</label>
                <span className="status-active">Active</span>
              </div>
              <div className="info-item">
                <label>Created By:</label>
                <span>{user?.createdBy?.first_name} {user?.createdBy?.last_name || 'System Admin'}</span>
              </div>
            </div>
          </section>
          
          {/* Staff Statistics */}
          <section className="stats-section">
            <h2>Work Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">
                  {dashboardData?.data?.stats?.assignedClients || 0}
                </div>
                <div className="stat-label">Assigned Clients</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {dashboardData?.data?.stats?.pendingTasks || 0}
                </div>
                <div className="stat-label">Pending Tasks</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {dashboardData?.data?.stats?.completedToday || 0}
                </div>
                <div className="stat-label">Completed Today</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {myClients?.data?.filter(c => c.active).length || 0}
                </div>
                <div className="stat-label">Active Clients</div>
              </div>
            </div>
          </section>
          
          {/* Staff Navigation */}
          <section className="staff-navigation">
            <h2>Quick Access</h2>
            <div className="action-buttons">
              <button
                className={`action-btn ${activeTab === 'clients' ? 'active' : ''}`}
                onClick={() => setActiveTab('clients')}
              >
                My Clients
              </button>
              <button
                className={`action-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveTab('tasks')}
              >
                Tasks
              </button>
              <button
                className={`action-btn ${activeTab === 'schedule' ? 'active' : ''}`}
                onClick={() => setActiveTab('schedule')}
              >
                Schedule
              </button>
              <button
                className={`action-btn ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                Reports
              </button>
            </div>
          </section>
          
          {/* Conditional Content Based on Active Tab */}
          {activeTab === 'tasks' && (
            <section className="tasks-section">
              <h2>My Tasks</h2>
              <div className="task-list">
                <div className="empty-state">
                  <p>No tasks assigned yet.</p>
                  <span>Tasks assigned by the admin will appear here.</span>
                </div>
              </div>
            </section>
          )}
          
          {activeTab === 'clients' && (
            <section className="clients-section">
              <h2>My Assigned Clients</h2>
              {loadingClients ? (
                <div className="loading">Loading clients...</div>
              ) : myClients?.data?.length > 0 ? (
                <div className="clients-table-container">
                  <table className="clients-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Member Since</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myClients.data.map((client) => (
                        <tr key={client._id}>
                          <td>{client.first_name} {client.last_name}</td>
                          <td>{client.email}</td>
                          <td>{client.phoneNumber || 'N/A'}</td>
                          <td>
                            <span className={`status-badge ${client.active ? 'active' : 'inactive'}`}>
                              {client.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button className="btn-primary-small">View Details</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No clients assigned to you yet.</p>
                  <span>Clients assigned by the admin will appear here.</span>
                </div>
              )}
            </section>
          )}
          
          {activeTab === 'schedule' && (
            <section className="schedule-section">
              <h2>My Schedule</h2>
              <div className="schedule-view">
                <div className="schedule-header">
                  <h3>Today - {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                </div>
                <div className="schedule-content">
                  <div className="empty-state">
                    <p>No scheduled items for today.</p>
                  </div>
                </div>
              </div>
            </section>
          )}
          
          {activeTab === 'reports' && (
            <section className="reports-section">
              <h2>My Reports</h2>
              <div className="reports-summary">
                <div className="report-card">
                  <h3>Weekly Summary</h3>
                  <div className="report-stats">
                    <div className="report-item">
                      <span className="report-label">Tasks Completed:</span>
                      <span className="report-value">0</span>
                    </div>
                    <div className="report-item">
                      <span className="report-label">Clients Served:</span>
                      <span className="report-value">0</span>
                    </div>
                    <div className="report-item">
                      <span className="report-label">Hours Logged:</span>
                      <span className="report-value">0</span>
                    </div>
                  </div>
                </div>
                <div className="report-card">
                  <h3>Monthly Performance</h3>
                  <div className="report-stats">
                    <div className="report-item">
                      <span className="report-label">Total Tasks:</span>
                      <span className="report-value">0</span>
                    </div>
                    <div className="report-item">
                      <span className="report-label">Completion Rate:</span>
                      <span className="report-value">N/A</span>
                    </div>
                    <div className="report-item">
                      <span className="report-label">Client Satisfaction:</span>
                      <span className="report-value">N/A</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
          
          {/* Recent Clients */}
          {dashboardData?.data?.recentClients?.length > 0 && (
            <section className="recent-clients">
              <h2>Recent Clients</h2>
              <div className="recent-clients-list">
                {dashboardData.data.recentClients.map((client) => (
                  <div key={client._id} className="recent-client-card">
                    <div className="client-info">
                      <h4>{client.first_name} {client.last_name}</h4>
                      <p>{client.email}</p>
                      {client.phoneNumber && <p>📞 {client.phoneNumber}</p>}
                    </div>
                    <span className={`status-badge ${client.active ? 'active' : 'inactive'}`}>
                      {client.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          <style jsx>{`
            .clients-table {
              width: 100%;
              border-collapse: collapse;
            }
            
            .clients-table th,
            .clients-table td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #eee;
            }
            
            .clients-table th {
              background: #f5f5f5;
              font-weight: 600;
            }
            
            .status-badge {
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
            }
            
            .status-badge.active {
              background: #e8f5e9;
              color: #2e7d32;
            }
            
            .status-badge.inactive {
              background: #ffebee;
              color: #c62828;
            }
            
            .btn-primary-small {
              padding: 4px 12px;
              background: #2196F3;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
            }
            
            .btn-primary-small:hover {
              background: #1976D2;
            }
            
            .recent-clients {
              margin-top: 30px;
            }
            
            .recent-clients-list {
              display: grid;
              gap: 15px;
              margin-top: 15px;
            }
            
            .recent-client-card {
              background: white;
              padding: 15px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .client-info h4 {
              margin: 0 0 5px 0;
              color: #333;
            }
            
            .client-info p {
              margin: 3px 0;
              color: #666;
              font-size: 14px;
            }
            
            .empty-state {
              text-align: center;
              padding: 40px 20px;
              color: #666;
            }
            
            .empty-state p {
              font-size: 16px;
              margin-bottom: 5px;
            }
            
            .empty-state span {
              font-size: 14px;
              color: #999;
            }
          `}</style>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;