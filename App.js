import "./global.css";
import React, { useEffect, useState } from "react";

import {
  View,
  ActivityIndicator,
  Platform,
} from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import {
  requestNotificationPermission,
  requestCameraPermission,
  requestGalleryPermission,
} from "./src/services/permissions";
import { auth } from "./src/config/firebase";

import AuthLayout from "./app/auth/AuthLayout";
import MainLayout from "./app/main/MainLayout";

import { colors } from "./src/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // -----------------------------
  // Firebase authentication
  // -----------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setCheckingAuth(false);
      }
    );

    return unsubscribe;
  }, []);

  // -----------------------------
  // Request  permission
  // -----------------------------


  useEffect(() => {
    if (!checkingAuth) {
      requestStartupPermissions();
    }
  }, [checkingAuth]);
  const requestStartupPermissions = async () => {
  if (Platform.OS === "web") {
    return;
  }

  await requestNotificationPermission();

  await requestCameraPermission();

  await requestGalleryPermission();
};
  // -----------------------------
  // Authentication loading
  // -----------------------------
  if (checkingAuth) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  // -----------------------------
  // App navigation
  // -----------------------------
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {user ? <MainLayout /> : <AuthLayout />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}