import React, { useState, useRef, useCallback } from 'react';
import { useUploadDocumentMutation, useUploadMultipleDocumentsMutation, useGetCategoriesQuery } from '../../features/document/documentApi';
import './DocumentUpload.css';

const DocumentUpload = ({ onUploadSuccess, multipleFiles = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [category, setCategory] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});

  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  // RTK Query hooks
  const [uploadDocument, { isLoading: isUploading }] = useUploadDocumentMutation();
  const [uploadMultipleDocuments, { isLoading: isUploadingMultiple }] = useUploadMultipleDocumentsMutation();
  const { data: categoriesResponse, isLoading: loadingCategories } = useGetCategoriesQuery();
  const categories = categoriesResponse?.data || [];

  // File validation
  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: `${file.name}: File size exceeds 10MB` };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: `${file.name}: File type not supported` };
    }

    return { valid: true };
  };

  // Handle drag events
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = [...e.dataTransfer.files];
    handleFiles(files);
  }, []);

  // Handle file selection
  const handleFiles = (files) => {
    const validFiles = [];
    const errors = {};

    files.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors[file.name] = validation.error;
      }
    });

    setUploadErrors(errors);

    if (multipleFiles) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    } else {
      setSelectedFiles(validFiles.slice(0, 1));
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const files = [...e.target.files];
    handleFiles(files);
  };

  // Remove selected file
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    const fileName = selectedFiles[index]?.name;
    if (fileName) {
      setUploadErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fileName];
        return newErrors;
      });
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileName];
        return newProgress;
      });
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!category) {
      alert('Please select a document category');
      return;
    }

    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    const formData = new FormData();
    
    // Add files
    if (multipleFiles) {
      selectedFiles.forEach(file => {
        formData.append('documents', file);
      });
    } else {
      formData.append('document', selectedFiles[0]);
    }

    // Add metadata
    formData.append('category', category);

    try {
      let result;
      if (multipleFiles) {
        result = await uploadMultipleDocuments(formData).unwrap();
      } else {
        result = await uploadDocument(formData).unwrap();
      }

      // Clear form on success
      setSelectedFiles([]);
      setCategory('');
      setUploadErrors({});
      setUploadProgress({});

      // Callback
      if (onUploadSuccess) {
        onUploadSuccess(result.data);
      }

      alert('Documents uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error.data?.message || error.message}`);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isProcessing = isUploading || isUploadingMultiple;

  return (
    <div className="document-upload-container">
      <h2>Upload Documents</h2>
      
      {/* Category Selection */}
      <div className="form-group">
        <label htmlFor="category">Document Category <span className="required">*</span></label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          disabled={isProcessing}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Drag and Drop Area */}
      <div
        className={`dropzone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <div className="dropzone-icon">📁</div>
        <p>
          {isDragging
            ? 'Drop files here...'
            : `Drag and drop ${multipleFiles ? 'files' : 'a file'} here, or click to browse`}
        </p>
        <p className="format-text">Supported formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX</p>
        <p className="size-text">Maximum file size: 10MB</p>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          multiple={multipleFiles}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
          style={{ display: 'none' }}
          disabled={isProcessing}
        />
      </div>

      {/* Upload Errors */}
      {Object.keys(uploadErrors).length > 0 && (
        <div className="error-container">
          <h4>Upload Errors:</h4>
          <ul>
            {Object.entries(uploadErrors).map(([fileName, error]) => (
              <li key={fileName}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <h3>Selected Files:</h3>
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index} className="file-item">
                <div className="file-info">
                  <span className="file-icon">📄</span>
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({formatFileSize(file.size)})</span>
                  {uploadProgress[file.name] && (
                    <span className="file-progress">Uploading: {uploadProgress[file.name]}%</span>
                  )}
                </div>
                <button
                  onClick={() => removeFile(index)}
                  disabled={isProcessing}
                  className="btn-remove"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload Button */}
      <div className="action-buttons">
        <button
          onClick={handleUpload}
          disabled={isProcessing || selectedFiles.length === 0 || !category}
          className="btn-primary"
        >
          {isProcessing ? 'Uploading...' : 'Upload Documents'}
        </button>
        
        {selectedFiles.length > 0 && (
          <button
            onClick={() => {
              setSelectedFiles([]);
              setUploadErrors({});
              setUploadProgress({});
            }}
            disabled={isProcessing}
            className="btn-secondary"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;