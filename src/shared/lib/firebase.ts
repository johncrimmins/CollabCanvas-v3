// Firebase configuration and initialization
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Initialize Firebase (singleton pattern)
// Only initialize on client side to avoid SSR issues
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let rtdb: Database | undefined;

if (typeof window !== 'undefined') {
  // Only initialize on client side
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  auth = getAuth(app);
  db = getFirestore(app);
  rtdb = getDatabase(app);
}

// Export with type guards to ensure safe usage
export { app, auth, db, rtdb };

// Helper functions to safely access Firebase services with error handling
export function getFirebaseAuth(): Auth {
  if (!auth) {
    throw new Error('Firebase Auth not initialized. This should only be called on the client side.');
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    throw new Error('Firestore not initialized. This should only be called on the client side.');
  }
  return db;
}

export function getFirebaseRTDB(): Database {
  if (!rtdb) {
    throw new Error('Firebase RTDB not initialized. This should only be called on the client side.');
  }
  return rtdb;
}

