import { auth, db, storage } from "../config/firebase";
import {
  Timestamp, collection, deleteDoc, doc, getDocs, limit, orderBy,
  query, serverTimestamp, setDoc, where,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import * as ImageManipulator from "expo-image-manipulator";
import { Platform } from "react-native";
import compressVideoForUpload from "./compressVideoForUpload";
import { getFollowingUserIds } from "./SocialServices";

const MAX_ACTIVE_STORIES = 10;
const STORY_DURATION = 24 * 60 * 60 * 1000;
const storiesRef = collection(db, "stories");

const normalizeStory = (snapshot) => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
    type: data.mediaType,
    uri: data.mediaUrl,
    avatar: data.petImage || data.userPhoto || null,
  };
};

export async function getActiveStories() {
  const activeQuery = query(storiesRef, where("expiresAt", ">", Timestamp.now()), orderBy("expiresAt", "asc"));
  const snapshot = await getDocs(activeQuery);
  return snapshot.docs.map(normalizeStory);
}

export async function getStoriesGroupedByUser() {
  const grouped = new Map();
  const viewerId = auth.currentUser?.uid;
  if (!viewerId) return [];
  const followedIds = await getFollowingUserIds(viewerId);
  const visibleUserIds = [...new Set([viewerId, ...followedIds])];
  const userIdChunks = [];
  for (let index = 0; index < visibleUserIds.length; index += 30) {
    userIdChunks.push(visibleUserIds.slice(index, index + 30));
  }
  const snapshots = await Promise.all(
    userIdChunks.map((userIds) =>
      getDocs(
        query(
          storiesRef,
          where("userId", "in", userIds),
          where("expiresAt", ">", Timestamp.now()),
          orderBy("expiresAt", "asc"),
        ),
      ),
    ),
  );
  const stories = snapshots.flatMap((snapshot) => snapshot.docs.map(normalizeStory));
  stories.forEach((story) => {
    if (!grouped.has(story.userId)) {
      grouped.set(story.userId, { userId: story.userId, userName: story.userName, avatar: story.avatar, stories: [] });
    }
    grouped.get(story.userId).stories.push(story);
  });
  return [...grouped.values()];
}

async function countActiveStories(userId) {
  const activeQuery = query(storiesRef, where("userId", "==", userId), where("expiresAt", ">", Timestamp.now()), limit(MAX_ACTIVE_STORIES));
  return (await getDocs(activeQuery)).size;
}

async function prepareImage(uri) {
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    if (!response.ok) throw new Error("Unable to read the selected story image.");
    const bitmap = await createImageBitmap(await response.blob());
    const scale = Math.min(1, 1200 / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image compression is unavailable in this browser.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    return new Promise((resolve, reject) => canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Story image compression failed.")),
      "image/jpeg", 0.75,
    ));
  }
  const result = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 1200 } }], {
    compress: 0.75,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  const response = await fetch(result.uri);
  if (!response.ok) throw new Error("Unable to prepare the story image.");
  return response.blob();
}

const upload = (mediaRef, blob) => new Promise((resolve, reject) => {
  const task = uploadBytesResumable(mediaRef, blob, { contentType: blob.type || "application/octet-stream" });
  task.on("state_changed", undefined, reject, () => resolve(task.snapshot));
});

export async function addStory(storyData) {
  const user = auth.currentUser;
  if (!user?.uid) throw new Error("Sign in before sharing a story.");
  if (!storyData?.mediaUri || !["image", "video"].includes(storyData.mediaType)) {
    throw new Error("Choose a photo or video for your story.");
  }
  if (storyData.mediaType === "video" && (!Number(storyData.videoDuration) || Number(storyData.videoDuration) > 15)) {
    throw new Error("Stories must be verified as 15 seconds or shorter.");
  }
  if (await countActiveStories(user.uid) >= MAX_ACTIVE_STORIES) {
    throw new Error("You already have 10 active stories. Wait for one to expire before adding another.");
  }

  const storyDoc = doc(storiesRef);
  const isVideo = storyData.mediaType === "video";
  let blob;
  if (isVideo) {
    const compressed = await compressVideoForUpload(storyData.mediaUri);
    if (Platform.OS === "web" && compressed instanceof Blob) blob = compressed;
    else {
      const response = await fetch(compressed);
      if (!response.ok) throw new Error("Unable to prepare the compressed story video.");
      blob = await response.blob();
    }
  } else blob = await prepareImage(storyData.mediaUri);

  const mediaRef = ref(storage, `users/${user.uid}/stories/${storyDoc.id}.${isVideo ? "mp4" : "jpg"}`);
  try {
    await upload(mediaRef, blob);
    const mediaUrl = await getDownloadURL(mediaRef);
    const now = Date.now();
    const story = {
      storyId: storyDoc.id,
      userId: user.uid,
      userName: storyData.userName || user.displayName || user.email?.split("@")[0] || "Pet parent",
      userPhoto: user.photoURL || null,
      petName: storyData.petName || "",
      petImage: storyData.petImage || null,
      mediaType: storyData.mediaType,
      mediaUrl,
      caption: storyData.caption?.trim() || "",
      overlayText: storyData.overlayText?.trim() || "",
      overlayTextColor: storyData.overlayTextColor || storyData.textColor || null,
      overlayTextSize: storyData.overlayTextSize || storyData.textSize || null,
      overlayTextPosition: storyData.overlayTextPosition || storyData.textPosition || null,
      overlayTextBold: storyData.overlayTextBold ?? storyData.textBold ?? true,
      overlayTextItalic: storyData.overlayTextItalic ?? storyData.textItalic ?? false,
      overlayTextUnderline: storyData.overlayTextUnderline ?? storyData.textUnderline ?? false,
      overlayTextAlign: storyData.overlayTextAlign || storyData.textAlign || "left",
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromMillis(now + STORY_DURATION),
    };
    await setDoc(storyDoc, story);
    return { ...story, id: storyDoc.id, uri: mediaUrl, type: storyData.mediaType, createdAt: now };
  } catch (error) {
    await deleteObject(mediaRef).catch(() => {});
    throw error;
  }
}

export async function deleteStory(storyId) {
  const storyRef = doc(db, "stories", storyId);
  const snapshot = await getDocs(query(storiesRef, where("storyId", "==", storyId), limit(1)));
  const data = snapshot.docs[0]?.data();
  if (!data || data.userId !== auth.currentUser?.uid) throw new Error("You can only delete your own story.");
  await deleteObject(ref(storage, `users/${data.userId}/stories/${storyId}.${data.mediaType === "video" ? "mp4" : "jpg"}`)).catch(() => {});
  await deleteDoc(storyRef);
}

export const isStoryActive = (story) => Boolean(story?.createdAt && Date.now() - story.createdAt < STORY_DURATION);
export const getStoryLimits = () => ({ maxStories: MAX_ACTIVE_STORIES, durationHours: 24 });
