import {
  collectionGroup,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

const DEFAULT_PAGE_SIZE = 6;

/**
 * Reads a small page of public reels across users. Cursor pagination avoids
 * loading the whole collection and makes future topic filters additive.
 */
export async function getPublicReelsPage({
  cursor = null,
  pageSize = DEFAULT_PAGE_SIZE,
  keywords = [],
} = {}) {
  const normalizedKeywords = [...new Set(keywords)]
    .filter((keyword) => typeof keyword === "string" && keyword.trim())
    .slice(0, 10);

  const constraints = [where("kind", "==", "reel")];
  // Keyword interest filtering can be enabled by passing the user's interests.
  if (normalizedKeywords.length) {
    constraints.push(where("keywords", "array-contains-any", normalizedKeywords));
  }
  constraints.push(orderBy("createdAt", "desc"));
  if (cursor) constraints.push(startAfter(cursor));
  constraints.push(limit(pageSize));

  const snapshot = await getDocs(query(collectionGroup(db, "posts"), ...constraints));
  return {
    items: snapshot.docs.map((postDoc) => ({ id: postDoc.id, ...postDoc.data() })),
    cursor: snapshot.docs.length === pageSize ? snapshot.docs[snapshot.docs.length - 1] : null,
    hasMore: snapshot.docs.length === pageSize,
  };
}
