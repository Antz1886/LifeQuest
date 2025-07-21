
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  projectId: "lifequest-cc4l7",
  appId: "1:55049413123:web:6330cc4af7810eab12a436",
  storageBucket: "lifequest-cc4l7.firebasestorage.app",
  apiKey: "AIzaSyBoVr_1xTS13AirQ4u5BEnIROExxYNrV8c",
  authDomain: "lifequest-cc4l7.firebaseapp.com",
  messagingSenderId: "55049413123",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
