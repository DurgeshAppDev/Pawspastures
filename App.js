import "./global.css";
import React, { useEffect, useState } from "react";

import {
  View,
  ActivityIndicator,
  Platform,
} from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import * as Notifications from "expo-notifications";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

import { auth } from "./src/config/firebase";
import AuthLayout from "./app/auth/AuthLayout";
import MainLayout from "./app/main/MainLayout";

import { colors } from "./src/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!checkingAuth) {
      requestPermissions();
    }
  }, [checkingAuth]);

  const requestPermissions = async () => {
    try {
      // Native permissions are not requested on Web
      if (Platform.OS === "web") {
        return;
      }

      // =========================
      // NOTIFICATION PERMISSION
      // =========================
      const notification =
        await Notifications.getPermissionsAsync();

      if (
        !notification.granted &&
        notification.canAskAgain
      ) {
        const result =
          await Notifications.requestPermissionsAsync();

        console.log(
          "Notification permission:",
          result.status
        );
      }

      // =========================
      // CAMERA PERMISSION
      // =========================
      const camera =
        await Camera.getCameraPermissionsAsync();

      if (
        !camera.granted &&
        camera.canAskAgain
      ) {
        const result =
          await Camera.requestCameraPermissionsAsync();

        console.log(
          "Camera permission:",
          result.status
        );
      }

      // =========================
      // PHOTO / MEDIA PERMISSION
      // =========================
      const media =
        await ImagePicker.getMediaLibraryPermissionsAsync();

      if (
        !media.granted &&
        media.canAskAgain
      ) {
        const result =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        console.log(
          "Media permission:",
          result.status
        );
      }
    } catch (error) {
      console.log("Permission error:", error);
    }
  };

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

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {user ? <MainLayout /> : <AuthLayout />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}