import {
  collection,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  startAfter,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import * as ImageManipulator from "expo-image-manipulator";
import { Platform } from "react-native";
import compressVideoForUpload from "./compressVideoForUpload";

import { db, storage } from "../config/firebase";
import { getCachedProfile } from "./profileCache";

const STORAGE_ENABLED =
  process.env.EXPO_PUBLIC_FIREBASE_STORAGE_ENABLED === "true";

const getPostCollection = (userId) =>
  collection(db, "users", userId, "posts");

export async function incrementPostView(userId, postId) {
  if (!userId || !postId) throw new Error("Post owner and ID are required.");
  await updateDoc(doc(db, "users", userId, "posts", postId), {
    views: increment(1),
  });
}

export async function getUserPostsPage(
  userId,
  { kind, cursor = null, pageSize = 6 } = {},
) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!['post', 'reel'].includes(kind)) {
    throw new Error("A post or reel section is required.");
  }

  const constraints = [
    where("kind", "==", kind),
    orderBy("createdAt", "desc"),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(pageSize),
  ];
  const snapshot = await getDocs(query(getPostCollection(userId), ...constraints));
  const items = snapshot.docs.map((postDoc) => ({
    id: postDoc.id,
    ...postDoc.data(),
  }));

  return {
    items,
    cursor: snapshot.docs.length === pageSize
      ? snapshot.docs[snapshot.docs.length - 1]
      : null,
    hasMore: snapshot.docs.length === pageSize,
  };
}

const prepareImageForUpload = async (uri) => {
  if (!uri) throw new Error("Post image is missing.");

  // ImageManipulator does not consistently accept browser blob: URLs. Use
  // the browser canvas for web and the native Expo pipeline on iOS/Android.
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    if (!response.ok) throw new Error("Unable to read the selected image.");
    const sourceBlob = await response.blob();
    const bitmap = await createImageBitmap(sourceBlob);
    const scale = Math.min(1, 1200 / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    return await new Promise((resolve, reject) => {
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
    {
      compress: 0.75,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );

  const response = await fetch(result.uri);
  if (!response.ok) throw new Error("Unable to prepare the selected image.");
  return response.blob();
};

const uploadWithProgress = (mediaRef, blob, metadata, onProgress) =>
  new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(mediaRef, blob, metadata);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = snapshot.totalBytes
          ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          : 0;
        onProgress?.(percent);
      },
      reject,
      () => resolve(uploadTask.snapshot),
    );
  });

export async function createUserPost(userId, postData, { onProgress } = {}) {
  if (!userId || !postData?.mediaUri) {
    throw new Error("User and post media are required.");
  }

  if (!STORAGE_ENABLED || !storage) {
    throw new Error("Media uploads are not enabled for this app yet.");
  }

  if (!['post', 'reel'].includes(postData.kind)) {
    throw new Error("Choose whether to publish a post or a reel.");
  }

  if (postData.kind === "reel" && postData.mediaType !== "video") {
    throw new Error("Reels must be video clips.");
  }

  if (postData.kind === "post" && postData.mediaType !== "image") {
    throw new Error("Photo posts must use an image.");
  }

  if (postData.kind === "reel") {
    const duration = Number(postData.videoDuration);
    if (!Number.isFinite(duration) || duration <= 0 || duration > 30) {
      throw new Error("Reels must be verified as 30 seconds or shorter.");
    }
  }

  const postRef = doc(getPostCollection(userId));
  const cachedProfile = await getCachedProfile(userId);
  const authorProfile = cachedProfile?.profile || {};
  const authorPet = cachedProfile?.pets?.[0] || {};
  const isVideo = postData.mediaType === "video";
  let blob;
  if (isVideo) {
    const compressedVideo = await compressVideoForUpload(postData.mediaUri);
    if (Platform.OS === "web" && compressedVideo instanceof Blob) {
      blob = compressedVideo;
    } else {
      const response = await fetch(compressedVideo);
      if (!response.ok) throw new Error("Unable to prepare the compressed reel.");
      blob = await response.blob();
    }
  } else {
    blob = await prepareImageForUpload(postData.mediaUri);
  }
  const contentType = blob.type || (isVideo ? "video/mp4" : "image/jpeg");
  const extension = isVideo ? "mp4" : "jpg";
  const mediaRef = ref(
    storage,
    `users/${userId}/posts/${postRef.id}.${extension}`,
  );

  try {
    await uploadWithProgress(mediaRef, blob, { contentType }, onProgress);
    const mediaUrl = await getDownloadURL(mediaRef);
    const post = {
      postId: postRef.id,
      userId,
      authorName: authorProfile.name || "Pet parent",
      authorPhotoUrl: authorProfile.profileImageUrl || null,
      petName: authorPet.petName || "",
      kind: postData.kind,
      mediaType: postData.mediaType,
      mediaUrl,
      caption: postData.caption?.trim() || "",
      overlayText: postData.overlayText?.trim() || "",
      overlayTextColor: postData.textColor || postData.overlayTextColor || null,
      overlayTextSize: postData.textSize || postData.overlayTextSize || null,
      overlayTextPosition: postData.textPosition || null,
      overlayTextBold: postData.textBold ?? true,
      overlayTextItalic: postData.textItalic ?? false,
      overlayTextUnderline: postData.textUnderline ?? false,
      overlayTextAlign: postData.textAlign || "left",
      videoDuration: Number(postData.videoDuration) || null,
      views: 0,
      createdAt: serverTimestamp(),
    };

    await setDoc(postRef, post);

    return {
      ...post,
      id: postRef.id,
      createdAt: new Date(),
    };
  } catch (error) {
    await deleteObject(mediaRef).catch(() => {});
    throw error;
  }
}
