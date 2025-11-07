/**
 * NotificationBell Component
 * Displays a bell icon with unread notification count badge
 * Uses Firebase Realtime for instant notification updates
 */

import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell } from 'lucide-react';
import {
  useGetUnreadCountQuery
} from '../../features/notifications/notificationApi';
import {
  togglePanel,
  updateUnreadCount,
  selectUnreadCount,
  selectIsPanelOpen,
  selectSoundEnabled,
  selectBrowserNotificationsEnabled
} from '../../features/notifications/notificationSlice';
import NotificationPanel from './NotificationPanel';
import { useRealtimeNotifications } from '../../hooks/useRealtimeNotifications';
import './NotificationBell.css';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const [showAnimation, setShowAnimation] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const audioRef = useRef(null);
  
  // Redux state
  const unreadCount = useSelector(selectUnreadCount);
  const isPanelOpen = useSelector(selectIsPanelOpen);
  const soundEnabled = useSelector(selectSoundEnabled);
  const browserNotificationsEnabled = useSelector(selectBrowserNotificationsEnabled);
  
  // Enable Firebase real-time notifications
  useRealtimeNotifications();
  
  // Initial unread count
  const { data: initialUnreadCount } = useGetUnreadCountQuery();
  
  // Monitor Firebase connection status
  useEffect(() => {
    const checkConnectionStatus = () => {
      const isConnected = window.__firebaseRealtimeConnected;
      const isActive = window.__firebaseRealtimeActive;
      
      if (isConnected && isActive) {
        setConnectionStatus('connected');
      } else if (isConnected && !isActive) {
        setConnectionStatus('initializing');
      } else {
        setConnectionStatus('disconnected');
      }
    };
    
    // Initial check
    checkConnectionStatus();
    
    // Check periodically
    const interval = setInterval(checkConnectionStatus, 2000);
    return () => clearInterval(interval);
  }, []);
  
  // Update unread count on initial load
  useEffect(() => {
    if (initialUnreadCount !== undefined) {
      dispatch(updateUnreadCount(initialUnreadCount));
    }
  }, [initialUnreadCount, dispatch]);
  
  // Listen for new notifications via Redux (triggered by Firebase)
  useEffect(() => {
    // This effect can be used to handle animations when notifications arrive
    // The actual notification data comes through Firebase listeners in useRealtimeNotifications
    const handleNewNotification = () => {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 1000);
      
      // Play sound if enabled
      if (soundEnabled && audioRef.current) {
        audioRef.current.play().catch(e => console.log('Sound play failed:', e));
      }
    };
    
    // Listen for custom event that can be dispatched when new notification arrives
    window.addEventListener('new-notification', handleNewNotification);
    
    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
    };
  }, [soundEnabled]);
  
  // Request browser notification permission
  useEffect(() => {
    if (browserNotificationsEnabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [browserNotificationsEnabled]);
  
  // Show browser notification
  const showBrowserNotification = (notification) => {
    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/logo192.png',
        badge: '/badge-72x72.png',
        tag: notification._id,
        requireInteraction: notification.priority === 'urgent' || notification.priority === 'high',
        silent: !soundEnabled
      });
      
      browserNotification.onclick = () => {
        window.focus();
        dispatch(togglePanel());
        browserNotification.close();
      };
      
      // Auto close after 5 seconds for non-urgent notifications
      if (notification.priority !== 'urgent' && notification.priority !== 'high') {
        setTimeout(() => browserNotification.close(), 5000);
      }
    }
  };
  
  const handleBellClick = () => {
    dispatch(togglePanel());
  };
  
  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isPanelOpen && !event.target.closest('.notification-container')) {
        dispatch(togglePanel());
      }
    };
    
    if (isPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPanelOpen, dispatch]);
  
  return (
    <div className="notification-container">
      <button
        className={`notification-bell ${showAnimation ? 'animate' : ''}`}
        onClick={handleBellClick}
        aria-label="Notifications"
        aria-expanded={isPanelOpen}
        title={`Notifications (Real-time: ${connectionStatus})`}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {/* Connection status indicator */}
        {connectionStatus !== 'connected' && (
          <span
            className={`connection-indicator ${connectionStatus}`}
            title={connectionStatus === 'initializing' ? 'Connecting...' : 'Disconnected'}
          />
        )}
      </button>
      
      {isPanelOpen && <NotificationPanel />}
      
      {/* Hidden audio element for notification sound */}
      <audio
        ref={audioRef}
        src="/notification-sound.mp3"
        preload="auto"
        style={{ display: 'none' }}
      />
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          padding: '5px 10px',
          background: connectionStatus === 'connected' ? '#4caf50' :
                     connectionStatus === 'initializing' ? '#ff9800' : '#f44336',
          color: 'white',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          Firebase: {connectionStatus}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;