/**
 * Custom Hook: useRealtimeNotifications
 * Replaces polling with Firebase Realtime Database listeners
 * 
 * Architecture:
 * 1. Listen to Firebase for notification signals
 * 2. Fetch full notification data from MongoDB API
 * 3. Update Redux store with new notifications
 */

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ref, onChildAdded, onChildChanged, onChildRemoved, onValue, off } from 'firebase/database';
import { getFirebaseDatabase, initializeFirebase } from '../config/firebase';
import firebaseAuthService from '../services/firebaseAuth.service';
import {
  addNotification,
  updateNotification,
  removeNotification,
  setHasNewNotifications,
  updateUnreadCount,
  setNotifications
} from '../features/notifications/notificationSlice';
import { notificationApi } from '../features/notifications/notificationApi';

/**
 * Hook to enable real-time notification updates
 * @returns {void}
 */
export const useRealtimeNotifications = () => {
  const dispatch = useDispatch();
  
  // Safely access user state with proper fallbacks
  const userId = useSelector(state => {
    // Try different possible user state structures
    if (state.user?.currentUser?.id) return state.user.currentUser.id;
    if (state.user?.currentUser?._id) return state.user.currentUser._id;
    if (state.auth?.user?.id) return state.auth.user.id;
    if (state.auth?.user?._id) return state.auth.user._id;
    if (state.auth?.userId) return state.auth.userId;
    
    // Try to get from localStorage as last resort
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        return parsed.id || parsed._id || parsed.userId;
      }
    } catch (e) {
      console.debug('Could not parse user info from localStorage');
    }
    
    return null;
  });
  
  const isAuthenticated = useSelector(state => {
    // Check different possible auth state structures
    if (state.user?.isAuthenticated !== undefined) return state.user.isAuthenticated;
    if (state.auth?.isAuthenticated !== undefined) return state.auth.isAuthenticated;
    if (state.auth?.token) return true;
    if (state.user?.currentUser) return true;
    return false;
  });
  
  const listenersRef = useRef(null);
  const processedSignals = useRef(new Set());

  // Initialize Redux store with notifications from API - only once per app lifecycle
  useEffect(() => {
    // Check if store already has notifications (initialized elsewhere)
    const state = dispatch((dispatch, getState) => getState());
    const hasNotifications = state.notifications?.notifications?.length > 0;
    
    if (isAuthenticated && userId && !hasNotifications) {
      console.log('📚 Store is empty, fetching initial notifications...');
      // Fetch initial notifications to populate Redux store
      fetch('/api/notifications?limit=100', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success && data.data?.notifications) {
          console.log('📚 Initializing Redux store with', data.data.notifications.length, 'notifications');
          dispatch(setNotifications(data.data.notifications));
          if (data.data.unreadCount !== undefined) {
            dispatch(updateUnreadCount(data.data.unreadCount));
          }
        }
      })
      .catch(error => {
        console.error('Failed to fetch initial notifications:', error);
      });
    } else if (hasNotifications) {
      console.log('📚 Store already has', state.notifications.notifications.length, 'notifications, skipping init');
    }
  }, [isAuthenticated, userId, dispatch]);

  useEffect(() => {
    // Only setup listeners if user is authenticated
    if (!isAuthenticated || !userId) {
      console.log('User not authenticated, skipping real-time listeners');
      return;
    }

    console.log('Setting up Firebase real-time listeners for user:', userId);
    
    // Ensure Firebase is initialized first
    const setupListeners = async () => {
      try {
        // Initialize Firebase if needed
        initializeFirebase();
        
        // Authenticate with Firebase using custom token
        console.log('🔐 Authenticating with Firebase...');
        try {
          await firebaseAuthService.authenticateWithBackend();
          console.log('✅ Firebase authentication successful');
        } catch (authError) {
          console.error('❌ Firebase authentication failed:', authError);
          console.log('⚠️ Falling back to polling mode');
          window.__firebaseRealtimeActive = false;
          return;
        }
        
        // Get database instance
        const database = getFirebaseDatabase();
        
        if (!database) {
          console.error('Failed to get Firebase Realtime Database instance');
          return;
        }
        
        // First check if Firebase is connected
        const connectedRef = ref(database, '.info/connected');
        const connectionUnsubscribe = onValue(connectedRef, (snapshot) => {
          const connected = snapshot.val();
          console.log('Firebase connection status:', connected ? '✅ Connected' : '❌ Disconnected');
          if (!connected) {
            console.warn('Firebase Realtime Database is not connected yet, waiting...');
          }
        });
        
        const userNotificationsRef = ref(database, `notifications/${userId}`);
        
        // Store reference and unsubscribe functions for cleanup
        const unsubscribeFunctions = [];
        listenersRef.current = userNotificationsRef;
        
        // First, fetch any existing unread notifications when setting up
        const fetchInitialNotifications = async () => {
          try {
            const response = await fetch('/api/notifications?unreadOnly=true', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
              }
            });
            if (response.ok) {
              const data = await response.json();
              console.log('Fetched initial notifications:', data);
            }
          } catch (error) {
            console.debug('Could not fetch initial notifications:', error);
          }
        };
        
        fetchInitialNotifications();

        // Listen for new notifications
        console.log('Setting up onChildAdded listener...');
        
        // Use onChildAdded with startAfter to only get NEW notifications
        // This prevents processing old Firebase signals that are still in the database
        const now = Date.now();
        const unsubscribeAdded = onChildAdded(userNotificationsRef, (snapshot) => {
          const signal = snapshot.val();
          console.log('🔥🔥🔥 FIREBASE onChildAdded TRIGGERED!', signal);
          
          if (!signal) return;
          
          // Ignore signals older than 5 minutes (stale signals from previous sessions)
          const signalAge = Date.now() - signal.timestamp;
          if (signalAge > 5 * 60 * 1000) {
            console.log(`⏭️ Ignoring old signal (${Math.round(signalAge / 1000)}s old):`, signal.id);
            return;
          }
          
          const signalKey = `${signal.id}-${signal.timestamp}`;
          
          // Prevent duplicate processing
          if (processedSignals.current.has(signalKey)) {
            return;
          }
          processedSignals.current.add(signalKey);
          
          if (signal.action === 'new') {
            console.log('🔥 REAL-TIME: New notification received via Firebase:', signal.id);
            
            // Fetch full notification from MongoDB using RTK Query (now includes unread count)
            dispatch(
              notificationApi.endpoints.getNotificationById.initiate(signal.id)
            ).unwrap().then((data) => {
              console.log('📥 Notification API response:', data);
              
              if (data && data.data) {
                const { notification, unreadCount } = data.data;
                
                console.log('📥 Extracted notification:', notification);
                console.log('📥 Extracted unreadCount:', unreadCount);
                
                if (notification) {
                  // Add notification to Redux store
                  console.log('📥 Dispatching addNotification with:', notification);
                  dispatch(addNotification(notification));
                  
                  // Update unread count from server (ensures accuracy)
                  if (unreadCount !== null && unreadCount !== undefined) {
                    console.log('📥 Dispatching updateUnreadCount with:', unreadCount);
                    dispatch(updateUnreadCount(unreadCount));
                  }
                  
                  // Set flag for new notifications
                  dispatch(setHasNewNotifications(true));
                  
                  // Play notification sound if enabled
                  playNotificationSound();
                  
                  // Dispatch custom event for UI updates
                  window.dispatchEvent(new CustomEvent('new-notification', {
                    detail: {
                      notification,
                      unreadCount
                    }
                  }));
                  
                  console.log('📥 All dispatches completed');
                } else {
                  console.error('📥 No notification in response data');
                }
              } else {
                console.error('📥 No data returned from API');
              }
            }).catch(error => {
              // Handle 404 errors gracefully - these are stale Firebase signals
              if (error.status === 404) {
                console.warn(`⚠️ Stale Firebase signal detected for notification ${signal.id} - notification no longer exists in database`);
                // Optionally: Clean up the stale signal from Firebase
                // This is not critical as signals auto-expire after 24 hours
              } else {
                console.error('Failed to fetch notification details:', error);
                console.error('Notification ID that failed:', signal.id);
                console.error('Error details:', {
                  status: error.status,
                  message: error.data?.message,
                  fullError: error
                });
              }
            });
          }
        }, (error) => {
          console.error('Firebase onChildAdded error:', error);
        });
        unsubscribeFunctions.push(unsubscribeAdded);

        // Listen for notification updates (e.g., marked as read)
        console.log('Setting up onChildChanged listener...');
        const unsubscribeChanged = onChildChanged(userNotificationsRef, (snapshot) => {
          const signal = snapshot.val();
          console.log('🔥 FIREBASE onChildChanged TRIGGERED!', signal);
          
          if (signal && (signal.action === 'read' || signal.action === 'update')) {
            // Fetch updated notification from MongoDB using RTK Query
            dispatch(
              notificationApi.endpoints.getNotificationById.initiate(signal.id)
            ).unwrap().then((data) => {
              if (data && data.data && data.data.notification) {
                // Update notification in Redux store
                dispatch(updateNotification({
                  id: data.data.notification._id,
                  updates: data.data.notification
                }));
              }
            }).catch(error => {
              console.error('Failed to fetch updated notification:', error);
            });
          }
        }, (error) => {
          console.error('Firebase onChildChanged error:', error);
        });
        unsubscribeFunctions.push(unsubscribeChanged);

        // Listen for notification deletions
        console.log('Setting up onChildRemoved listener...');
        const unsubscribeRemoved = onChildRemoved(userNotificationsRef, (snapshot) => {
          const signal = snapshot.val();
          console.log('🔥 FIREBASE onChildRemoved TRIGGERED!', signal);
          dispatch(removeNotification(signal.id));
        }, (error) => {
          console.error('Firebase onChildRemoved error:', error);
        });
        unsubscribeFunctions.push(unsubscribeRemoved);

        console.log('✅ All Firebase real-time listeners are now active');
        console.log('Listening on path:', `notifications/${userId}`);
        
        // Store unsubscribe functions for cleanup (including connection listener)
        unsubscribeFunctions.push(connectionUnsubscribe);
        listenersRef.current = unsubscribeFunctions;
        
        // Set global flag for UI
        window.__firebaseRealtimeActive = true;
      } catch (error) {
        console.error('❌ Error setting up real-time notifications:', error);
        console.error('Error details:', error.message, error.code);
        window.__firebaseRealtimeActive = false;
      }
    };
    
    // Setup listeners
    setupListeners();

    // Cleanup function
    return () => {
      console.log('Cleaning up Firebase listeners');
      
      // Properly unsubscribe from all listeners
      if (Array.isArray(listenersRef.current)) {
        listenersRef.current.forEach(unsubscribe => {
          if (typeof unsubscribe === 'function') {
            unsubscribe();
          }
        });
      } else if (listenersRef.current) {
        off(listenersRef.current);
      }
      
      processedSignals.current.clear();
      window.__firebaseRealtimeActive = false;
    };
  }, [userId, isAuthenticated, dispatch]);

  return null; // Hook doesn't return anything
};

/**
 * Play notification sound
 */
const playNotificationSound = () => {
  try {
    // Check if user has enabled notification sounds
    const soundEnabled = localStorage.getItem('notificationSound') !== 'false';
    
    if (soundEnabled && typeof Audio !== 'undefined') {
      // Use a simple beep sound or custom notification sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi6Gy/DaiToGGGS47OmuVRUIPlyx6OWkUBUMP1+y6OmqWBUGOlyx6OOiURUMPlux5+OmUxQGO12w6OatVxUGO12w6OmpUxUGPV+x5+OlUBUKQmG05+OlVBUGPV2w6OetVxUGP12w6OGlUxQIQmG05+OlVRUIRWO35+agVRUIQmG05+OlVRUGPVyx6OatVxUGO12w6OatVxUGO12w6OmpVRUGPV+x5+OlUxUGPV+x5+OlUxUGO12w6OatVxUGO12w6OatVxUGO12w6OWnUxUGPV+x5+OlUxUGO12w6OOlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPVyx5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGO12w6OOlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxU=');
      audio.volume = 0.3;
      audio.play().catch(e => {
        // Ignore audio play errors (e.g., browser restrictions)
        console.debug('Could not play notification sound:', e);
      });
    }
  } catch (error) {
    console.debug('Error playing notification sound:', error);
  }
};

// Optional: Export utility to manually trigger sound for testing
export const testNotificationSound = playNotificationSound;