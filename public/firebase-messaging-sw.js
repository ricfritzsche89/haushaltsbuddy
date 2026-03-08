// Scripts for Firebase Cloud Messaging in the background
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// REPLACE THESE WITH REAL FIREBASE CONFIG VALUES LATER
const firebaseConfig = {
    apiKey: "AIzaSyAhNw4ItEmcUWnvd5U9neCPCzmP86qxZpI",
    authDomain: "studio-6734762811-c1c00.firebaseapp.com",
    projectId: "studio-6734762811-c1c00",
    storageBucket: "studio-6734762811-c1c00.firebasestorage.app",
    messagingSenderId: "267087308367",
    appId: "1:267087308367:web:8cd696bb71e45595292c3a"
};

// Initialize the Firebase app in the service worker
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
