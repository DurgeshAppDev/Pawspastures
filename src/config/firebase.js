import { getApp, getApps, initializeApp } from "firebase/app";

import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { getFirestore } from "firebase/firestore";

import { Platform } from "react-native";

// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,

  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,

  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,

  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,

  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,

  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// ============================================================
// FIREBASE APP
// ============================================================

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// ============================================================
// FIREBASE AUTH
// ============================================================

// Native:
// Use AsyncStorage persistence.
//
// Web:
// Use Firebase's normal browser Auth implementation.

export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

// ============================================================
// FIRESTORE
// ============================================================

export const db = getFirestore(app);

export default app;
