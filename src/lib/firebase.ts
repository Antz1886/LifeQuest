
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "lifequest-cc4l7.firebaseapp.com",
  projectId: "lifequest-cc4l7",
  storageBucket: "lifequest-cc4l7.appspot.com",
  messagingSenderId: "55049413123",
  appId: "1:55049413123:web:6330cc4af7810eab12a436",
};

// Initialize Firebase for SSR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
