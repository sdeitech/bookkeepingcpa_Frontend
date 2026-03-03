/**
 * Custom Hook: useRealtimeMessages
 * Listens for real-time message updates via Firebase for a specific task
 * 
 * Architecture:
 * 1. Listen to Firebase for message signals on a task
 * 2. Trigger refetch of messages when new message arrives
 * 3. Falls back to polling if Firebase unavailable
 */

import { useEffect, useRef } from 'react';
import { ref, onChildAdded, off } from 'firebase/database';
import { getFirebaseDatabase, initializeFirebase } from '../config/firebase';
import firebaseAuthService from '../services/firebaseAuth.service';

/**
 * Hook to enable real-time message updates for a task
 * @param {string} taskId - The task ID to listen for messages
 * @param {function} refetchMessages - Function to refetch messages from API
 * @returns {void}
 */
export const useRealtimeMessages = (taskId, refetchMessages) => {
  const listenerRef = useRef(null);
  const processedSignals = useRef(new Set());

  useEffect(() => {
    // Only setup listener if taskId is provided
    if (!taskId || !refetchMessages) {
      return;
    }

    console.log('Setting up Firebase real-time message listener for task:', taskId);
    
    const setupListener = async () => {
      try {
        // Initialize Firebase if needed
        initializeFirebase();
        
        // Authenticate with Firebase (reuse existing auth if already signed in)
        if (!firebaseAuthService.isSignedIn()) {
          console.log('🔐 Authenticating with Firebase for messages...');
          try {
            await firebaseAuthService.authenticateWithBackend();
            console.log('✅ Firebase authentication successful for messages');
          } catch (authError) {
            console.error('❌ Firebase authentication failed for messages:', authError);
            console.log('⚠️ Falling back to polling mode for messages');
            return;
          }
        }
        
        // Get database instance
        const database = getFirebaseDatabase();
        
        if (!database) {
          console.error('Failed to get Firebase Realtime Database instance');
          return;
        }
        
        // Listen to messages for this specific task
        const taskMessagesRef = ref(database, `messages/${taskId}`);
        listenerRef.current = taskMessagesRef;
        
        // Listen for new messages
        const unsubscribe = onChildAdded(taskMessagesRef, (snapshot) => {
          const signal = snapshot.val();
          console.log('🔥💬 FIREBASE MESSAGE SIGNAL RECEIVED!', signal);
          
          if (!signal) return;
          
          const signalKey = `${signal.id}-${signal.timestamp}`;
          
          // Prevent duplicate processing
          if (processedSignals.current.has(signalKey)) {
            return;
          }
          processedSignals.current.add(signalKey);
          
          if (signal.action === 'new_message') {
            console.log('💬 Real-time: New message received, refetching messages...');
            
            // Refetch messages from API
            refetchMessages();
            
            // Play notification sound (optional)
            playMessageSound();
          }
        }, (error) => {
          console.error('Firebase message listener error:', error);
        });
        
        console.log('✅ Firebase message listener active for task:', taskId);
        
        // Store unsubscribe function
        listenerRef.current = unsubscribe;
        
      } catch (error) {
        console.error('❌ Error setting up real-time messages:', error);
      }
    };
    
    setupListener();

    // Cleanup function
    return () => {
      console.log('Cleaning up Firebase message listener for task:', taskId);
      
      if (typeof listenerRef.current === 'function') {
        listenerRef.current();
      } else if (listenerRef.current) {
        off(listenerRef.current);
      }
      
      processedSignals.current.clear();
    };
  }, [taskId, refetchMessages]);

  return null;
};

/**
 * Play message sound
 */
const playMessageSound = () => {
  try {
    // Check if user has enabled message sounds
    const soundEnabled = localStorage.getItem('messageSound') !== 'false';
    
    if (soundEnabled && typeof Audio !== 'undefined') {
      // Use a simple beep sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi6Gy/DaiToGGGS47OmuVRUIPlyx6OWkUBUMP1+y6OmqWBUGOlyx6OOiURUMPlux5+OmUxQGO12w6OatVxUGO12w6OmpUxUGPV+x5+OlUBUKQmG05+OlVBUGPV2w6OetVxUGP12w6OGlUxQIQmG05+OlVRUIRWO35+agVRUIQmG05+OlVRUGPVyx6OatVxUGO12w6OatVxUGO12w6OmpVRUGPV+x5+OlUxUGPV+x5+OlUxUGO12w6OatVxUGO12w6OatVxUGO12w6OWnUxUGPV+x5+OlUxUGO12w6OOlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPVyx5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGO12w6OOlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxUGPV+x5+OlUxU=');
      audio.volume = 0.2;
      audio.play().catch(e => {
        // Ignore audio play errors
        console.debug('Could not play message sound:', e);
      });
    }
  } catch (error) {
    console.debug('Error playing message sound:', error);
  }
};

// Export utility to manually trigger sound for testing
export const testMessageSound = playMessageSound;
