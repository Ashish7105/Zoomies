import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDHWaAy32tlxBoSf7gZewjkb99cjrdMXVI",
  authDomain: "zoomies-1d011.firebaseapp.com",
  projectId: "zoomies-1d011",
  storageBucket: "zoomies-1d011.firebasestorage.app",
  messagingSenderId: "904334744873",
  appId: "1:904334744873:web:81093bddc8002660c72b38",
  measurementId: "G-KXBGX4QDX9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Firestore instance
export const db = getFirestore(app);