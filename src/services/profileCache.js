import AsyncStorage from "@react-native-async-storage/async-storage";

const PROFILE_CACHE_PREFIX = "@pawspastures/profile/";

function getCacheKey(userId) {
  return `${PROFILE_CACHE_PREFIX}${userId}`;
}

export async function getCachedProfile(userId) {
  if (!userId) {
    return null;
  }

  try {
    const value = await AsyncStorage.getItem(getCacheKey(userId));

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch (error) {
    console.warn("Failed to read profile cache:", error);
    return null;
  }
}

export async function saveCachedProfile(userId, profile, pets = []) {
  if (!userId) {
    return;
  }

  try {
    await AsyncStorage.setItem(
      getCacheKey(userId),
      JSON.stringify({
        profile,
        pets,
        cachedAt: Date.now(),
      }),
    );
  } catch (error) {
    console.warn("Failed to save profile cache:", error);
  }
}

export async function clearCachedProfile(userId) {
  if (!userId) {
    return;
  }

  try {
    await AsyncStorage.removeItem(getCacheKey(userId));
  } catch (error) {
    console.warn("Failed to clear profile cache:", error);
  }
}
