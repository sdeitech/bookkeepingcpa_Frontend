/**
 * NotificationPanel Component
 * Displays the dropdown panel with notification list
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  X,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Bell,
  AlertCircle,
  FileText,
  DollarSign,
  Clock,
  Info,
  Settings,
  RefreshCw
} from 'lucide-react';
import {
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation
} from '../../features/notifications/notificationApi';
import {
  selectFilter,
  selectActiveCategory,
  selectActivePriority,
  setFilter,
  setActiveCategory,
  setActivePriority,
  markAsRead,
  removeNotification,
  markAllAsRead,
  selectFilteredNotifications,
  setNotifications,
  updateUnreadCount,
  addNotification,
  resetPage
} from '../../features/notifications/notificationSlice';
import NotificationItem from './NotificationItem';
import './NotificationPanel.css';

const NotificationPanel = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Redux state - Single source of truth for all notifications
  const filter = useSelector(selectFilter);
  const activeCategory = useSelector(selectActiveCategory);
  const activePriority = useSelector(selectActivePriority);
  const filteredNotifications = useSelector(selectFilteredNotifications);
  const unreadCount = useSelector(state => state.notifications.unreadCount);
  const allNotifications = useSelector(state => state.notifications.notifications);
  
  // Mutations
  const [markAsReadMutation] = useMarkAsReadMutation();
  const [markAllAsReadMutation] = useMarkAllAsReadMutation();
  const [deleteNotificationMutation] = useDeleteNotificationMutation();
  
  // Use notifications from Redux store - this is the single source of truth
  const notifications = filteredNotifications;
  
  // Manual refresh function - merges with existing notifications
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications?limit=100', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      const data = await response.json();
      if (data.success && data.data?.notifications) {
        // If store is empty, use setNotifications
        if (allNotifications.length === 0) {
          dispatch(setNotifications(data.data.notifications));
        } else {
          // Otherwise, merge new notifications with existing ones
          const existingIds = new Set(allNotifications.map(n => n._id || n.id));
          const newNotifications = data.data.notifications.filter(n =>
            !existingIds.has(n._id) && !existingIds.has(n.id)
          );
          
          // Add each new notification individually
          newNotifications.forEach(notification => {
            dispatch(addNotification(notification));
          });
        }
        
        if (data.data.unreadCount !== undefined) {
          dispatch(updateUnreadCount(data.data.unreadCount));
        }
      }
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All', icon: Bell },
    { value: 'unread', label: 'Unread', icon: AlertCircle },
    { value: 'announcements', label: 'Announcements', icon: Info },
    { value: 'tasks', label: 'Tasks', icon: FileText },
    { value: 'alerts', label: 'Alerts', icon: AlertCircle }
  ];
  
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'task', label: 'Task' },
    { value: 'alert', label: 'Alert' },
    { value: 'update', label: 'Update' },
    { value: 'warning', label: 'Warning' }
  ];
  
  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent', color: '#dc3545' },
    { value: 'high', label: 'High', color: '#ffc107' },
    { value: 'medium', label: 'Medium', color: '#28a745' },
    { value: 'low', label: 'Low', color: '#6c757d' }
  ];
  
  // Handle mark as read
  const handleMarkAsRead = async (notificationId) => {
    console.log('📖 Marking notification as read:', notificationId);
    console.log('📖 Current filter:', filter);
    
    try {
      // First update Redux state for immediate UI feedback
      dispatch(markAsRead(notificationId));
      console.log('📖 Redux state updated');
      
      // Then call the mutation to persist to backend
      // Don't use unwrap() to avoid throwing on error
      const result = await markAsReadMutation(notificationId);
      
      if (result.error) {
        console.error('❌ Backend error marking as read:', result.error);
        // Revert the optimistic update if backend fails
        // For now, we'll need to refresh to get correct state
        // In future, implement a revert action
        handleRefresh();
      } else {
        console.log('📖 Backend successfully updated');
      }
      
    } catch (error) {
      console.error('❌ Unexpected error marking notification as read:', error);
      // Refresh to ensure state consistency
      handleRefresh();
    }
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      setIsLoading(true);
      await markAllAsReadMutation();
      dispatch(markAllAsRead());
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle delete notification
  const handleDelete = async (notificationId) => {
    try {
      await deleteNotificationMutation(notificationId);
      dispatch(removeNotification(notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (newFilter) => {
    dispatch(setFilter(newFilter));
    // Reset pagination when filter changes - using Redux action
    dispatch(resetPage());
  };
  
  // Handle category change
  const handleCategoryChange = (category) => {
    dispatch(setActiveCategory(category));
    dispatch(resetPage());
  };
  
  // Handle priority change
  const handlePriorityChange = (priority) => {
    dispatch(setActivePriority(priority));
    dispatch(resetPage());
  };
  
  
  // Get icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'announcement':
        return <Info size={16} />;
      case 'assignment':
      case 'task':
        return <FileText size={16} />;
      case 'document':
        return <FileText size={16} />;
      case 'payment':
        return <DollarSign size={16} />;
      case 'reminder':
        return <Clock size={16} />;
      case 'alert':
        return <AlertCircle size={16} />;
      default:
        return <Bell size={16} />;
    }
  };
  
  return (
    <div className="notification-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="header-title">
          <h3>Notifications</h3>
          {unreadCount > 0 && (
            <span className="unread-count">{unreadCount} unread</span>
          )}
        </div>
        <div className="header-actions">
          <button
            className="action-btn"
            onClick={handleRefresh}
            title="Refresh"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
          </button>
          <button
            className="action-btn"
            onClick={() => setShowFilters(!showFilters)}
            title="Filters"
          >
            <Filter size={16} />
          </button>
          {unreadCount > 0 && (
            <button
              className="action-btn"
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
              title="Mark all as read"
            >
              <CheckCheck size={16} />
            </button>
          )}
        </div>
      </div>
      
      {/* Filter Tabs */}
      <div className="filter-tabs">
        {filterOptions.map(option => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              className={`filter-tab ${filter === option.value ? 'active' : ''}`}
              onClick={() => handleFilterChange(option.value)}
            >
              <Icon size={14} />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Advanced Filters */}
      {showFilters && (
        <div className="advanced-filters">
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={activeCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Priority:</label>
            <select
              value={activePriority}
              onChange={(e) => handlePriorityChange(e.target.value)}
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      
      {/* Notification List */}
      <div className="notification-list">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} />
            <h4>No notifications</h4>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <>
            {notifications.map(notification => (
              <NotificationItem
                key={notification._id || notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                icon={getNotificationIcon(notification.type)}
              />
            ))}
          </>
        )}
      </div>
      
      {/* Panel Footer */}
      <div className="panel-footer">
        <a href="/settings/notifications" className="footer-link">
          <Settings size={14} />
          <span>Notification Settings</span>
        </a>
      </div>
    </div>
  );
};

export default NotificationPanel;