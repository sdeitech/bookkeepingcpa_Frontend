import React, { useState, useEffect } from 'react';
import {
  useGetDocumentsQuery,
  useDeleteDocumentMutation,
  useGetCategoriesQuery
} from '../../features/document/documentApi';
import './DocumentList.css';

const DocumentList = ({ onDocumentSelect }) => {
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    status: 'active'
  });
  const [currentPage, setCurrentPage] = useState(1);

  // RTK Query hooks
  const { 
    data: documentsData, 
    isLoading, 
    isFetching,
    refetch 
  } = useGetDocumentsQuery({
    ...filters,
    page: currentPage,
    limit: 20
  });

  const { data: categoriesResponse } = useGetCategoriesQuery();
  const categories = categoriesResponse?.data || [];
  const [deleteDocument] = useDeleteDocumentMutation();

  // Extract documents and pagination from response
  const documents = documentsData?.data?.documents || [];
  const pagination = documentsData?.data?.pagination || {};

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get category label
  const getCategoryLabel = (categoryValue) => {
    const category = categories.find(c => c.value === categoryValue);
    return category?.label || categoryValue;
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle document deletion
  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await deleteDocument(documentId).unwrap();
      alert('Document deleted successfully');
      refetch();
    } catch (error) {
      console.error('Delete failed:', error);
      alert(`Failed to delete document: ${error.data?.message || error.message}`);
    }
  };

  // Handle document download
  const handleDownload = (documentId, fileName) => {
    const token = localStorage.getItem('token');
    // Import config at the top of the file if not already imported
    const baseUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:8080/api'
      : `${window.location.protocol}//${window.location.hostname}/api`;
    const downloadUrl = `${baseUrl}/documents/${documentId}/download`;
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    
    // Add authorization header via fetch
    fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error('Download failed:', error);
      alert('Failed to download document');
    });
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      status: 'active'
    });
    setCurrentPage(1);
  };

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    const iconMap = {
      'pdf': '📄',
      'doc': '📝',
      'docx': '📝',
      'xls': '📊',
      'xlsx': '📊',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'png': '🖼️'
    };
    return iconMap[fileType?.toLowerCase()] || '📎';
  };

  return (
    <div className="document-list-container">
      <h2>My Documents</h2>

      {/* Filters */}
      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters-grid">
          {/* Search */}
          <input
            type="text"
            placeholder="Search documents..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="filter-input"
          />

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          <button onClick={clearFilters} className="btn-clear-filters">Clear Filters</button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <p className="loading-message">Loading documents...</p>}

      {/* Documents Table */}
      {!isLoading && documents.length === 0 ? (
        <div className="empty-state">
          <p>No documents found.</p>
          <span>Upload your first document to get started!</span>
        </div>
      ) : (
        <table className="documents-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Name</th>
              <th>Category</th>
              <th>Size</th>
              <th>Uploaded</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc._id}>
                <td>
                  <span className="file-icon">{getFileIcon(doc.fileType)}</span>
                </td>
                <td>
                  <div className="file-name">{doc.originalName}</div>
                </td>
                <td>{getCategoryLabel(doc.category)}</td>
                <td>{formatFileSize(doc.fileSize)}</td>
                <td>{formatDate(doc.createdAt)}</td>
                <td>
                  <span className={`status-badge ${doc.status}`}>
                    {doc.status}
                  </span>
                </td>
                <td className="action-buttons">
                  <button
                    onClick={() => handleDownload(doc._id, doc.originalName)}
                    className="btn-action download"
                    title="Download"
                  >
                    ⬇️
                  </button>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="btn-action delete"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.pages} 
            ({pagination.total} total documents)
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
            disabled={currentPage === pagination.pages}
          >
            Next
          </button>
        </div>
      )}
 
    </div>
  );
};

export default DocumentList;