import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";

// USER PROFILE

export async function getUserProfile(userId) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const userRef = doc(db, "users", userId);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function updateUserProfile(userId, profileData) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const userRef = doc(db, "users", userId);

  await setDoc(
    userRef,
    {
      ...profileData,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

// PETS

export async function getUserPets(userId) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const petsRef = collection(db, "users", userId, "pets");
  const snapshot = await getDocs(petsRef);

  return snapshot.docs.map((petDoc) => ({
    id: petDoc.id,
    ...petDoc.data(),
  }));
}

export async function getUserPet(userId, petId) {
  if (!userId || !petId) {
    throw new Error("User ID and pet ID are required.");
  }

  const petRef = doc(db, "users", userId, "pets", petId);
  const snapshot = await getDoc(petRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function createUserPet(userId, petData) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!petData || typeof petData !== "object") {
    throw new Error("Pet data is required.");
  }

  const petsRef = collection(db, "users", userId, "pets");

  const petRef = await addDoc(petsRef, {
    petName: petData.petName || "",
    type: petData.type || "",
    gender: petData.gender || "",
    age: Number(petData.age) || 0,
    size: petData.size || "",
    imageUrl: petData.imageUrl || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(
    petRef,
    {
      petId: petRef.id,
    },
    { merge: true },
  );

  const snapshot = await getDoc(petRef);

  if (!snapshot.exists()) {
    throw new Error("Pet could not be created.");
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function updateUserPet(userId, petId, petData) {
  if (!userId || !petId) {
    throw new Error("User ID and pet ID are required.");
  }

  const petRef = doc(db, "users", userId, "pets", petId);

  await setDoc(
    petRef,
    {
      ...petData,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  const snapshot = await getDoc(petRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function deleteUserPet(userId, petId) {
  if (!userId || !petId) {
    throw new Error("User ID and pet ID are required.");
  }

  const petRef = doc(db, "users", userId, "pets", petId);

  await deleteDoc(petRef);

  return true;
}