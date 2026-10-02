import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { db } from "../config/firebase";

// GET USER PROFILE

export const getUserProfile = async (uid) => {
  if (!uid) {
    throw new Error("User UID is required.");
  }

  const userRef = doc(db, "users", uid);

  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

// CREATE USER PROFILE

export const createUserProfile = async (
  uid,
  name,
  email,
  authProvider = "password",
) => {
  if (!uid) {
    throw new Error("User UID is required.");
  }

  const userRef = doc(db, "users", uid);

  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  }

  const profile = {
    uid,
    name,
    email,
    authProvider,
    profileCompleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, profile);

  return profile;
};
