import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { db, storage } from "../config/firebase";

const STORAGE_ENABLED =
  process.env.EXPO_PUBLIC_FIREBASE_STORAGE_ENABLED === "true";

const ONBOARDING_VERSION = 1;

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeInterests = (interests) => {
  if (!Array.isArray(interests)) {
    return [];
  }

  return [
    ...new Set(
      interests.map((interest) => normalizeString(interest)).filter(Boolean),
    ),
  ];
};

const validateUserData = (user) => {
  if (!user || typeof user !== "object") {
    throw new Error("User onboarding data is missing.");
  }

  const name = normalizeString(user.name);
  const gender = normalizeString(user.gender);
  const location = normalizeString(user.location);
  const bio = normalizeString(user.bio);

  const age = Number(user.age);
  const interests = normalizeInterests(user.interests);

  if (!name) {
    throw new Error("Please enter your name.");
  }

  if (!Number.isInteger(age) || age < 13 || age > 120) {
    throw new Error("Please enter a valid age.");
  }

  if (!gender) {
    throw new Error("Please select your gender.");
  }

  if (!location) {
    throw new Error("Please enter your location.");
  }

  if (!bio) {
    throw new Error("Please enter your bio.");
  }

  if (interests.length === 0) {
    throw new Error("Please select at least one interest.");
  }

  return {
    name,
    age,
    gender,
    location,
    bio,
    interests,
    profileImageUri: user.profileImage || null,
    authProvider: normalizeString(user.authProvider) || "password",
  };
};

const validatePetData = (pet) => {
  if (!pet || typeof pet !== "object") {
    throw new Error("Pet onboarding data is missing.");
  }

  const petName = normalizeString(pet.petName);
  const type = normalizeString(pet.type);
  const gender = normalizeString(pet.gender);
  const size = normalizeString(pet.size);
  const age = Number(pet.age);

  if (!petName) {
    throw new Error("Please enter your pet's name.");
  }

  if (!type) {
    throw new Error("Please select your pet type.");
  }

  if (!gender) {
    throw new Error("Please select your pet's gender.");
  }

  if (!Number.isInteger(age) || age < 0 || age > 100) {
    throw new Error("Please enter a valid pet age.");
  }

  if (!size) {
    throw new Error("Please select your pet's size.");
  }

  return {
    petName,
    type,
    gender,
    age,
    size,
    imageUri: pet.imageUri || null,
  };
};

const uploadImage = async (uid, uri, storagePath) => {
  if (!uri) {
    return null;
  }

  if (!STORAGE_ENABLED) {
    throw new Error(
      "Firebase Storage is not enabled yet. Please remove the selected image or enable Firebase Storage.",
    );
  }

  if (!storage) {
    throw new Error("Firebase Storage is not configured.");
  }

  if (uri.startsWith("https://")) {
    return uri;
  }

  const response = await fetch(uri);

  if (!response.ok) {
    throw new Error("Unable to read the selected image.");
  }

  const blob = await response.blob();

  const imageRef = ref(storage, storagePath);

  await uploadBytes(imageRef, blob, {
    contentType: blob.type || "image/jpeg",
  });

  return await getDownloadURL(imageRef);
};

export const completeOnboarding = async (userId, onboardingData) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!onboardingData || typeof onboardingData !== "object") {
    throw new Error("Onboarding data is invalid.");
  }

  const userData = validateUserData(onboardingData.user);
  const petData = validatePetData(onboardingData.pet);

  // USER PROFILE IMAGE

  const profileImageUrl = userData.profileImageUri
    ? await uploadImage(
        userId,
        userData.profileImageUri,
        `users/${userId}/profile/profile-image.jpg`,
      )
    : null;

  // CREATE PET DOCUMENT ID BEFORE UPLOADING PET IMAGE

  const petsCollectionRef = collection(db, "users", userId, "pets");

  const petRef = doc(petsCollectionRef);

  // PET IMAGE

  const petImageUrl = petData.imageUri
    ? await uploadImage(
        userId,
        petData.imageUri,
        `users/${userId}/pets/${petRef.id}/profile.jpg`,
      )
    : null;

  // FIRESTORE BATCH

  const batch = writeBatch(db);

  const userRef = doc(db, "users", userId);

  // USER PROFILE

  batch.set(
    userRef,
    {
      uid: userId,

      name: userData.name,
      age: userData.age,
      gender: userData.gender,
      location: userData.location,
      bio: userData.bio,
      interests: userData.interests,

      profileImageUrl,

      authProvider: userData.authProvider,

      onboardingCompleted: true,
      onboardingVersion: ONBOARDING_VERSION,

      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  );

  // FIRST PET

  batch.set(petRef, {
    petId: petRef.id,
    petName: petData.petName,
    type: petData.type,
    gender: petData.gender,
    age: petData.age,
    size: petData.size,
    imageUrl: petImageUrl,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();

  return {
    success: true,
    userId,
    petId: petRef.id,
    profileImageUrl,
    petImageUrl,
  };
};

export const isFirebaseStorageEnabled = () => STORAGE_ENABLED;
