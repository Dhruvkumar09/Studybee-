import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getDatabase, 
  ref, 
  set, 
  onValue, 
  push, 
  update, 
  remove, 
  onDisconnect 
} from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForLocalDev",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "studylive-app.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://studylive-app-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "studylive-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "studylive-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "100000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:100000000000:web:abcdef123456"
};

// Initialize Firebase safely
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const database = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  ref,
  set,
  onValue,
  push,
  update,
  remove,
  onDisconnect
};
export type { FirebaseUser };
