/**
 * NotificationItem Component
 * Individual notification item in the list
 */

import React from 'react';
import { Check, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './NotificationItem.css';

const NotificationItem = ({ notification, onMarkAsRead, onDelete, icon }) => {
  const navigate = useNavigate();
  
  // Format time ago
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return new Date(date).toLocaleDateString();
  };
  
  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#ffc107';
      case 'medium': return '#28a745';
      case 'low': return '#6c757d';
      default: return '#6c757d';
    }
  };
  
  // Handle notification click
  const handleClick = () => {
    // Mark as read if unread
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }
    
    // Navigate if there's an action URL
    if (notification.actionUrl) {
      if (notification.actionType === 'external') {
        window.open(notification.actionUrl, '_blank');
      } else if (notification.actionType === 'modal') {
        // Handle modal action
        // You can dispatch an action to open a modal here
      } else {
        navigate(notification.actionUrl);
      }
    }
  };
  
  return (
    <div
      className={`notification-item ${!notification.isRead ? 'unread' : ''} priority-${notification.priority}`}
      onClick={handleClick}
    >
      {/* Priority Indicator */}
      <div
        className="priority-indicator"
        style={{ backgroundColor: getPriorityColor(notification.priority) }}
      />
      
      {/* Icon */}
      <div className="notification-icon">
        {icon}
      </div>
      
      {/* Content */}
      <div className="notification-content">
        <div className="notification-header">
          <h4 className="notification-title">{notification.title}</h4>
          <span className="notification-time">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>
        
        <p className="notification-message">{notification.message}</p>
        
        {notification.senderName && (
          <div className="notification-meta">
            <span className="sender">From: {notification.senderName}</span>
            {notification.category && (
              <span className="category-tag">{notification.category}</span>
            )}
          </div>
        )}
        
        {notification.actionUrl && (
          <div className="notification-action">
            <span className="action-link">
              {notification.actionLabel || 'View Details'}
              {notification.actionType === 'external' && <ExternalLink size={12} />}
            </span>
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="notification-actions">
        {!notification.isRead && (
          <button
            className="action-btn mark-read"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification._id);
            }}
            title="Mark as read"
          >
            <Check size={14} />
          </button>
        )}
        <button
          className="action-btn delete"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Delete this notification?')) {
              onDelete(notification._id);
            }
          }}
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;