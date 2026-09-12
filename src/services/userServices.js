import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config/firebase";

export const createUserProfile = async (
  userId,
  name,
  email
) => {
  await setDoc(
    doc(db, "users", userId),
    {
      uid: userId,
      name,
      email,
      createdAt: serverTimestamp(),
    }
  );
};