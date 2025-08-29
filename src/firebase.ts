import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration with environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if we have all required Firebase config
const hasValidConfig = firebaseConfig.apiKey &&
                      firebaseConfig.authDomain &&
                      firebaseConfig.projectId;

if (!hasValidConfig) {
  console.error('Firebase configuration is incomplete. Please check your environment variables.');
  console.log('Missing environment variables:');
  if (!firebaseConfig.apiKey) console.log('- VITE_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain) console.log('- VITE_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId) console.log('- VITE_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.storageBucket) console.log('- VITE_FIREBASE_STORAGE_BUCKET');
  if (!firebaseConfig.messagingSenderId) console.log('- VITE_FIREBASE_MESSAGING_SENDER_ID');
  if (!firebaseConfig.appId) console.log('- VITE_FIREBASE_APP_ID');
  if (!firebaseConfig.measurementId) console.log('- VITE_FIREBASE_MEASUREMENT_ID');
}

// Initialize Firebase (will throw if config is invalid)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Try to initialize analytics (optional)
try {
  getAnalytics(app);
} catch (analyticsError) {
  console.warn('Analytics initialization failed:', analyticsError);
}

// Set persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn('Auth persistence setup failed:', error);
});

export { auth, db, storage, googleProvider };


