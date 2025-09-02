import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import { useGetUserSubscriptionQuery } from '../features/subscription/subscriptionApi';

const ProtectedRoute = ({ children, requireSubscription = false, requireAdmin = false }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(state => state.auth.user);
  
  // Fetch subscription only if authenticated and subscription is required
  const { 
    data: subscription, 
    isLoading: subscriptionLoading,
    error: subscriptionError 
  } = useGetUserSubscriptionQuery(undefined, {
    skip: !isAuthenticated || !requireSubscription
  });

  // Check if user is not authenticated
  if (!isAuthenticated) {
    // Redirect to login page with return URL
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location.pathname,
          message: 'Please login to access this page'
        }} 
        replace 
      />
    );
  }
  
  // Check if admin access is required
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ 
          message: 'Admin access required'
        }} 
        replace 
      />
    );
  }
  
  // Check if subscription is required
  if (requireSubscription) {
    // Still loading subscription data
    if (subscriptionLoading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Checking subscription status...</p>
        </div>
      );
    }
    
    // No active subscription found
    if (!subscription || subscription.status !== 'active') {
      // Redirect to pricing page to select a plan
      return (
        <Navigate 
          to="/pricing" 
          state={{ 
            from: location.pathname,
            message: 'Please subscribe to a plan to access this feature'
          }} 
          replace 
        />
      );
    }
    
    // Check if subscription is past due or canceled
    if (subscription.status === 'past_due' || subscription.status === 'canceled') {
      return (
        <Navigate 
          to="/dashboard/subscription" 
          state={{ 
            from: location.pathname,
            message: 'Your subscription needs attention. Please update your payment method.'
          }} 
          replace 
        />
      );
    }
  }
  
  // All checks passed, render children
  return children;
};

// HOC for dashboard pages that require active subscription
export const RequireSubscription = ({ children }) => {
  return (
    <ProtectedRoute requireSubscription={true}>
      {children}
    </ProtectedRoute>
  );
};

// HOC for admin pages
export const RequireAdmin = ({ children }) => {
  return (
    <ProtectedRoute requireAdmin={true}>
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedRoute;