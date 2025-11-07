import React, { useState } from 'react';
import DocumentUpload from '../components/Documents/DocumentUpload';
import DocumentList from '../components/Documents/DocumentList';
import './DocumentManagement.css';

const DocumentManagement = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'upload'
  const [refreshList, setRefreshList] = useState(0);

  // Handle successful upload
  const handleUploadSuccess = (uploadedData) => {
    // Switch to list view after successful upload
    setActiveTab('list');
    // Trigger list refresh
    setRefreshList(prev => prev + 1);
  };

  return (
    <div className="document-management-container">
      <h1>Document Management</h1>
      
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          onClick={() => setActiveTab('list')}
          className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
        >
          <span className="tab-icon">📁</span> My Documents
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
        >
          <span className="tab-icon">📤</span> Upload Documents
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'list' && (
          <DocumentList key={refreshList} />
        )}
        {activeTab === 'upload' && (
          <DocumentUpload 
            onUploadSuccess={handleUploadSuccess}
            multipleFiles={true}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentManagement;