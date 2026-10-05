import { useCallback, useEffect, useState } from "react";

import { auth } from "../config/firebase";

import { getUserPets, getUserProfile } from "../services/ProfileServices";

import { getCachedProfile, saveCachedProfile } from "../services/profileCache";

export default function useProfile() {
  const [profile, setProfile] = useState(null);
  const [pets, setPets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      setProfile(null);
      setPets([]);
      setError(null);
      setRefreshing(false);
      return;
    }

    try {
      setError(null);

      const cached = await getCachedProfile(userId);

      if (cached) {
        setProfile(cached.profile || null);
        setPets(Array.isArray(cached.pets) ? cached.pets : []);
      }

      if (!cached) {
        setRefreshing(true);
      }

      const [firebaseProfile, firebasePets] = await Promise.all([
        getUserProfile(userId),
        getUserPets(userId),
      ]);

      setProfile(firebaseProfile);
      setPets(firebasePets);

      await saveCachedProfile(userId, firebaseProfile, firebasePets);
    } catch (err) {
      console.error("Profile loading error:", err);

      setError(err?.message || "Unable to load your profile.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    pets,
    refreshing,
    error,
    refreshProfile: loadProfile,
  };
}
