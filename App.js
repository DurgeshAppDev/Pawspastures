import "./global.css";

import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  Text,
  View,
} from "react-native";

import { NavigationContainer } from "@react-navigation/native";

import { onAuthStateChanged, signOut } from "firebase/auth";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { auth } from "./src/config/firebase";

import { getUserProfile } from "./src/services/userServices";


import AuthLayout from "./app/auth/AuthLayout";
import OnboardingLayout from "./app/onboarding/OnboardingLayout";
import MainLayout from "./app/main/MainLayout";

import { colors } from "./src/theme";

const MAX_PROFILE_ATTEMPTS = 5;
const PROFILE_RETRY_DELAY = 300;

const wait = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const getProfileWithRetry = async (uid) => {
  for (let attempt = 1; attempt <= MAX_PROFILE_ATTEMPTS; attempt++) {
    const profile = await getUserProfile(uid);

    console.log(
      `FIRESTORE PROFILE ATTEMPT ${attempt}:`,
      profile,
    );

    if (profile) {
      return profile;
    }

    if (attempt < MAX_PROFILE_ATTEMPTS) {
      await wait(PROFILE_RETRY_DELAY);
    }
  }

  return null;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const requestIdRef = useRef(0);

  const loadUserProfile = useCallback(async (currentUser) => {
    if (!currentUser?.uid) {
      return;
    }

    const requestId = ++requestIdRef.current;

    setCheckingAuth(true);
    setProfileError(null);
    setOnboardingCompleted(null);

    try {
      const profile = await getProfileWithRetry(
        currentUser.uid,
      );

      if (requestId !== requestIdRef.current) {
        return;
      }

      console.log("FIRESTORE PROFILE:", profile);

      if (!profile) {
        await signOut(auth);
        return;
      }

      setUser(currentUser);
      setOnboardingCompleted(
        profile.onboardingCompleted === true,
      );
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.error(
        "Failed to load user profile:",
        error,
      );

      setProfileError(error);
    } finally {
      if (requestId === requestIdRef.current) {
        setCheckingAuth(false);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        console.log(
          "AUTH STATE:",
          currentUser
            ? {
                uid: currentUser.uid,
                email: currentUser.email,
              }
            : null,
        );

        const requestId = ++requestIdRef.current;

        if (!currentUser) {
          setUser(null);
          setOnboardingCompleted(null);
          setProfileError(null);
          setCheckingAuth(false);
          return;
        }

        setUser(currentUser);
        setCheckingAuth(true);
        setProfileError(null);
        setOnboardingCompleted(null);

        try {
          const profile = await getProfileWithRetry(
            currentUser.uid,
          );

          console.log(
            "FIRESTORE PROFILE:",
            profile,
          );

          if (requestId !== requestIdRef.current) {
            return;
          }

          if (!profile) {
            await signOut(auth);
            return;
          }

          setOnboardingCompleted(
            profile.onboardingCompleted === true,
          );
        } catch (error) {
          if (requestId !== requestIdRef.current) {
            return;
          }

          console.error(
            "Failed to load user profile:",
            error,
          );

          setProfileError(error);
        } finally {
          if (requestId === requestIdRef.current) {
            setCheckingAuth(false);
          }
        }
      },
    );

    return unsubscribe;
  }, []);


  const handleOnboardingComplete = useCallback(() => {
    setProfileError(null);
    setOnboardingCompleted(true);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
        translucent={false}
      />

      {checkingAuth ? (
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        </View>
      ) : profileError && user ? (
        <View className="flex-1 items-center justify-center bg-background px-6">
          <View
            className="w-full rounded-3xl border p-6"
            style={{
              maxWidth: 520,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <Text
              className="text-center text-xl font-bold"
              style={{
                color: colors["text-primary"],
              }}
            >
              We couldn't load your account
            </Text>

            <Text
              className="mt-3 text-center text-sm leading-6"
              style={{
                color: colors["text-secondary"],
              }}
            >
              We couldn't retrieve your account information.
              Please check your internet connection and try
              again.
            </Text>

            <Pressable
              className="mt-6 items-center justify-center rounded-2xl px-5 py-4"
              style={{
                backgroundColor: colors.primary,
              }}
              onPress={() => {
                if (auth.currentUser) {
                  loadUserProfile(auth.currentUser);
                }
              }}
            >
              <Text
                className="font-semibold"
                style={{
                  color: colors.background,
                }}
              >
                Try Again
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <NavigationContainer>
          {!user && <AuthLayout />}

          {user && onboardingCompleted === false && (
            <OnboardingLayout
              onComplete={handleOnboardingComplete}
            />
          )}

          {user && onboardingCompleted === true && (
            <MainLayout />
          )}
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}