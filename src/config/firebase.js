import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAuth } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase app
let app;
let db; // Firestore
let database; // Realtime Database
let messaging;
let auth;

export const initializeFirebase = () => {
  try {
    // Check if Firebase has already been initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      app = existingApps[0];
      console.log('✅ Firebase already initialized, reusing existing app');
    } else {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized successfully');
      console.log('📊 Firebase config:', {
        projectId: firebaseConfig.projectId,
        databaseURL: firebaseConfig.databaseURL,
        authDomain: firebaseConfig.authDomain
      });
    }
    
    // Initialize services if not already initialized
    if (!db) {
      db = getFirestore(app);
    }
    
    if (!database) {
      // Initialize Realtime Database with proper URL
      database = getDatabase(app, firebaseConfig.databaseURL);
      console.log('✅ Firebase Realtime Database initialized with URL:', firebaseConfig.databaseURL);
      
      // Monitor connection status
      const connectedRef = ref(database, '.info/connected');
      onValue(connectedRef, (snapshot) => {
        const connected = snapshot.val();
        window.__firebaseRealtimeConnected = connected === true;
        console.log('🔥 Firebase Realtime Database connection:', connected ? '✅ Connected' : '❌ Disconnected');
      });
    }
    
    if (!auth) {
      auth = getAuth(app);
    }
    
    // Initialize Messaging only if supported
    if (!messaging && typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      messaging = getMessaging(app);
      
      // Register service worker for push notifications
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }
    
    return { app, db, database, messaging, auth };
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.error('Error details:', error.message);
    // Set connection status to false on error
    window.__firebaseRealtimeConnected = false;
    throw error;
  }
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    if (!messaging) {
      console.warn('Messaging is not initialized');
      return null;
    }
    
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      
      if (token) {
        console.log('✅ FCM Token:', token);
        // Save token to backend for sending push notifications
        return token;
      } else {
        console.log('❌ No FCM token available');
      }
    } else {
      console.log('❌ Notification permission denied');
    }
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
  }
  
  return null;
};

// Listen for foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    if (!messaging) {
      console.warn('Messaging is not initialized');
      resolve(null);
      return;
    }
    
    onMessage(messaging, (payload) => {
      console.log('📨 Message received:', payload);
      resolve(payload);
    });
  });
};

// Play notification sound
export const playNotificationSound = () => {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Could not play notification sound:', e));
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

// Export initialized instances
export const getFirebaseApp = () => app;
export const getFirebaseDb = () => db; // Firestore
export const getFirebaseDatabase = () => database; // Realtime Database
export const getFirebaseMessaging = () => messaging;
export const getFirebaseAuth = () => auth;

// Utility function to check if Firebase is initialized
export const isFirebaseInitialized = () => !!app;

// Export database for direct import
export { database };

// Listen for real-time notification updates from Firestore
export const subscribeToNotifications = (userId, callback) => {
  if (!db) {
    console.error('Firestore is not initialized');
    return () => {};
  }
  
  try {
    const { collection, query, where, orderBy, onSnapshot } = require('firebase/firestore');
    
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = [];
      snapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      callback(notifications);
    }, (error) => {
      console.error('Error listening to notifications:', error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up notification subscription:', error);
    return () => {};
  }
};

export default {
  initializeFirebase,
  requestNotificationPermission,
  onMessageListener,
  playNotificationSound,
  getFirebaseApp,
  getFirebaseDb,
  getFirebaseDatabase,
  getFirebaseMessaging,
  getFirebaseAuth,
  isFirebaseInitialized,
  subscribeToNotifications
};