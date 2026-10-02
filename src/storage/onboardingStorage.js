import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_PREFIX = "onboardingDraft";
const CURRENT_VERSION = 1;

const getStorageKey = (uid) => `${STORAGE_PREFIX}:${uid}`;

const createEmptyDraft = () => ({
  version: CURRENT_VERSION,
  user: null,
  pet: null,
  updatedAt: null,
});

export const getOnboardingDraft = async (uid) => {
  if (!uid) {
    throw new Error("User ID is required.");
  }

  const raw = await AsyncStorage.getItem(getStorageKey(uid));

  if (!raw) {
    return createEmptyDraft();
  }

  try {
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid onboarding draft.");
    }

    return {
      ...createEmptyDraft(),
      ...parsed,
      version: parsed.version || CURRENT_VERSION,
    };
  } catch (error) {
    console.warn("Invalid onboarding draft. Resetting local draft.");

    await AsyncStorage.removeItem(getStorageKey(uid));

    return createEmptyDraft();
  }
};

export const updateOnboardingDraft = async (uid, updates) => {
  if (!uid) {
    throw new Error("User ID is required.");
  }

  if (!updates || typeof updates !== "object") {
    throw new Error("Onboarding updates are invalid.");
  }

  const currentDraft = await getOnboardingDraft(uid);

  const nextDraft = {
    ...currentDraft,
    ...updates,
    version: CURRENT_VERSION,
    updatedAt: Date.now(),
  };

  await AsyncStorage.setItem(getStorageKey(uid), JSON.stringify(nextDraft));

  return nextDraft;
};

export const clearOnboardingDraft = async (uid) => {
  if (!uid) {
    return;
  }

  await AsyncStorage.removeItem(getStorageKey(uid));
};
