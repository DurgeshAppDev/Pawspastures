import "./global.css";

import React, { useEffect, useState } from "react";

import { ActivityIndicator, Platform, StatusBar, View } from "react-native";

import { NavigationContainer } from "@react-navigation/native";

import { onAuthStateChanged } from "firebase/auth";

import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { auth, db } from "./src/config/firebase";

import { requestStartupPermissions } from "./src/services/permissions";

import AuthLayout from "./app/auth/AuthLayout";
import OnboardingLayout from "./app/onboarding/OnboardingLayout";
import MainLayout from "./app/main/MainLayout";

import { colors } from "./src/theme";

export default function App() {
  const [user, setUser] = useState(null);

  const [onboardingCompleted, setOnboardingCompleted] = useState(null);

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let unsubscribeUserDocument = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (unsubscribeUserDocument) {
        unsubscribeUserDocument();
        unsubscribeUserDocument = null;
      }

      /*
       * USER LOGGED OUT
       */

      if (!currentUser) {
        setUser(null);
        setOnboardingCompleted(null);
        setCheckingAuth(false);

        return;
      }

      /*
       * USER LOGGED IN
       */

      setUser(currentUser);
      setOnboardingCompleted(null);
      setCheckingAuth(true);

      const userRef = doc(db, "users", currentUser.uid);

      unsubscribeUserDocument = onSnapshot(
        userRef,

        async (snapshot) => {
          /*
           * NEW USER
           */

          if (!snapshot.exists()) {
            try {
              await setDoc(
                userRef,
                {
                  uid: currentUser.uid,
                  email: currentUser.email || "",
                  displayName: currentUser.displayName || "",
                  photoURL: currentUser.photoURL || "",
                  onboardingCompleted: false,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                },
                {
                  merge: true,
                },
              );
            } catch (error) {
              console.log("Create user profile error:", error);
            }

            setOnboardingCompleted(false);
            setCheckingAuth(false);

            return;
          }

          /*
           * EXISTING USER
           */

          const data = snapshot.data();

          setOnboardingCompleted(data?.onboardingCompleted === true);

          setCheckingAuth(false);
        },

        (error) => {
          console.log("User profile listener error:", error);

          setOnboardingCompleted(false);
          setCheckingAuth(false);
        },
      );
    });

    return () => {
      unsubscribeAuth();

      if (unsubscribeUserDocument) {
        unsubscribeUserDocument();
      }
    };
  }, []);

  /*
   * STARTUP PERMISSIONS
   */

  useEffect(() => {
    if (!checkingAuth && Platform.OS !== "web") {
      requestStartupPermissions();
    }
  }, [checkingAuth]);

  /*
   * GLOBAL LOADING SCREEN
   */

  if (checkingAuth) {
    return (
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background}
          translucent={false}
        />

        <View
          className="flex-1 items-center justify-center"
          style={{
            backgroundColor: colors.background,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      

      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
        translucent={false}
      />

      <NavigationContainer>
        {!user && <AuthLayout />}

        {user && onboardingCompleted === false && <OnboardingLayout />}

        {user && onboardingCompleted === true && <MainLayout />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
