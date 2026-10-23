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
 * Avoids duplicate notification by checking if payload.notification was already handled by browser/SDK.
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);

  // If the message has a notification payload, browser/FCM SDK already displays it automatically.
  // Calling showNotification here causes duplicate (2nd) notification!
  if (payload.notification) {
    console.log('[firebase-messaging-sw.js] Notification payload auto-displayed by system/SDK.');
    return;
  }

  // Fallback for data-only push messages
  const data = payload.data || {};
  const notificationTitle = data.title || 'FindMyPoint';
  const notificationBody = data.body || data.description || '';
  const notificationImage = data.image || data.imageUrl;
  const notificationIcon = data.icon || '/logo.png';
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
