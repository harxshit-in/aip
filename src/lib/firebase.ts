import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBfkYYde6dPYdT-Wo6nCnOiOKIaGO0tRXc",
  authDomain: "parikshai-harxshit.firebaseapp.com",
  projectId: "parikshai-harxshit",
  storageBucket: "parikshai-harxshit.firebasestorage.app",
  messagingSenderId: "88815516499",
  appId: "1:88815516499:web:ddf0fde4c41df8a0bbbfa6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
