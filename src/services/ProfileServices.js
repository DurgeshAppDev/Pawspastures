import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
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
    const publicRef = doc(db, "publicProfiles", userId);
    const profileUpdate = {
      ...profileData,
      ...(changesProfileImage ? { profileImageUrl } : {}),
      uid: userId,
      updatedAt: serverTimestamp(),
    };
    const batch = writeBatch(db);
    batch.set(userRef, profileUpdate, { merge: true });
    batch.set(publicRef, profileUpdate, { merge: true });
    await batch.commit();
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

export async function getPublicUserProfile(userId) {
  if (!userId) throw new Error("User ID is required.");
  const profileRef = doc(db, "publicProfiles", userId);
  const [profileSnapshot, petsSnapshot] = await Promise.all([
    getDoc(profileRef),
    getDocs(collection(db, "publicProfiles", userId, "pets")),
  ]);
  if (!profileSnapshot.exists()) return null;
  return {
    profile: { id: profileSnapshot.id, ...profileSnapshot.data() },
    pets: petsSnapshot.docs.map((petDoc) => ({ id: petDoc.id, ...petDoc.data() })),
  };
}

/** Publishes an existing owner's cached profile once for older accounts. */
export async function ensurePublicProfile(userId) {
  if (!userId) return false;
  const publicRef = doc(db, "publicProfiles", userId);
  if ((await getDoc(publicRef)).exists()) return true;
  const privateData = await getUserProfileData(userId);
  if (!privateData?.profile) return false;

  const batch = writeBatch(db);
  batch.set(publicRef, { ...privateData.profile, uid: userId });
  (privateData.pets || []).forEach((pet) => {
    const petId = pet.id || pet.petId;
    if (!petId) return;
    const publicPet = { ...pet, petId };
    delete publicPet.id;
    batch.set(doc(db, "publicProfiles", userId, "pets", petId), {
      ...publicPet,
    });
  });
  await batch.commit();
  return true;
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
    const batch = writeBatch(db);
    batch.set(petRef, pet);
    batch.set(doc(db, "publicProfiles", userId, "pets", petRef.id), pet);
    await batch.commit();
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
    const updatedPet = {
      ...petFields,
      petId,
      ...(hasImage ? { imageUrl } : {}),
      updatedAt: serverTimestamp(),
    };
    const batch = writeBatch(db);
    batch.set(petRef, updatedPet, { merge: true });
    batch.set(
      doc(db, "publicProfiles", userId, "pets", petId),
      updatedPet,
      { merge: true },
    );
    await batch.commit();
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

  const batch = writeBatch(db);
  batch.delete(petRef);
  batch.delete(doc(db, "publicProfiles", userId, "pets", petId));
  await batch.commit();

  return true;
}
