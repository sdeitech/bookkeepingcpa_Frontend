/**
 * Test Firebase Realtime Database Connection
 * Run this in browser console to verify Firebase is working
 */

import { getDatabase, ref, push, set, onValue, onChildAdded } from 'firebase/database';

export const testFirebaseConnection = async () => {
  console.log('🔍 Testing Firebase Realtime Database Connection...\n');
  
  try {
    // 1. Check if Firebase is initialized
    const database = getDatabase();
    console.log('✅ Step 1: Firebase database instance obtained');
    
    // 2. Check connection status
    const connectedRef = ref(database, '.info/connected');
    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        console.log('✅ Step 2: Connected to Firebase Realtime Database');
      } else {
        console.log('❌ Step 2: NOT connected to Firebase Realtime Database');
      }
    });
    
    // 3. Get user ID
    const userInfo = localStorage.getItem('userInfo');
    const userId = userInfo ? JSON.parse(userInfo).id || JSON.parse(userInfo)._id : 'test-user';
    console.log(`✅ Step 3: Using user ID: ${userId}`);
    
    // 4. Try to write test data
    const testRef = ref(database, `test/${userId}/connection-test`);
    const testData = {
      timestamp: Date.now(),
      message: 'Testing Firebase connection',
      browser: navigator.userAgent
    };
    
    await set(testRef, testData);
    console.log('✅ Step 4: Successfully wrote test data to Firebase');
    console.log('   Data written:', testData);
    
    // 5. Set up listener for notifications path
    const notificationsRef = ref(database, `notifications/${userId}`);
    let listenerWorking = false;
    
    const unsubscribe = onChildAdded(notificationsRef, (snapshot) => {
      listenerWorking = true;
      console.log('🔥 FIREBASE LISTENER TRIGGERED!');
      console.log('   Notification signal received:', snapshot.val());
    });
    
    console.log('✅ Step 5: Listener set up for notifications path');
    
    // 6. Test by pushing a test notification signal
    setTimeout(async () => {
      const testNotificationRef = push(notificationsRef);
      await set(testNotificationRef, {
        id: 'test-notification-' + Date.now(),
        timestamp: Date.now(),
        action: 'new',
        test: true
      });
      console.log('📤 Step 6: Test notification signal sent to Firebase');
    }, 1000);
    
    // 7. Check results after 3 seconds
    setTimeout(() => {
      if (listenerWorking) {
        console.log('\n✅✅✅ FIREBASE IS WORKING! ✅✅✅');
        console.log('Real-time listeners are active and receiving signals.');
      } else {
        console.log('\n⚠️⚠️⚠️ FIREBASE LISTENERS NOT TRIGGERED ⚠️⚠️⚠️');
        console.log('Possible issues:');
        console.log('1. Firebase credentials not configured');
        console.log('2. Firebase Realtime Database not enabled');
        console.log('3. Security rules blocking access');
        console.log('4. Network/firewall issues');
      }
      
      // Cleanup
      unsubscribe();
    }, 3000);
    
    return true;
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    console.log('\nError details:');
    console.log('- Message:', error.message);
    console.log('- Code:', error.code);
    console.log('\nThis likely means Firebase is not properly configured.');
    return false;
  }
};

// Export for console access
window.testFirebaseConnection = testFirebaseConnection;

console.log('Firebase test ready! Run: testFirebaseConnection()');