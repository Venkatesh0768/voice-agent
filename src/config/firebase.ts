import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, CustomProvider } from 'firebase/app-check';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize App Check
// During development, you can use a debug token.
// For production, you would configure a reCAPTCHA v3 provider.
if (import.meta.env.DEV) { // Only enable for development
  (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = "1E47C2B7-5798-45C1-A98A-5A59FC23B2C3";
}

initializeAppCheck(app, {
  provider: new CustomProvider({
    getToken: async () => {
      // For debug tokens, we just return the hardcoded token
      return { token: (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN as string, expireTimeMillis: Date.now() + 3600 * 1000 };
    },
  }),
  isTokenAutoRefreshEnabled: true
});

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 