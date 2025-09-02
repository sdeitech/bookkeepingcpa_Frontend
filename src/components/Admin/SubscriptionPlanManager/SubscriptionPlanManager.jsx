import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import {
  useGetSubscriptionPlansQuery,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation
} from '../../../features/subscription/subscriptionApi';
import { Plus, Edit2, Trash2, Save, X, Check, Shield, Star } from 'lucide-react';
import './SubscriptionPlanManager.scss';

const SubscriptionPlanManager = () => {
  // Check if user is admin (role_id: '1')
  const user = useSelector(state => state.auth.user);
  const isAdmin = user?.role_id === '1';

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerMonth: '',
    pricePerYear: '',
    features: {
      amazonIntegration: false,
      walmartIntegration: false,
      shopifyIntegration: false,
      advancedAnalytics: false,
      prioritySupport: false,
      customReports: false
    },
    trialDays: 0,
    isPopular: false,
    isActive: true
  });

  // RTK Query hooks - extract data from nested response
  const { data: plansResponse, isLoading, refetch } = useGetSubscriptionPlansQuery();
  const plans = plansResponse?.data || [];
  const [createPlan, { isLoading: isCreatingPlan }] = useCreateSubscriptionPlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdateSubscriptionPlanMutation();
  const [deletePlan, { isLoading: isDeleting }] = useDeleteSubscriptionPlanMutation();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('features.')) {
      const featureName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        features: {
          ...prev.features,
          [featureName]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const planData = {
        ...formData,
        pricePerMonth: parseFloat(formData.pricePerMonth),
        pricePerYear: parseFloat(formData.pricePerYear),
        trialDays: parseInt(formData.trialDays) || 0
      };

      if (editingPlan) {
        await updatePlan({ id: editingPlan._id, ...planData }).unwrap();
        alert('Plan updated successfully!');
        setEditingPlan(null);
      } else {
        await createPlan(planData).unwrap();
        alert('Plan created successfully!');
        setIsCreating(false);
      }
      
      resetForm();
      refetch();
    } catch (error) {
      alert('Error: ' + (error?.data?.message || error.message));
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      pricePerMonth: plan.pricePerMonth,
      pricePerYear: plan.pricePerYear,
      features: plan.features || {
        amazonIntegration: false,
        walmartIntegration: false,
        shopifyIntegration: false,
        advancedAnalytics: false,
        prioritySupport: false,
        customReports: false
      },
      trialDays: plan.trialDays || 0,
      isPopular: plan.isPopular || false,
      isActive: plan.isActive !== false
    });
    setIsCreating(true);
  };

  const handleDelete = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await deletePlan(planId).unwrap();
        alert('Plan deleted successfully!');
        refetch();
      } catch (error) {
        alert('Error deleting plan: ' + (error?.data?.message || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      pricePerMonth: '',
      pricePerYear: '',
      features: {
        amazonIntegration: false,
        walmartIntegration: false,
        shopifyIntegration: false,
        advancedAnalytics: false,
        prioritySupport: false,
        customReports: false
      },
      trialDays: 0,
      isPopular: false,
      isActive: true
    });
    setEditingPlan(null);
    setIsCreating(false);
  };

  if (isLoading) {
    return <div className="loading">Loading plans...</div>;
  }

  return (
    <div className="subscription-plan-manager">
      <div className="manager-header">
        <h1>Subscription Plans Management (Admin Only)</h1>
        {!isCreating && (
          <button 
            className="btn btn-primary"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Plan
          </button>
        )}
      </div>

      {/* Plan Creation/Edit Form */}
      {isCreating && (
        <div className="plan-form-container">
          <div className="form-header">
            <h2>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
            <button className="btn-close" onClick={resetForm}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="plan-form">
            <div className="form-row">
              <div className="form-group">
                <label>Plan Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Professional"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Perfect for growing businesses"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Monthly Price ($) *</label>
                <input
                  type="number"
                  name="pricePerMonth"
                  value={formData.pricePerMonth}
                  onChange={handleInputChange}
                  placeholder="49.99"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Yearly Price ($) *</label>
                <input
                  type="number"
                  name="pricePerYear"
                  value={formData.pricePerYear}
                  onChange={handleInputChange}
                  placeholder="499.99"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Trial Days</label>
                <input
                  type="number"
                  name="trialDays"
                  value={formData.trialDays}
                  onChange={handleInputChange}
                  placeholder="14"
                  min="0"
                />
              </div>
            </div>

            <div className="features-section">
              <label>Features</label>
              <div className="features-grid">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="features.amazonIntegration"
                    checked={formData.features.amazonIntegration}
                    onChange={handleInputChange}
                  />
                  Amazon Integration
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="features.walmartIntegration"
                    checked={formData.features.walmartIntegration}
                    onChange={handleInputChange}
                  />
                  Walmart Integration
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="features.shopifyIntegration"
                    checked={formData.features.shopifyIntegration}
                    onChange={handleInputChange}
                  />
                  Shopify Integration
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="features.advancedAnalytics"
                    checked={formData.features.advancedAnalytics}
                    onChange={handleInputChange}
                  />
                  Advanced Analytics
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="features.prioritySupport"
                    checked={formData.features.prioritySupport}
                    onChange={handleInputChange}
                  />
                  Priority Support
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="features.customReports"
                    checked={formData.features.customReports}
                    onChange={handleInputChange}
                  />
                  Custom Reports
                </label>
              </div>
            </div>

            <div className="form-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isPopular"
                  checked={formData.isPopular}
                  onChange={handleInputChange}
                />
                Mark as Popular
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                Active Plan
              </label>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isCreatingPlan || isUpdating}>
                <Save className="w-5 h-5 mr-2" />
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Plans List */}
      <div className="plans-list">
        <h2>Existing Plans</h2>
        <div className="plans-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Monthly Price</th>
                <th>Yearly Price</th>
                <th>Trial Days</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan._id}>
                  <td>
                    <div className="plan-name-cell">
                      {plan.name}
                      {plan.isPopular && <Star className="popular-icon" />}
                    </div>
                  </td>
                  <td>${plan.pricePerMonth}</td>
                  <td>${plan.pricePerYear}</td>
                  <td>{plan.trialDays || 0}</td>
                  <td>
                    <span className={`status ${plan.isActive ? 'active' : 'inactive'}`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button 
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(plan)}
                        title="Edit Plan"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(plan._id)}
                        title="Delete Plan"
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {plans.length === 0 && (
            <div className="no-plans">
              <Shield className="w-12 h-12 mb-3" />
              <p>No subscription plans found</p>
              <p className="text-sm">Create your first plan to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlanManager;