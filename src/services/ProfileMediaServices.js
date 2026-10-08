import * as ImageManipulator from "expo-image-manipulator";
import { Platform } from "react-native";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../config/firebase";

const STORAGE_ENABLED =
  process.env.EXPO_PUBLIC_FIREBASE_STORAGE_ENABLED === "true";

async function prepareImage(uri) {
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    if (!response.ok) throw new Error("Unable to read the selected image.");
    const bitmap = await createImageBitmap(await response.blob());
    const scale = Math.min(1, 1200 / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image compression is unavailable in this browser.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("Image compression failed.")),
        "image/jpeg",
        0.75,
      );
    });
  }

  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG },
  );
  const response = await fetch(result.uri);
  if (!response.ok) throw new Error("Unable to prepare the selected image.");
  return response.blob();
}

export async function uploadProfileImage(userId, uri) {
  if (!uri || /^https?:\/\//i.test(uri)) return uri || null;
  return uploadImage(userId, `profile/profile-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`, uri);
}

export async function uploadPetImage(userId, petId, uri) {
  if (!uri || /^https?:\/\//i.test(uri)) return uri || null;
  if (!petId) throw new Error("Pet ID is required to upload its image.");
  return uploadImage(userId, `pets/${petId}/profile-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`, uri);
}

async function uploadImage(userId, relativePath, uri) {
  if (!userId) throw new Error("User ID is required.");
  if (!STORAGE_ENABLED || !storage) {
    throw new Error("Firebase Storage is not enabled for profile images.");
  }
  const blob = await prepareImage(uri);
  const imageRef = ref(storage, `users/${userId}/${relativePath}`);
  await uploadBytes(imageRef, blob, { contentType: "image/jpeg" });
  return getDownloadURL(imageRef);
}

export async function deleteProfileImageUrl(uri) {
  if (!uri || !storage) return;
  try {
    const parsed = new URL(uri);
    const marker = "/o/";
    const index = parsed.pathname.indexOf(marker);
    if (index < 0) return;
    const storagePath = decodeURIComponent(parsed.pathname.slice(index + marker.length));
    if (/^users\/[^/]+\/(profile|pets\/[^/]+)\//.test(storagePath)) {
      await deleteObject(ref(storage, storagePath));
    }
  } catch {
    // A stale or non-Firebase URL should not block a profile update.
  }
}