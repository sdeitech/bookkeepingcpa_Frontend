/**
 * Debug Firebase Real-time Connection
 * Run this in browser console to diagnose connection issues
 */

import { getDatabase, ref, onValue, set, push } from 'firebase/database';
import { initializeFirebase, getFirebaseDatabase } from '../config/firebase';

export const debugFirebaseConnection = async () => {
  console.group('🔍 Firebase Real-time Debug');
  
  try {
    // Step 1: Initialize Firebase
    console.log('1️⃣ Initializing Firebase...');
    initializeFirebase();
    
    // Step 2: Get database instance
    const database = getFirebaseDatabase();
    if (!database) {
      console.error('❌ Failed to get database instance');
      console.groupEnd();
      return;
    }
    console.log('✅ Database instance obtained');
    
    // Step 3: Check connection status
    console.log('2️⃣ Checking connection status...');
    const connectedRef = ref(database, '.info/connected');
    
    await new Promise((resolve) => {
      onValue(connectedRef, (snapshot) => {
        const connected = snapshot.val();
        console.log('Connection status:', connected ? '✅ Connected' : '❌ Disconnected');
        if (connected) {
          resolve();
        } else {
          console.error('Firebase is not connected. Check:');
          console.log('- Database URL in .env');
          console.log('- Firebase project settings');
          console.log('- Network connection');
        }
      });
    });
    
    // Step 4: Get current user ID
    console.log('3️⃣ Getting user ID...');
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      console.error('❌ No user info in localStorage');
      console.groupEnd();
      return;
    }
    
    const user = JSON.parse(userInfo);
    const userId = user.id || user._id || user.userId;
    console.log('User ID:', userId);
    
    // Step 5: Test writing to Firebase
    console.log('4️⃣ Testing write to Firebase...');
    const testRef = ref(database, `test/${userId}/debug`);
    await set(testRef, {
      message: 'Debug test',
      timestamp: Date.now()
    });
    console.log('✅ Write successful');
    
    // Step 6: Test listening to notifications path
    console.log('5️⃣ Setting up listener on notifications path...');
    const notificationsRef = ref(database, `notifications/${userId}`);
    
    onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      console.log('📡 Notifications data:', data);
      if (data) {
        console.log('Found notifications:', Object.keys(data).length);
      } else {
        console.log('No notifications found for this user');
      }
    });
    
    // Step 7: Test creating a notification signal
    console.log('6️⃣ Creating test notification signal...');
    const testNotificationRef = push(ref(database, `notifications/${userId}`));
    await set(testNotificationRef, {
      id: 'test-' + Date.now(),
      action: 'new',
      timestamp: Date.now()
    });
    console.log('✅ Test signal created. Check if listener triggered above.');
    
    // Step 8: Check Firebase config
    console.log('7️⃣ Firebase Configuration:');
    console.log('Database URL:', import.meta.env.VITE_FIREBASE_DATABASE_URL);
    console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
    console.log('API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing');
    
    // Step 9: Check window flags
    console.log('8️⃣ Window flags:');
    console.log('__firebaseRealtimeConnected:', window.__firebaseRealtimeConnected);
    console.log('__firebaseRealtimeActive:', window.__firebaseRealtimeActive);
    
    console.log('\n✨ Debug complete. Check the logs above for issues.');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    console.error('Details:', error.message);
  }
  
  console.groupEnd();
};

// Auto-run when imported in development
if (process.env.NODE_ENV === 'development') {
  window.debugFirebase = debugFirebaseConnection;
  console.log('🔧 Firebase debug tool loaded. Run: debugFirebase()');
}

export default debugFirebaseConnection;