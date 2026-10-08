import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";
import { getCachedProfile, saveCachedProfile } from "./profileCache";
import {
  deleteProfileImageUrl,
  uploadPetImage,
  uploadProfileImage,
} from "./ProfileMediaServices";

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
  const changesProfileImage = Object.prototype.hasOwnProperty.call(
    profileData,
    "profileImageUrl",
  );
  const selectedImage = profileData.profileImageUrl;
  const profileImageUrl = selectedImage
    ? await uploadProfileImage(userId, selectedImage)
    : null;

  try {
    await setDoc(
      userRef,
      {
        ...profileData,
        ...(changesProfileImage ? { profileImageUrl } : {}),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    if (profileImageUrl && profileImageUrl !== selectedImage) {
      await deleteProfileImageUrl(profileImageUrl);
    }
    throw error;
  }

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

/** Fetch profile data from Firestore and persist it in the local cache. */
export async function fetchAndCacheUserProfileData(userId) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const [profile, pets] = await Promise.all([
    getUserProfile(userId),
    getUserPets(userId),
  ]);

  if (profile) {
    await saveCachedProfile(userId, profile, pets);
  }

  return { profile, pets };
}

/** Read cached profile data; reach Firestore only when the cache is missing. */
export async function getUserProfileData(userId) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const cached = await getCachedProfile(userId);

  if (cached?.profile && Array.isArray(cached.pets)) {
    return cached;
  }

  return fetchAndCacheUserProfileData(userId);
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
  const petRef = doc(petsRef);
  const selectedImage = petData.imageUri || petData.imageUrl || null;
  const imageUrl = selectedImage
    ? await uploadPetImage(userId, petRef.id, selectedImage)
    : null;
  const pet = {
    petId: petRef.id,
    petName: petData.petName || "",
    type: petData.type || "",
    gender: petData.gender || "",
    age: Number(petData.age) || 0,
    size: petData.size || "",
    imageUrl,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    // Include petId in the first and only create write to satisfy Firestore rules.
    await setDoc(petRef, pet);
  } catch (error) {
    if (imageUrl && imageUrl !== selectedImage) {
      await deleteProfileImageUrl(imageUrl);
    }
    throw error;
  }

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
  const hasImage =
    Object.prototype.hasOwnProperty.call(petData, "imageUri") ||
    Object.prototype.hasOwnProperty.call(petData, "imageUrl");
  const selectedImage = petData.imageUri || petData.imageUrl || null;
  const imageUrl = selectedImage
    ? await uploadPetImage(userId, petId, selectedImage)
    : null;
  const petFields = { ...petData };
  delete petFields.imageUri;
  delete petFields.imageUrl;

  try {
    await setDoc(
      petRef,
      {
        ...petFields,
        petId,
        ...(hasImage ? { imageUrl } : {}),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    if (imageUrl && imageUrl !== selectedImage) {
      await deleteProfileImageUrl(imageUrl);
    }
    throw error;
  }

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
