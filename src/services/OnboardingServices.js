import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import * as ImageManipulator from "expo-image-manipulator";

import { db, storage } from "../config/firebase";

const STORAGE_ENABLED =
  process.env.EXPO_PUBLIC_FIREBASE_STORAGE_ENABLED === "true";

const ONBOARDING_VERSION = 1;

const MAX_IMAGE_WIDTH = 1200;
const IMAGE_QUALITY = 0.75;

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

/*
 * Compress and resize the image before uploading.
 *
 * The original image selected by the user is not changed.
 */
const prepareImageForUpload = async (uri) => {
  if (!uri) {
    return null;
  }

  /*
   * If this is already a Firebase/download URL,
   * don't process it again.
   */
  if (uri.startsWith("https://") || uri.startsWith("http://")) {
    return uri;
  }

  const result = await ImageManipulator.manipulateAsync(
    uri,
    [
      {
        resize: {
          width: MAX_IMAGE_WIDTH,
        },
      },
    ],
    {
      compress: IMAGE_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );

  return result.uri;
};

/*
 * Upload a prepared image to Firebase Storage.
 */
const uploadImage = async (uri, storagePath) => {
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

  /*
   * Already uploaded image.
   */
  if (uri.startsWith("https://") || uri.startsWith("http://")) {
    return uri;
  }

  const response = await fetch(uri);

  if (!response.ok) {
    throw new Error("Unable to read the selected image.");
  }

  const blob = await response.blob();

  const imageRef = ref(storage, storagePath);

  await uploadBytes(imageRef, blob, {
    contentType: "image/jpeg",
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

  /*
   * Keep the existing onboarding structure.
   */
  const userData = validateUserData(onboardingData.user);

  const petData = validatePetData(onboardingData.pet);

  /*
   * Create the pet document ID first.
   *
   * This is required because the pet image is stored at:
   *
   * users/{uid}/pets/{petId}/profile.jpg
   */
  const petsCollectionRef = collection(db, "users", userId, "pets");

  const petRef = doc(petsCollectionRef);

  /*
   * Prepare both images at the same time.
   *
   * Previously:
   *
   * profile image → wait
   * pet image     → wait
   *
   * Now:
   *
   * profile image ─┐
   *                ├── parallel
   * pet image ─────┘
   */
  const [preparedProfileImage, preparedPetImage] = await Promise.all([
    userData.profileImageUri
      ? prepareImageForUpload(userData.profileImageUri)
      : Promise.resolve(null),

    petData.imageUri
      ? prepareImageForUpload(petData.imageUri)
      : Promise.resolve(null),
  ]);

  /*
   * Upload both images at the same time.
   */
  const [profileImageUrl, petImageUrl] = await Promise.all([
    preparedProfileImage
      ? uploadImage(
          preparedProfileImage,
          `users/${userId}/profile/profile-image.jpg`,
        )
      : Promise.resolve(null),

    preparedPetImage
      ? uploadImage(
          preparedPetImage,
          `users/${userId}/pets/${petRef.id}/profile.jpg`,
        )
      : Promise.resolve(null),
  ]);

  /*
   * One Firestore batch.
   */
  const batch = writeBatch(db);

  const userRef = doc(db, "users", userId);

  /*
   * USER PROFILE
   *
   * Same structure as your existing code.
   */
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

  /*
   * FIRST PET
   *
   * Same structure as your existing code.
   */
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

  /*
   * Commit user + pet together.
   */
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
