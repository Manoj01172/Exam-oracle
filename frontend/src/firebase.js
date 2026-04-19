import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// ─── Paste your Firebase project config here ─────────────────────────────────
// Get this from: Firebase Console → Project Settings → Your Apps → SDK setup
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
};

const app            = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Force account selection every time (so user can switch accounts)
googleProvider.setCustomParameters({ prompt: "select_account" });
