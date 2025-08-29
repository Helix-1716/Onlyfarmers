import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCidzqaIlAVDNH7p2PE5kr1GY9xwDOjH5o",
  authDomain: "onlyfarmers-a1cf9.firebaseapp.com",
  projectId: "onlyfarmers-a1cf9",
  storageBucket: "onlyfarmers-a1cf9.firebasestorage.app",
  messagingSenderId: "831539547968",
  appId: "1:831539547968:web:f92580f03947ec824f34a5",
  measurementId: "G-7LH9VWCWJ5"
};

const app = initializeApp(firebaseConfig);
try { getAnalytics(app); } catch {}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// Persist session across reloads (localStorage)
setPersistence(auth, browserLocalPersistence).catch(() => {});


