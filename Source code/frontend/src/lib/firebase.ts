import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA6DuJTxowaIuzj_FZgIyudoqOByG8fmT4",
  authDomain: "prepzo-ai-carrer-platform.firebaseapp.com",
  projectId: "prepzo-ai-carrer-platform",
  storageBucket: "prepzo-ai-carrer-platform.firebasestorage.app",
  messagingSenderId: "529957180758",
  appId: "1:529957180758:web:efba7671a4919989c4f2f7",
  measurementId: "G-1DZS4LYXXW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Helper for Recaptcha
export const setupRecaptcha = (containerId: string) => {
  if (window.recaptchaVerifier) {
     window.recaptchaVerifier.clear();
  }
  
  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    'size': 'invisible',
    'callback': () => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
    }
  });
  
  return window.recaptchaVerifier;
};

// Global type for recaptcha
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult: any;
  }
}
