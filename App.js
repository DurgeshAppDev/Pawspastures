import "./global.css";

import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Platform,
  Pressable,
  StatusBar,
  Text,
  View,
} from "react-native";

import { NavigationContainer } from "@react-navigation/native";

import { onAuthStateChanged } from "firebase/auth";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { auth } from "./src/config/firebase";

import { getUserProfile } from "./src/services/userServices";

import { requestStartupPermissions } from "./src/services/permissions";

import AuthLayout from "./app/auth/AuthLayout";
import OnboardingLayout from "./app/onboarding/OnboardingLayout";
import MainLayout from "./app/main/MainLayout";

import { colors } from "./src/theme";

export default function App() {
  const [user, setUser] = useState(null);

  const [onboardingCompleted, setOnboardingCompleted] = useState(null);

  const [checkingAuth, setCheckingAuth] = useState(true);

  const [profileError, setProfileError] = useState(null);

  const requestIdRef = useRef(0);

  const permissionsRequestedRef = useRef(false);

  const loadUserProfile = useCallback(async (currentUser) => {
    const requestId = ++requestIdRef.current;

    if (!currentUser?.uid) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setOnboardingCompleted(null);
      setProfileError(null);
      setCheckingAuth(false);

      return;
    }

    setCheckingAuth(true);
    setProfileError(null);
    setOnboardingCompleted(null);

    try {
      const profile = await getUserProfile(currentUser.uid);

      if (
        requestId !== requestIdRef.current ||
        auth.currentUser?.uid !== currentUser.uid
      ) {
        return;
      }

      if (!profile) {
        setOnboardingCompleted(false);
        return;
      }

      setOnboardingCompleted(profile.onboardingCompleted === true);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.error("Failed to load user profile:", error);

      setProfileError(error);
    } finally {
      if (requestId === requestIdRef.current) {
        setCheckingAuth(false);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        requestIdRef.current += 1;

        setOnboardingCompleted(null);
        setProfileError(null);
        setCheckingAuth(false);

        return;
      }

      await loadUserProfile(currentUser);
    });

    return unsubscribe;
  }, [loadUserProfile]);

  useEffect(() => {
    if (
      !checkingAuth &&
      !profileError &&
      Platform.OS !== "web" &&
      !permissionsRequestedRef.current
    ) {
      permissionsRequestedRef.current = true;

      requestStartupPermissions();
    }
  }, [checkingAuth, profileError]);

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
        <View
          className="flex-1 items-center justify-center"
          style={{
            backgroundColor: colors.background,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : profileError && user ? (
        <View
          className="flex-1 items-center justify-center px-6"
          style={{
            backgroundColor: colors.background,
          }}
        >
          <View
            className="w-full rounded-3xl p-6"
            style={{
              maxWidth: 520,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View className="items-center">
              <View
                className="h-14 w-14 items-center justify-center rounded-full"
                style={{
                  backgroundColor: colors.elevated,
                }}
              >
                <View
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: colors.primary,
                  }}
                />
              </View>

              <Text
                className="mt-5 text-center text-xl font-bold"
                style={{
                  color: colors.text,
                }}
              >
                We couldn't load your account
              </Text>

              <Text
                className="mt-2 text-center text-sm leading-6"
                style={{
                  color: colors.secondary,
                }}
              >
                We couldn't retrieve your account information. Please check your
                internet connection and try again.
              </Text>
            </View>

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
                  color: colors.text,
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
            <OnboardingLayout onComplete={handleOnboardingComplete} />
          )}

          {user && onboardingCompleted === true && <MainLayout />}
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}
