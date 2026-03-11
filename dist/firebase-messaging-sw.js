/**
 * Firebase Messaging Service Worker
 * Handles background push notifications
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize Firebase with your project config
firebase.initializeApp({
  apiKey: "AIzaSyBS4-raVIq_tX0rLrIE4P6nn0-3zYhE0FM",
  authDomain: "bookkeeping-cpa.firebaseapp.com",
  projectId: "bookkeeping-cpa",
  storageBucket: "bookkeeping-cpa.firebasestorage.app",
  messagingSenderId: "730366168239",
  appId: "1:730366168239:web:7cb447b2b596448462985a"
});

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  // Extract notification data
  const { title, body, icon, badge, data } = payload.notification || {};
  
  // Customize notification options
  const notificationTitle = title || 'New Notification';
  const notificationOptions = {
    body: body || 'You have a new notification',
    icon: icon || '/logo192.png',
    badge: badge || '/badge-72x72.png',
    tag: data?.notificationId || 'default',
    data: {
      ...data,
      clickAction: data?.actionUrl || '/',
      notificationId: data?.notificationId
    },
    vibrate: [200, 100, 200],
    requireInteraction: data?.priority === 'high' || data?.priority === 'urgent',
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss.png'
      }
    ],
    timestamp: Date.now()
  };

  // Show the notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received:', event);
  
  event.notification.close();
  
  const clickAction = event.notification.data?.clickAction || '/';
  const notificationId = event.notification.data?.notificationId;
  
  // Handle action buttons
  if (event.action === 'dismiss') {
    // Just close the notification
    return;
  }
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          // Send message to the client about the notification click
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            notificationId: notificationId,
            action: event.action || 'open',
            url: clickAction
          });
          return;
        }
      }
      
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(clickAction).then((newClient) => {
          if (newClient) {
            newClient.postMessage({
              type: 'NOTIFICATION_CLICKED',
              notificationId: notificationId,
              action: event.action || 'open',
              url: clickAction
            });
          }
        });
      }
    })
  );
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker activated');
  event.waitUntil(clients.claim());
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker installed');
  self.skipWaiting();
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_FIREBASE_CONFIG') {
    // Update Firebase configuration if needed
    console.log('[firebase-messaging-sw.js] Updating Firebase config');
  }
});