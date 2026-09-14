import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, indexedDBLocalPersistence, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

export function getFirebaseApp(): FirebaseApp {
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
    void auth.setPersistence(indexedDBLocalPersistence);
  }
  return auth;
}

export function getDb(): Firestore {
  if (!db) db = getFirestore(getFirebaseApp());
  return db;
}

export function getStorageInstance(): FirebaseStorage {
  if (!storage) storage = getStorage(getFirebaseApp());
  return storage;
}
