import React, { useState, useEffect, useRef } from 'react';
import { 
  useGetUserProfileQuery, 
  useUpdateUserProfileMutation, 
  useUploadProfilePictureMutation 
} from '../../features/user/userApi';
import './ProfileEdit.css';

const ProfileEdit = ({ onClose }) => {
  const { data: profileData, isLoading, refetch } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
  const [uploadPicture, { isLoading: isUploading }] = useUploadProfilePictureMutation();
  
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phoneNumber: '',
    dob: '',
    address: ''
  });

  // Initialize form with current profile data
  useEffect(() => {
    if (profileData?.data) {
      const user = profileData.data;
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phoneNumber: user.phoneNumber || '',
        dob: user.dob || '',
        address: user.address || ''
      });
      
      // Set profile picture if exists
      if (user.profile) {
        setPreviewImage(`http://localhost:8080${user.profile}`);
      }
    }
  }, [profileData]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Validate phone number
    if (formData.phoneNumber) {
      const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Invalid phone number format';
      }
    }
    
    // Validate DOB
    if (formData.dob) {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      if (dobDate > today) {
        newErrors.dob = 'Date of birth cannot be in the future';
      }
      
      // Check if user is at least 13 years old
      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 13);
      if (dobDate > minAge) {
        newErrors.dob = 'You must be at least 13 years old';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle profile picture selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        picture: 'Only JPEG, PNG, GIF, and WebP images are allowed'
      }));
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        picture: 'Image size must be less than 5MB'
      }));
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Clear any picture errors
    setErrors(prev => ({
      ...prev,
      picture: null
    }));
    
    // Upload immediately
    handlePictureUpload(file);
  };

  // Upload profile picture
  const handlePictureUpload = async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    try {
      const result = await uploadPicture(formData).unwrap();
      if (result.success) {
        alert('Profile picture updated successfully!');
        refetch();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(prev => ({
        ...prev,
        picture: 'Failed to upload picture'
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await updateProfile(formData).unwrap();
      if (result.success) {
        alert('Profile updated successfully!');
        if (onClose) onClose();
      }
    } catch (error) {
      console.error('Update error:', error);
      alert(`Failed to update profile: ${error.data?.message || error.message}`);
    }
  };

  if (isLoading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  const user = profileData?.data;

  return (
    <div className="profile-edit-container">
      <div className="profile-edit-modal">
        <div className="profile-header">
          <h2>Edit Profile</h2>
          {onClose && (
            <button className="close-btn" onClick={onClose}>×</button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Profile Picture Section */}
          <div className="profile-picture-section">
            <div className="current-picture">
              {previewImage ? (
                <img src={previewImage} alt="Profile" />
              ) : (
                <div className="no-picture">
                  <span>No Picture</span>
                </div>
              )}
            </div>
            <div className="picture-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Change Picture'}
              </button>
              {errors.picture && (
                <span className="error-text">{errors.picture}</span>
              )}
            </div>
          </div>

          {/* Non-editable fields */}
          <div className="form-section">
            <h3>Account Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Email (Cannot be changed)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input
                  type="text"
                  value={
                    user?.role_id === '1' ? 'Admin' :
                    user?.role_id === '2' ? 'Staff' :
                    user?.role_id === '3' ? 'Client' : 'Unknown'
                  }
                  disabled
                  className="disabled-input"
                />
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                  className={errors.phoneNumber ? 'error' : ''}
                />
                {errors.phoneNumber && (
                  <span className="error-text">{errors.phoneNumber}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="dob">Date of Birth</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={errors.dob ? 'error' : ''}
                />
                {errors.dob && (
                  <span className="error-text">{errors.dob}</span>
                )}
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your address"
                rows="3"
              />
            </div>
          </div>

          {/* Account Timestamps */}
          <div className="form-section">
            <h3>Account Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Member Since:</span>
                <span className="info-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Updated:</span>
                <span className="info-value">
                  {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Account Status:</span>
                <span className={`info-value status-${user?.active ? 'active' : 'inactive'}`}>
                  {user?.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            {onClose && (
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
                disabled={isUpdating}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="save-btn"
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;