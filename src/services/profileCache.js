import AsyncStorage from "@react-native-async-storage/async-storage";

const PROFILE_CACHE_PREFIX = "@pawspastures/profile/";

function getCacheKey(userId) {
  return `${PROFILE_CACHE_PREFIX}${userId}`;
}

async function readCache(userId) {
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

async function writeCache(userId, data) {
  if (!userId) {
    return;
  }

  try {
    await AsyncStorage.setItem(
      getCacheKey(userId),
      JSON.stringify({
        profile: data.profile || null,
        pets: Array.isArray(data.pets) ? data.pets : [],
        cachedAt: Date.now(),
      }),
    );
  } catch (error) {
    console.warn("Failed to write profile cache:", error);
    throw error;
  }
}

export async function getCachedProfile(userId) {
  return readCache(userId);
}

export async function saveCachedProfile(userId, profile, pets = []) {
  if (!userId) {
    return;
  }

  await writeCache(userId, {
    profile,
    pets,
  });
}

export async function updateCachedProfile(userId, profileData) {
  const cache = await readCache(userId);

  await writeCache(userId, {
    profile: {
      ...(cache?.profile || {}),
      ...profileData,
    },
    pets: cache?.pets || [],
  });
}

export async function addCachedPet(userId, pet) {
  const cache = await readCache(userId);

  if (!cache) {
    return;
  }

  const pets = Array.isArray(cache.pets) ? cache.pets : [];

  const existingIndex = pets.findIndex(
    (item) => item.id === pet.id || item.petId === pet.petId,
  );

  if (existingIndex >= 0) {
    pets[existingIndex] = {
      ...pets[existingIndex],
      ...pet,
    };
  } else {
    pets.push(pet);
  }

  await writeCache(userId, {
    profile: cache.profile || null,
    pets,
  });
}

export async function updateCachedPet(userId, petId, petData) {
  const cache = await readCache(userId);

  const pets = Array.isArray(cache?.pets) ? cache.pets : [];

  let found = false;
  const updatedPets = pets.map((pet) => {
    if (pet.id === petId || pet.petId === petId) {
      found = true;
      return {
        ...pet,
        ...petData,
        id: pet.id || petId,
        petId: pet.petId || petId,
      };
    }

    return pet;
  });

  if (!found) {
    updatedPets.push({
      ...petData,
      id: petData.id || petId,
      petId: petData.petId || petId,
    });
  }

  await writeCache(userId, {
    profile: cache?.profile || null,
    pets: updatedPets,
  });
}

export async function removeCachedPet(userId, petId) {
  const cache = await readCache(userId);

  if (!cache) {
    return;
  }

  const pets = Array.isArray(cache.pets) ? cache.pets : [];

  const updatedPets = pets.filter(
    (pet) => pet.id !== petId && pet.petId !== petId,
  );

  await writeCache(userId, {
    profile: cache.profile || null,
    pets: updatedPets,
  });
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
