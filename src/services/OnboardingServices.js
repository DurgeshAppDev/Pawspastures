import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";

export const saveUserDetails = async (userId, userData) => {
  if (!userId) {
    throw new Error("User ID is missing.");
  }

  if (!userData || typeof userData !== "object") {
    throw new Error("User data is invalid.");
  }

  const userRef = doc(db, "users", userId);

  await setDoc(
    userRef,
    {
      ...userData,

      userId,

      // Mark onboarding as completed.
      onboardingCompleted: true,

      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  );
};

export const savePetDetails = async (userId, petData) => {
  if (!userId) {
    throw new Error("User ID is missing.");
  }

  if (!petData || typeof petData !== "object") {
    throw new Error("Pet data is invalid.");
  }

  const petRef = doc(
    db,
    "users",
    userId,
    "pets",
    "petdetails",
  );

  await setDoc(
    petRef,
    {
      ...petData,
      userId,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  );
};