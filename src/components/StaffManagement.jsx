import { useState } from 'react';
import {
  useCreateStaffMutation,
  useGetAllStaffQuery,
  useDeactivateStaffMutation,
  useReactivateStaffMutation
} from '../features/auth/authApi';

const StaffManagement = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  const [createStaff, { isLoading: isCreating }] = useCreateStaffMutation();
  const { data: staffData, isLoading, refetch } = useGetAllStaffQuery();
  const [deactivateStaff] = useDeactivateStaffMutation();
  const [reactivateStaff] = useReactivateStaffMutation();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.first_name) {
      errors.first_name = 'First name is required';
    }
    
    if (!formData.last_name) {
      errors.last_name = 'Last name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const result = await createStaff(formData).unwrap();
      if (result.success) {
        alert('Staff member created successfully!');
        setShowCreateForm(false);
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          phoneNumber: ''
        });
        refetch(); // Refresh staff list
      }
    } catch (err) {
      alert(err.data?.message || 'Failed to create staff member');
    }
  };
  
  const handleDeactivate = async (staffId, staffName) => {
    if (window.confirm(`Are you sure you want to deactivate ${staffName}?`)) {
      try {
        const result = await deactivateStaff(staffId).unwrap();
        if (result.success) {
          alert('Staff member deactivated successfully');
          refetch();
        }
      } catch (err) {
        alert('Failed to deactivate staff member');
      }
    }
  };
  
  const handleReactivate = async (staffId, staffName) => {
    if (window.confirm(`Are you sure you want to reactivate ${staffName}?`)) {
      try {
        const result = await reactivateStaff(staffId).unwrap();
        if (result.success) {
          alert('Staff member reactivated successfully');
          refetch();
        }
      } catch (err) {
        alert('Failed to reactivate staff member');
      }
    }
  };
  
  return (
    <div className="staff-management">
      <div className="staff-header">
        <h2>Staff Management</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create New Staff'}
        </button>
      </div>
      
      {showCreateForm && (
        <div className="create-staff-form">
          <h3>Create Staff Member</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name *</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={formErrors.first_name ? 'error' : ''}
                />
                {formErrors.first_name && (
                  <span className="field-error">{formErrors.first_name}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="last_name">Last Name *</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={formErrors.last_name ? 'error' : ''}
                />
                {formErrors.last_name && (
                  <span className="field-error">{formErrors.last_name}</span>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={formErrors.email ? 'error' : ''}
              />
              {formErrors.email && (
                <span className="field-error">{formErrors.email}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={formErrors.password ? 'error' : ''}
                placeholder="Minimum 6 characters"
              />
              {formErrors.password && (
                <span className="field-error">{formErrors.password}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number (Optional)</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn-submit"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Staff Member'}
            </button>
          </form>
        </div>
      )}
      
      <div className="staff-list">
        <h3>Current Staff Members</h3>
        {isLoading ? (
          <div className="loading">Loading staff members...</div>
        ) : (
          <div className="staff-table-container">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffData?.data?.length > 0 ? (
                  staffData.data.map((staff) => (
                    <tr key={staff._id}>
                      <td>{staff.first_name} {staff.last_name}</td>
                      <td>{staff.email}</td>
                      <td>{staff.phoneNumber || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${staff.active ? 'active' : 'inactive'}`}>
                          {staff.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {staff.createdBy ? 
                          `${staff.createdBy.first_name} ${staff.createdBy.last_name}` : 
                          'System'
                        }
                      </td>
                      <td>
                        {staff.active ? (
                          <button
                            className="btn-danger"
                            onClick={() => handleDeactivate(staff._id, `${staff.first_name} ${staff.last_name}`)}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            className="btn-success"
                            onClick={() => handleReactivate(staff._id, `${staff.first_name} ${staff.last_name}`)}
                          >
                            Reactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">No staff members found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;