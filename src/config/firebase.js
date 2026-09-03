import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyABcXnHXtHMMlcjGN9xQl3bhHxIcB2DOLM",
  authDomain: "paws-pastures-4ee14.firebaseapp.com",
  projectId: "paws-pastures-4ee14",
  storageBucket: "paws-pastures-4ee14.firebasestorage.app",
  messagingSenderId: "524644783725",
  appId: "1:524644783725:web:a38173549d83be079ed164",
};

const app = getApps().length > 0
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
