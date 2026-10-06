import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  OAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import * as AppleAuthentication from "expo-apple-authentication";

import { Platform } from "react-native";

import { auth } from "../config/firebase";
import { createUserProfile } from "./userServices";

// GOOGLE CONFIGURATION

if (Platform.OS !== "web") {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    offlineAccess: false,
  });
}

// ENSURE FIRESTORE USER PROFILE

const ensureUserProfile = async (user, authProvider) => {
  if (!user?.uid) {
    throw new Error("Authenticated user is missing a UID.");
  }

  return await createUserProfile(
    user.uid,
    user.displayName || "",
    user.email || "",
    authProvider,
  );
};

// EMAIL / PASSWORD REGISTER

export const registerUser = async (name, email, password) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  const user = userCredential.user;

  await updateProfile(user, {
    displayName: name,
  });

  await ensureUserProfile(user, "password");

  return user;
};

// EMAIL / PASSWORD LOGIN

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  return userCredential.user;
};

// GOOGLE LOGIN

export const loginWithGoogle = async () => {
  try {
    if (Platform.OS === "web") {
      console.log("GOOGLE 1: Starting");

      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      console.log("GOOGLE 2: Opening popup");

      const userCredential = await signInWithPopup(
        auth,
        provider,
      );

      const user = userCredential.user;

      console.log(
        "GOOGLE 3: Firebase login successful",
        user.uid,
        user.email,
      );

      await ensureUserProfile(user, "google.com");

      console.log("GOOGLE 4: Firestore profile ensured");

      return user;
    }

    if (Platform.OS === "android") {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
    }

    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) {
      throw {
        code: "SIGN_IN_CANCELLED",
        message: "Google sign-in was cancelled.",
      };
    }

    const idToken = response.data?.idToken;

    if (!idToken) {
      throw {
        code: "GOOGLE_NO_ID_TOKEN",
        message: "Google did not return an ID token.",
      };
    }

    const credential = GoogleAuthProvider.credential(idToken);

    const userCredential = await signInWithCredential(
      auth,
      credential,
    );

    const user = userCredential.user;

    await ensureUserProfile(user, "google.com");

    console.log("GOOGLE 4: Firestore profile ensured");

    return user;
  } catch (error) {
    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw {
          code: "SIGN_IN_CANCELLED",
          message: "Google sign-in was cancelled.",
        };
      }

      if (error.code === statusCodes.IN_PROGRESS) {
        throw {
          code: "GOOGLE_SIGN_IN_IN_PROGRESS",
          message: "Google sign-in is already in progress.",
        };
      }

      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw {
          code: "PLAY_SERVICES_NOT_AVAILABLE",
          message:
            "Google Play Services are unavailable or need to be updated.",
        };
      }
    }

    throw error;
  }
};

// APPLE LOGIN

export const loginWithApple = async () => {
  try {
    if (Platform.OS !== "ios") {
      throw {
        code: "APPLE_IOS_ONLY",
        message: "Apple Sign-In is available on iOS.",
      };
    }

    const available =
      await AppleAuthentication.isAvailableAsync();

    if (!available) {
      throw {
        code: "APPLE_NOT_AVAILABLE",
        message:
          "Apple Sign-In is not available on this device.",
      };
    }

    const credential =
      await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

    if (!credential.identityToken) {
      throw {
        code: "APPLE_NO_TOKEN",
        message:
          "Apple did not return an identity token.",
      };
    }

    const provider = new OAuthProvider("apple.com");

    const appleCredential = provider.credential({
      idToken: credential.identityToken,
    });

    const userCredential = await signInWithCredential(
      auth,
      appleCredential,
    );

    const user = userCredential.user;

    await ensureUserProfile(user, "apple.com");

    console.log("APPLE: Firestore profile ensured");

    return user;
  } catch (error) {
    if (error?.code === "ERR_REQUEST_CANCELED") {
      throw {
        code: "SIGN_IN_CANCELLED",
        message: "Apple sign-in was cancelled.",
      };
    }

    throw error;
  }
};

// RESET PASSWORD

export const resetPassword = async (email) => {
  if (!email?.trim()) {
    throw new Error("Email address is required.");
  }

  await sendPasswordResetEmail(
    auth,
    email.trim().toLowerCase(),
  );
};

// LOGOUT

export const logoutUser = async () => {
  await signOut(auth);
};