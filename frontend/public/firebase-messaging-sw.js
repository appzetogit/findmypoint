/* eslint-disable no-undef */
// Firebase Cloud Messaging Service Worker for Background Push Notifications
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Auto-activate new Service Worker immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Initialize Firebase inside the Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyCGFcTjYugCAIu6OJ0eljRCz_hcdy9XJjQ",
  projectId: "findmypoint-66dc1",
  messagingSenderId: "101433815522",
  appId: "1:101433815522:web:4d4a28a4c89e3dadea09bb",
  authDomain: "findmypoint-66dc1.firebaseapp.com",
  storageBucket: "findmypoint-66dc1.firebasestorage.app",
});

const messaging = firebase.messaging();

/**
 * Background message handler
 * Single controller for displaying notifications (prevents duplicate notification bug)
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);

  const data = payload.data || {};
  const notificationTitle = data.title || payload.notification?.title || 'FindMyPoint';
  const notificationBody = data.body || data.description || payload.notification?.body || '';
  const notificationImage = data.image || data.imageUrl || payload.notification?.image || payload.notification?.imageUrl;
  const notificationIcon = data.icon || payload.notification?.icon || '/logo.png';
  const targetUrl = data.url || payload.fcmOptions?.link || '/';
  const tag = data.tag || data.notificationId || 'fmp-push-alert';

  const notificationOptions = {
    body: notificationBody,
    icon: notificationIcon,
    badge: '/logo.png',
    tag: tag, // Collapses any duplicate push with the same tag at OS level
    renotify: true,
    data: {
      url: targetUrl
    }
  };

  if (notificationImage) {
    notificationOptions.image = notificationImage;
  }

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Click notification handler to open URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
