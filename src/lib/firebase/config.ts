import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAhNw4ItEmcUWnvd5U9neCPCzmP86qxZpI",
    authDomain: "studio-6734762811-c1c00.firebaseapp.com",
    projectId: "studio-6734762811-c1c00",
    storageBucket: "studio-6734762811-c1c00.firebasestorage.app",
    messagingSenderId: "267087308367",
    appId: "1:267087308367:web:8cd696bb71e45595292c3a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Messaging might not be supported in all browsers
export let messaging: ReturnType<typeof getMessaging> | null = null;
try {
    messaging = getMessaging(app);
} catch (error) {
    console.warn('Firebase Messaging is not supported in this browser.', error);
}
