import "./global.css";

import React, { useEffect, useState } from "react";

import { ActivityIndicator, Platform, View } from "react-native";

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
      /**
       * Remove the previous Firestore listener
       * whenever authentication changes.
       */
      if (unsubscribeUserDocument) {
        unsubscribeUserDocument();
        unsubscribeUserDocument = null;
      }

      /**
       * USER LOGGED OUT
       */
      if (!currentUser) {
        setUser(null);
        setOnboardingCompleted(null);
        setCheckingAuth(false);

        return;
      }

      /**
       * USER LOGGED IN
       */
      setUser(currentUser);
      setOnboardingCompleted(null);
      setCheckingAuth(true);

      const userRef = doc(db, "users", currentUser.uid);

   
      unsubscribeUserDocument = onSnapshot(
        userRef,

        async (snapshot) => {
          /**
           * New Firebase user.
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

          /**
           * Existing user.
           */
          const data = snapshot.data();

          setOnboardingCompleted(data?.onboardingCompleted === true);

          setCheckingAuth(false);
        },

        (error) => {
          console.log("User profile listener error:", error);

          /**
           * If the document cannot be read,
           * keep the user in onboarding rather
           * than incorrectly opening the main app.
           */
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

  /**
   * Request application permissions after
   * authentication state has been established.
   *
   * Web does not use native permission APIs.
   */
  useEffect(() => {
    if (!checkingAuth && Platform.OS !== "web") {
      requestStartupPermissions();
    }
  }, [checkingAuth]);

  
  if (checkingAuth) {
    return (
      <SafeAreaProvider>
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
      <NavigationContainer>
        {/** * Logged out */}
        {!user && <AuthLayout />}
       { /** * Logged in but onboarding is incomplete */}
        {user && onboardingCompleted === false && <OnboardingLayout />}
        {/** * Logged in and onboarding is complete */}
        {user && onboardingCompleted === true && <MainLayout />}
      </NavigationContainer>
    </SafeAreaProvider>
  );``
}
