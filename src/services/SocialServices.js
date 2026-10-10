import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

const followingCollection = (userId) => collection(db, "users", userId, "following");
const followersCollection = (userId) => collection(db, "users", userId, "followers");

export async function getFollowingUserIds(userId = auth.currentUser?.uid) {
  if (!userId) return [];
  const snapshot = await getDocs(followingCollection(userId));
  return snapshot.docs.map((entry) => entry.id);
}

export async function getFollowStats(profileUserId, viewerId = auth.currentUser?.uid) {
  if (!profileUserId) return { followers: 0, following: 0, isFollowing: false };
  const [followers, following, relation] = await Promise.all([
    getCountFromServer(followersCollection(profileUserId)),
    getCountFromServer(followingCollection(profileUserId)),
    viewerId && viewerId !== profileUserId
      ? getDoc(doc(db, "users", viewerId, "following", profileUserId))
      : Promise.resolve(null),
  ]);
  return {
    followers: followers.data().count,
    following: following.data().count,
    isFollowing: Boolean(relation?.exists()),
  };
}

export async function setFollowingUser(profileUserId, shouldFollow) {
  const viewerId = auth.currentUser?.uid;
  if (!viewerId) throw new Error("Sign in to follow people.");
  if (!profileUserId || profileUserId === viewerId) {
    throw new Error("You cannot follow your own profile.");
  }

  const followingRef = doc(db, "users", viewerId, "following", profileUserId);
  const followerRef = doc(db, "users", profileUserId, "followers", viewerId);
  const publicProfileRef = doc(db, "publicProfiles", profileUserId);

  return runTransaction(db, async (transaction) => {
    const [followingSnapshot, profileSnapshot] = await Promise.all([
      transaction.get(followingRef),
      transaction.get(publicProfileRef),
    ]);
    if (!profileSnapshot.exists()) {
      throw new Error("This profile is not available yet.");
    }

    if (shouldFollow) {
      if (followingSnapshot.exists()) return { isFollowing: true, changed: false };
      transaction.set(followingRef, {
        userId: profileUserId,
        createdAt: serverTimestamp(),
      });
      transaction.set(followerRef, {
        userId: viewerId,
        createdAt: serverTimestamp(),
      });
      return { isFollowing: true, changed: true };
    }

    if (!followingSnapshot.exists()) return { isFollowing: false, changed: false };
    transaction.delete(followingRef);
    transaction.delete(followerRef);
    return { isFollowing: false, changed: true };
  });
}
