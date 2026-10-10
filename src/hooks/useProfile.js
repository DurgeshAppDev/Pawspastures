import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { auth } from "../config/firebase";

import {
  ensurePublicProfile,
  getPublicUserProfile,
  getUserProfileData,
} from "../services/ProfileServices";
import { getCachedProfile } from "../services/profileCache";

export default function useProfile(userIdOverride, { publicProfile = false } = {}) {
  const [profile, setProfile] = useState(null);
  const [pets, setPets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    const userId = publicProfile
      ? userIdOverride
      : userIdOverride || auth.currentUser?.uid;

    if (!userId) {
      setProfile(null);
      setPets([]);
      setError(null);
      setRefreshing(false);
      return;
    }

    try {
      setError(null);

      if (publicProfile) {
        setRefreshing(true);
        const publicData = await getPublicUserProfile(userId);
        setProfile(publicData?.profile || null);
        setPets(publicData?.pets || []);
        return;
      }

      const cached = await getCachedProfile(userId);

      if (cached) {
        setProfile(cached.profile || null);
        setPets(Array.isArray(cached.pets) ? cached.pets : []);
      }

      if (!cached) {
        setRefreshing(true);
      }

      if (cached?.profile && Array.isArray(cached.pets)) {
        setRefreshing(false);
        return;
      }

      setRefreshing(true);
      const profileData = await getUserProfileData(userId);
      setProfile(profileData.profile);
      setPets(profileData.pets);
    } catch (err) {
      console.error("Profile loading error:", err);

      setError(err?.message || "Unable to load your profile.");
    } finally {
      setRefreshing(false);
    }
  }, [publicProfile, userIdOverride]);

  useEffect(() => {
    if (publicProfile) return;
    const userId = userIdOverride || auth.currentUser?.uid;
    ensurePublicProfile(userId).catch((publishError) => {
      console.warn("Unable to publish profile for visitors:", publishError);
    });
  }, [publicProfile, userIdOverride]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  return {
    profile,
    pets,
    refreshing,
    error,
  };
}
