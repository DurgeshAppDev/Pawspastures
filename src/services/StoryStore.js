import { Platform } from "react-native";

const MAX_ACTIVE_STORIES = 10;
const STORY_DURATION = 24 * 60 * 60 * 1000;

/**
 * In-memory story store.
 *
 * Later this can be replaced with Firebase Firestore/Storage
 * without changing the Story UI structure.
 */
let stories = [
  {
    id: "story-1",
    userId: "user-1",
    userName: "Rahul Sharma",
    petName: "Max",
    petImage:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600",
    mediaType: "image",
    mediaUri:
      "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=1200",
    caption: "Morning walk with Max 🐾",
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
  },

  {
    id: "story-2",
    userId: "user-1",
    userName: "Rahul Sharma",
    petName: "Bella",
    petImage:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600",
    mediaType: "image",
    mediaUri:
      "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=1200",
    caption: "Bella enjoying the sunshine ☀️",
    createdAt: Date.now() - 60 * 60 * 1000,
  },

  {
    id: "story-3",
    userId: "user-2",
    userName: "Simran Kaur",
    petName: "Rocky",
    petImage:
      "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=600",
    mediaType: "image",
    mediaUri:
      "https://images.unsplash.com/photo-1568572933382-74d440642117?w=1200",
    caption: "Rocky having a great day 🐶",
    createdAt: Date.now() - 3 * 60 * 60 * 1000,
  },
];

/**
 * Remove stories older than 24 hours.
 */
export const removeExpiredStories = () => {
  const now = Date.now();

  stories = stories.filter((story) => {
    return now - story.createdAt < STORY_DURATION;
  });

  return stories;
};

/**
 * Get only active stories.
 */
export const getActiveStories = () => {
  removeExpiredStories();

  return [...stories];
};

/**
 * Get stories grouped by user.
 */
export const getStoriesGroupedByUser = () => {
  removeExpiredStories();

  const grouped = {};

  stories.forEach((story) => {
    if (!grouped[story.userId]) {
      grouped[story.userId] = {
        userId: story.userId,
        userName: story.userName,
        stories: [],
      };
    }

    grouped[story.userId].stories.push(story);
  });

  return Object.values(grouped);
};

/**
 * Get number of active stories for one user.
 */
export const getUserActiveStoryCount = (userId) => {
  removeExpiredStories();

  return stories.filter(
    (story) => story.userId === userId
  ).length;
};

/**
 * Add a new story.
 *
 * Maximum active stories = 10.
 *
 * If user already has 10 active stories,
 * the oldest active story is removed first.
 */
export const addStory = ({
  userId,
  userName,
  petName,
  petImage,
  mediaType,
  mediaUri,
  caption,
}) => {
  removeExpiredStories();

  const userStories = stories
    .filter((story) => story.userId === userId)
    .sort((a, b) => a.createdAt - b.createdAt);

  if (userStories.length >= MAX_ACTIVE_STORIES) {
    const oldestStory = userStories[0];

    stories = stories.filter(
      (story) => story.id !== oldestStory.id
    );
  }

  const newStory = {
    id: `story-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`,

    userId,
    userName,
    petName,
    petImage,

    mediaType,
    mediaUri,

    caption: caption?.trim() || "",

    createdAt: Date.now(),
  };

  stories.push(newStory);

  return newStory;
};

/**
 * Delete a story manually.
 */
export const deleteStory = (storyId) => {
  stories = stories.filter(
    (story) => story.id !== storyId
  );
};

/**
 * Check whether a story is still active.
 */
export const isStoryActive = (story) => {
  if (!story?.createdAt) {
    return false;
  }

  return Date.now() - story.createdAt < STORY_DURATION;
};

/**
 * Useful for displaying "10 / 10".
 */
export const getStoryLimits = () => {
  return {
    maxStories: MAX_ACTIVE_STORIES,
    durationHours: 24,
  };
};