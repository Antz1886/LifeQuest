
"use client";

import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Loader2 } from "lucide-react";

// This is a mock config. In a real application, you would use your own
// Firebase project configuration.
const firebaseConfig: FirebaseOptions = {
  "projectId": "lifequest-cc4l7",
  "appId": "1:55049413123:web:6330cc4af7810eab12a436",
  "storageBucket": "lifequest-cc4l7.firebasestorage.app",
  "apiKey": "AIzaSyBoVr_1xTS13AirQ4u5BEnIROExxYNrV8c",
  "authDomain": "lifequest-cc4l7.firebaseapp.com",
  "messagingSenderId": "55049413123"
};

// Initialize Firebase for SSR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'consent'
});

export { app, auth, db, googleProvider };
