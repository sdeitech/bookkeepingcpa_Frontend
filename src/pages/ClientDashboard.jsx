import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, selectCurrentUser } from '../features/auth/authSlice';
import AmazonIntegration from '../components/Amazon/AmazonIntegration';
import AmazonSandbox from '../components/Amazon/AmazonSandbox';
import ProfileEdit from '../components/Profile/ProfileEdit';
import NotificationBell from '../components/Notifications/NotificationBell';
import '../components/Notifications/NotificationBell.css';
import '../components/Notifications/NotificationPanel.css';
import '../components/Notifications/NotificationItem.css';

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Client Dashboard</h1>
          <div className="user-section">
            <span className="welcome-text">
              Welcome, {user?.first_name} {user?.last_name}!
            </span>
            <span className="role-badge">Client</span>
            {/* Notification Bell */}
            <NotificationBell />
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Client Profile Section */}
          <section className="user-info-card">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>My Profile</h2>
              <button
                className="btn-primary"
                onClick={() => setShowProfileEdit(true)}
                style={{
                  padding: '8px 16px',
                  background: '#4299e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Edit Profile
              </button>
            </div>
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
                <label>Address:</label>
                <span>{user?.address || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>Date of Birth:</label>
                <span>{user?.dob ? new Date(user.dob).toLocaleDateString() : 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>Account Type:</label>
                <span>Client</span>
              </div>
              <div className="info-item">
                <label>Account Status:</label>
                <span className="status-active">Active</span>
              </div>
              <div className="info-item">
                <label>Member Since:</label>
                <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </section>
          
          {/* Client Statistics */}
          <section className="stats-section">
            <h2>Account Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">0</div>
                <div className="stat-label">Documents</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">0</div>
                <div className="stat-label">Messages</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">0</div>
                <div className="stat-label">Pending Items</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {new Date().toLocaleDateString()}
                </div>
                <div className="stat-label">Last Login</div>
              </div>
            </div>
          </section>
          
          {/* Client Navigation */}
          <section className="client-navigation">
            <h2>Services</h2>
            <div className="action-buttons">
              <button
                className={`action-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`action-btn ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                My Documents
              </button>
              <button
                className={`action-btn ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                Services
              </button>
              <button
                className={`action-btn ${activeTab === 'billing' ? 'active' : ''}`}
                onClick={() => setActiveTab('billing')}
              >
                Billing
              </button>
              <button
                className={`action-btn ${activeTab === 'support' ? 'active' : ''}`}
                onClick={() => setActiveTab('support')}
              >
                Support
              </button>
              <button
                className={`action-btn ${activeTab === 'amazon' ? 'active' : ''}`}
                onClick={() => setActiveTab('amazon')}
              >
                Amazon Integration
              </button>
              <button
                className={`action-btn ${activeTab === 'amazon-sandbox' ? 'active' : ''}`}
                onClick={() => setActiveTab('amazon-sandbox')}
              >
                Amazon Sandbox
              </button>
            </div>
          </section>
          
          {/* Conditional Content Based on Active Tab */}
          {activeTab === 'overview' && (
            <>
              <section className="welcome-section">
                <h2>Welcome to Plurify</h2>
                <div className="welcome-content">
                  <p>We're glad to have you as our valued client. This dashboard is your central hub for accessing all our services and managing your account.</p>
                  <div className="quick-links">
                    <h3>Quick Links</h3>
                    <ul>
                      <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('documents'); }}>Upload Documents</a></li>
                      <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('services'); }}>View Available Services</a></li>
                      <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('support'); }}>Contact Support</a></li>
                    </ul>
                  </div>
                </div>
              </section>
              
              <section className="announcements">
                <h2>Announcements</h2>
                <div className="announcement-list">
                  <div className="announcement-item">
                    <div className="announcement-header">
                      <span className="announcement-badge">New</span>
                      <span className="announcement-date">{new Date().toLocaleDateString()}</span>
                    </div>
                    <h4>Welcome to Plurify!</h4>
                    <p>Your account has been successfully created. Explore our services and features.</p>
                  </div>
                </div>
              </section>
            </>
          )}
          
          {activeTab === 'documents' && (
            <section className="documents-section">
              <h2>My Documents</h2>
              <div className="documents-header">
                <button className="btn-primary">Upload Document</button>
              </div>
              <div className="documents-list">
                <div className="empty-state">
                  <p>No documents uploaded yet.</p>
                  <span>Upload your first document to get started.</span>
                </div>
              </div>
            </section>
          )}
          
          {activeTab === 'services' && (
            <section className="services-section">
              <h2>Available Services</h2>
              <div className="services-grid">
                <div className="service-card">
                  <div className="service-icon">📊</div>
                  <h3>Tax Planning</h3>
                  <p>Professional tax planning and preparation services.</p>
                  <button className="btn-outline">Learn More</button>
                </div>
                <div className="service-card">
                  <div className="service-icon">📈</div>
                  <h3>Financial Consulting</h3>
                  <p>Expert financial advice and consulting services.</p>
                  <button className="btn-outline">Learn More</button>
                </div>
                <div className="service-card">
                  <div className="service-icon">📑</div>
                  <h3>Document Management</h3>
                  <p>Secure document storage and management.</p>
                  <button className="btn-outline">Learn More</button>
                </div>
                <div className="service-card">
                  <div className="service-icon">💼</div>
                  <h3>Business Advisory</h3>
                  <p>Strategic business advisory services.</p>
                  <button className="btn-outline">Learn More</button>
                </div>
              </div>
            </section>
          )}
          
          {activeTab === 'billing' && (
            <section className="billing-section">
              <h2>Billing & Payments</h2>
              <div className="billing-summary">
                <div className="billing-card">
                  <h3>Current Balance</h3>
                  <div className="balance-amount">$0.00</div>
                  <button className="btn-primary">Make Payment</button>
                </div>
                <div className="billing-history">
                  <h3>Payment History</h3>
                  <div className="empty-state">
                    <p>No payment history available.</p>
                  </div>
                </div>
              </div>
            </section>
          )}
          
          {activeTab === 'support' && (
            <section className="support-section">
              <h2>Support Center</h2>
              <div className="support-options">
                <div className="support-card">
                  <div className="support-icon">📧</div>
                  <h3>Email Support</h3>
                  <p>Send us an email and we'll respond within 24 hours.</p>
                  <a href="mailto:support@plurify.com" className="btn-primary">Send Email</a>
                </div>
                <div className="support-card">
                  <div className="support-icon">💬</div>
                  <h3>Live Chat</h3>
                  <p>Chat with our support team in real-time.</p>
                  <button className="btn-primary">Start Chat</button>
                </div>
                <div className="support-card">
                  <div className="support-icon">📞</div>
                  <h3>Phone Support</h3>
                  <p>Call us directly for immediate assistance.</p>
                  <a href="tel:1-800-PLURIFY" className="btn-primary">Call Now</a>
                </div>
              </div>
              
              <div className="faq-section">
                <h3>Frequently Asked Questions</h3>
                <div className="faq-list">
                  <details className="faq-item">
                    <summary>How do I upload documents?</summary>
                    <p>Navigate to the Documents tab and click on "Upload Document" button to upload your files.</p>
                  </details>
                  <details className="faq-item">
                    <summary>How can I contact my assigned staff?</summary>
                    <p>You can send messages through the messaging system or use the support options above.</p>
                  </details>
                  <details className="faq-item">
                    <summary>What payment methods do you accept?</summary>
                    <p>We accept all major credit cards, bank transfers, and online payment methods.</p>
                  </details>
                </div>
              </div>
            </section>
          )}
          
          {activeTab === 'amazon' && (
            <section className="amazon-section">
              <AmazonIntegration />
            </section>
          )}
          
          {activeTab === 'amazon-sandbox' && (
            <section className="amazon-sandbox-section">
              <AmazonSandbox />
            </section>
          )}
          
          {/* Recent Activity */}
          <section className="recent-activity">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-icon">✅</span>
                <div className="activity-details">
                  <p>Account created successfully</p>
                  <span className="activity-time">Today</span>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-icon">🔐</span>
                <div className="activity-details">
                  <p>Logged in to your account</p>
                  <span className="activity-time">Just now</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <ProfileEdit onClose={() => setShowProfileEdit(false)} />
      )}
    </div>
  );
};

export default ClientDashboard;