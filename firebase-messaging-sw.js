importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAvgWPDiTlbcCwqE2Hwh47DHputbSQyCds",
  authDomain: "mn-chat-7a6bd.firebaseapp.com",
  databaseURL: "https://mn-chat-7a6bd-default-rtdb.firebaseio.com",
  projectId: "mn-chat-7a6bd",
  storageBucket: "mn-chat-7a6bd.firebasestorage.app",
  messagingSenderId: "765217629725",
  appId: "1:765217629725:web:85fe5f0d296025a75908f4"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const title = payload.notification?.title || 'Nieuw bericht — MN Chat';
  const body  = payload.notification?.body  || 'Een klant heeft een bericht gestuurd';
  self.registration.showNotification(title, {
    body: body,
    icon: 'https://heartfelt-biscochitos-35decb.netlify.app/icon.png',
    badge: 'https://heartfelt-biscochitos-35decb.netlify.app/icon.png',
    tag: 'mn-chat',
    vibrate: [200, 100, 200],
    data: payload.data || {}
  });
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.includes('heartfelt-biscochitos-35decb.netlify.app') && 'focus' in client) return client.focus();
      }
      return clients.openWindow('https://heartfelt-biscochitos-35decb.netlify.app');
    })
  );
});
