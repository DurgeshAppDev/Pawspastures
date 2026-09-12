import "./global.css";
import React, { useEffect, useState } from "react";

import { View, ActivityIndicator } from "react-native";

import { NavigationContainer } from "@react-navigation/native";

import { onAuthStateChanged } from "firebase/auth";

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

  if (checkingAuth) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
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
