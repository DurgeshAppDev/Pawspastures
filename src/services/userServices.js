import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "../config/firebase";

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
    name: name || "",
    email: email || "",
    authProvider,
    onboardingCompleted: false,
    onboardingVersion: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, profile);

  return profile;
};
