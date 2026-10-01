import { doc, getDoc } from "firebase/firestore";

import { db } from "../config/firebase";

export const getProfileData = async (userId) => {
  if (!userId) {
    throw new Error("User ID is missing.");
  }

  const userRef = doc(db, "users", userId);
  const petRef = doc(db, "users", userId, "pets", "petdetails");

  const [userSnapshot, petSnapshot] = await Promise.all([
    getDoc(userRef),
    getDoc(petRef),
  ]);

  return {
    user: userSnapshot.exists() ? userSnapshot.data() : null,
    pet: petSnapshot.exists() ? petSnapshot.data() : null,
  };
};
