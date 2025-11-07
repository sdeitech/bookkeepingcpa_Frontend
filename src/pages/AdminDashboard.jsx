import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, selectCurrentUser } from '../features/auth/authSlice';
import { useGetUsersQuery } from '../features/auth/authApi';
import StaffManagement from '../components/StaffManagement';
import ClientAssignment from '../components/ClientAssignment';
import AdminClientViewer from '../components/Admin/ClientViewer/AdminClientViewer';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const { data: usersData, isLoading, error } = useGetUsersQuery();
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <div className="user-section">
            <span className="welcome-text">
              Welcome, {user?.first_name} {user?.last_name}!
            </span>
            <span className="role-badge">Super Admin</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Admin Profile Section */}
          <section className="user-info-card">
            <h2>Admin Profile</h2>
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
                <label>Role:</label>
                <span>Super Admin</span>
              </div>
              <div className="info-item">
                <label>Account Status:</label>
                <span className="status-active">Active</span>
              </div>
            </div>
          </section>
          
          {/* Admin Statistics */}
          <section className="stats-section">
            <h2>System Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">
                  {usersData?.data?.filter(u => u.role_id === '2').length || 0}
                </div>
                <div className="stat-label">Total Staff</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {usersData?.data?.filter(u => u.role_id === '2' && u.active).length || 0}
                </div>
                <div className="stat-label">Active Staff</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {usersData?.data?.filter(u => u.role_id === '3').length || 0}
                </div>
                <div className="stat-label">Total Clients</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {usersData?.data?.filter(u => u.active).length || 0}
                </div>
                <div className="stat-label">Active Users</div>
              </div>
            </div>
          </section>
          
          {/* Admin Quick Actions */}
          <section className="admin-actions">
            <h2>Administration</h2>
            <div className="action-buttons">
              <button
                className={`action-btn ${activeTab === 'staff' ? 'active' : ''}`}
                onClick={() => setActiveTab('staff')}
              >
                Manage Staff
              </button>
              <button
                className={`action-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`action-btn ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                All Users
              </button>
              <button
                className={`action-btn ${activeTab === 'assignments' ? 'active' : ''}`}
                onClick={() => setActiveTab('assignments')}
              >
                Client Assignments
              </button>
              <button
                className={`action-btn ${activeTab === 'client-viewer' ? 'active' : ''}`}
                onClick={() => setActiveTab('client-viewer')}
              >
                Client Viewer
              </button>
              <button className="action-btn">System Settings</button>
              <button className="action-btn">Reports</button>
            </div>
          </section>
          
          {/* Conditional Content Based on Active Tab */}
          {activeTab === 'staff' && <StaffManagement />}
          
          {activeTab === 'assignments' && <ClientAssignment />}
          
          {activeTab === 'client-viewer' && <AdminClientViewer />}
          
          {activeTab === 'users' && (
            <section className="users-section">
              <h2>All System Users</h2>
              {isLoading ? (
                <div className="loading">Loading users...</div>
              ) : error ? (
                <div className="error-message">Failed to load users</div>
              ) : (
                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersData?.data?.map((user) => (
                        <tr key={user._id}>
                          <td>{user.first_name} {user.last_name}</td>
                          <td>{user.email}</td>
                          <td>{user.phoneNumber || 'N/A'}</td>
                          <td>
                            <span className="role-tag">
                              {user.role_id === '1' ? 'Super Admin' : 
                               user.role_id === '2' ? 'Staff' : 'Client'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                              {user.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
          
          {activeTab === 'overview' && (
            <>
              <section className="recent-activity">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-icon">👤</span>
                    <div className="activity-details">
                      <p>New client registered</p>
                      <span className="activity-time">2 hours ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">👥</span>
                    <div className="activity-details">
                      <p>Staff member added</p>
                      <span className="activity-time">5 hours ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">🔄</span>
                    <div className="activity-details">
                      <p>System backup completed</p>
                      <span className="activity-time">1 day ago</span>
                    </div>
                  </div>
                </div>
              </section>
              
              <section className="system-health">
                <h2>System Health</h2>
                <div className="health-indicators">
                  <div className="health-item">
                    <span className="health-status good">●</span>
                    <span>Database: Operational</span>
                  </div>
                  <div className="health-item">
                    <span className="health-status good">●</span>
                    <span>API: Responsive</span>
                  </div>
                  <div className="health-item">
                    <span className="health-status good">●</span>
                    <span>Storage: 45% Used</span>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;