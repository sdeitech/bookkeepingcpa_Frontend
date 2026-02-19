/**
 * Notification Redux Slice
 * Manages notification state in the Redux store
 * Works with RTK Query for API calls
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
  isPanelOpen: false,
  filter: 'all', // all, unread, announcements, tasks, alerts
  soundEnabled: true,
  browserNotificationsEnabled: false,
  isLoading: false,
  error: null,
  lastFetch: null,
  hasMore: true,
  page: 1,
  selectedNotification: null,
  activeCategory: 'all',
  activePriority: 'all',
  hasNewNotifications: false
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Set all notifications (only for initial load - should not be called after real-time updates)
    setNotifications: (state, action) => {
      const apiNotifications = Array.isArray(action.payload) ? action.payload : [];
      
      // Only set notifications if store is empty (initial load)
      // This prevents overwriting real-time notifications
      if (state.notifications.length === 0) {
        console.log('🔄 Initial load: Setting', apiNotifications.length, 'notifications');
        state.notifications = [...apiNotifications];
        
        // Sort by createdAt to maintain order (newest first)
        state.notifications.sort((a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        
        state.lastFetch = Date.now();
      } else {
        console.warn('⚠️ setNotifications called but store already has', state.notifications.length, 'notifications. Ignoring to preserve real-time updates.');
      }
    },
    
    // Add new notification
    addNotification: (state, action) => {
      const notification = action.payload;
      
      // Debug logging
      console.log('🔔 addNotification called with:', {
        id: notification._id || notification.id,
        title: notification.title
      });
      console.log('🔔 Current notifications:', state.notifications.map(n => ({
        id: n._id || n.id,
        title: n.title
      })));
      
      // Get the ID of the new notification
      const newId = notification._id || notification.id;
      
      if (!newId) {
        console.error('🔔 ERROR: Notification has no ID!', notification);
        return;
      }
      
      // Check if this exact notification already exists
      const existingIndex = state.notifications.findIndex(n => {
        const existingId = n._id || n.id;
        return existingId === newId;
      });
      
      if (existingIndex !== -1) {
        console.log('🔔 Notification already exists at index:', existingIndex, 'Updating it.');
        // Update existing notification instead of adding duplicate
        state.notifications[existingIndex] = notification;
      } else {
        // This is a new notification, add it to the beginning
        console.log('🔔 Adding NEW notification to the list');
        state.notifications.unshift(notification);
        console.log('🔔 Notification added! New count:', state.notifications.length);
      }
      
      // DON'T update unread count here - it will be set by updateUnreadCount action
      // This prevents double counting when using combined API response
      
      // Limit stored notifications to prevent memory issues
      if (state.notifications.length > 100) {
        state.notifications = state.notifications.slice(0, 100);
      }
    },
    
    // Add multiple notifications (for pagination)
    appendNotifications: (state, action) => {
      state.notifications.push(...action.payload);
      state.page += 1;
    },
    
    // Update a specific notification
    updateNotification: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.notifications.findIndex(n => n.id === id || n._id === id);
      if (index !== -1) {
        state.notifications[index] = { ...state.notifications[index], ...updates };
        
        // Update unread count if read status changed
        if (updates.isRead !== undefined) {
          if (updates.isRead && !state.notifications[index].isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          } else if (!updates.isRead && state.notifications[index].isRead) {
            state.unreadCount += 1;
          }
        }
      }
    },
    
    // Remove notification
    removeNotification: (state, action) => {
      const id = action.payload;
      const index = state.notifications.findIndex(n => n.id === id || n._id === id);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    
    // Mark notification as read
    markAsRead: (state, action) => {
      const id = action.payload;
      console.log('🔖 markAsRead action called with ID:', id);
      console.log('🔖 Current notifications count:', state.notifications.length);
      console.log('🔖 Current filter:', state.filter);
      
      const notification = state.notifications.find(n => n.id === id || n._id === id);
      if (notification && !notification.isRead) {
        console.log('🔖 Found notification, marking as read:', notification.title);
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        console.log('🔖 New unread count:', state.unreadCount);
      } else if (notification && notification.isRead) {
        console.log('🔖 Notification already marked as read');
      } else {
        console.log('🔖 Notification not found in state!');
      }
    },
    
    // Mark all notifications as read
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        if (!notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
        }
      });
      state.unreadCount = 0;
    },
    
    // Toggle notification panel
    togglePanel: (state) => {
      state.isPanelOpen = !state.isPanelOpen;
    },
    
    // Open notification panel
    openPanel: (state) => {
      state.isPanelOpen = true;
    },
    
    // Close notification panel
    closePanel: (state) => {
      state.isPanelOpen = false;
    },
    
    // Set filter
    setFilter: (state, action) => {
      state.filter = action.payload;
      state.page = 1; // Reset pagination when filter changes
    },
    
    // Set active category filter
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
      state.page = 1;
    },
    
    // Set active priority filter
    setActivePriority: (state, action) => {
      state.activePriority = action.payload;
      state.page = 1;
    },
    
    // Update unread count
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    
    // Increment unread count
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    
    // Decrement unread count
    decrementUnreadCount: (state) => {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    
    // Toggle sound
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    },
    
    // Set sound enabled
    setSoundEnabled: (state, action) => {
      state.soundEnabled = action.payload;
    },
    
    // Toggle browser notifications
    toggleBrowserNotifications: (state) => {
      state.browserNotificationsEnabled = !state.browserNotificationsEnabled;
    },
    
    // Set browser notifications enabled
    setBrowserNotificationsEnabled: (state, action) => {
      state.browserNotificationsEnabled = action.payload;
    },
    
    // Set loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set has more (for pagination)
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
    
    // Reset page
    resetPage: (state) => {
      state.page = 1;
      state.hasMore = true;
    },
    
    // Set selected notification
    setSelectedNotification: (state, action) => {
      state.selectedNotification = action.payload;
    },
    
    // Clear selected notification
    clearSelectedNotification: (state) => {
      state.selectedNotification = null;
    },
    
    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.page = 1;
      state.hasMore = true;
      state.lastFetch = null;
    },
    
    // Set has new notifications flag
    setHasNewNotifications: (state, action) => {
      state.hasNewNotifications = action.payload;
    },
    
    // Reset state
    resetNotificationState: () => initialState
  }
});

// Export actions
export const {
  setNotifications,
  addNotification,
  appendNotifications,
  updateNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
  togglePanel,
  openPanel,
  closePanel,
  setFilter,
  setActiveCategory,
  setActivePriority,
  updateUnreadCount,
  incrementUnreadCount,
  decrementUnreadCount,
  toggleSound,
  setSoundEnabled,
  toggleBrowserNotifications,
  setBrowserNotificationsEnabled,
  setLoading,
  setError,
  clearError,
  setHasMore,
  resetPage,
  setSelectedNotification,
  clearSelectedNotification,
  clearNotifications,
  setHasNewNotifications,
  resetNotificationState
} = notificationSlice.actions;

// Selectors
export const selectNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectIsPanelOpen = (state) => state.notifications.isPanelOpen;
export const selectFilter = (state) => state.notifications.filter;
export const selectSoundEnabled = (state) => state.notifications.soundEnabled;
export const selectBrowserNotificationsEnabled = (state) => state.notifications.browserNotificationsEnabled;
export const selectIsLoading = (state) => state.notifications.isLoading;
export const selectError = (state) => state.notifications.error;
export const selectHasMore = (state) => state.notifications.hasMore;
export const selectPage = (state) => state.notifications.page;
export const selectSelectedNotification = (state) => state.notifications.selectedNotification;
export const selectActiveCategory = (state) => state.notifications.activeCategory;
export const selectActivePriority = (state) => state.notifications.activePriority;
export const selectHasNewNotifications = (state) => state.notifications.hasNewNotifications;

// Filtered notifications selector
export const selectFilteredNotifications = (state) => {
  const notifications = state.notifications.notifications;
  const filter = state.notifications.filter;
  const category = state.notifications.activeCategory;
  const priority = state.notifications.activePriority;
  
  console.log('🔍 Filtering notifications:', {
    totalCount: notifications.length,
    filter,
    category,
    priority,
    firstFew: notifications.slice(0, 3).map(n => ({ id: n._id, type: n.type, title: n.title }))
  });
  
  let filtered = notifications;
  
  // Apply main filter
  if (filter === 'unread') {
    filtered = filtered.filter(n => !n.isRead);
  } else if (filter === 'announcements') {
    // Note: This will only show notifications with type === 'announcement'
    // System notifications won't appear here
    filtered = filtered.filter(n => n.type === 'announcement');
  } else if (filter === 'tasks') {
    filtered = filtered.filter(n => n.type === 'assignment' || n.type === 'task');
  } else if (filter === 'alerts') {
    filtered = filtered.filter(n => n.type === 'alert' || n.priority === 'urgent' || n.priority === 'high');
  }
  // 'all' filter shows everything - no filtering needed
  
  // Apply category filter
  if (category && category !== 'all') {
    filtered = filtered.filter(n => n.category === category);
  }
  
  // Apply priority filter
  if (priority && priority !== 'all') {
    filtered = filtered.filter(n => n.priority === priority);
  }
  
  console.log('🔍 After filtering:', {
    filteredCount: filtered.length,
    filteredIds: filtered.map(n => n._id || n.id)
  });
  
  return filtered;
};

// Export reducer
export default notificationSlice.reducer;
