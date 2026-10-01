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

// GOOGLE CONFIGURATION
if (Platform.OS !== "web") {
  GoogleSignin.configure({
    webClientId:
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,

    iosClientId:
      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,

    offlineAccess: false,
  });
}

// REGISTER USER
export const registerUser = async (
  name,
  email,
  password
) => {
  const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  const user = userCredential.user;

  await updateProfile(user, {
    displayName: name,
  });

  return user;
};

// LOGIN USER
export const loginUser = async (
  email,
  password
) => {
  const userCredential =
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  return userCredential.user;
};

// GOOGLE LOGIN
export const loginWithGoogle = async () => {
  try {
    if (Platform.OS === "web") {
      const provider =
        new GoogleAuthProvider();

      const userCredential =
        await signInWithPopup(
          auth,
          provider
        );

      return userCredential.user;
    }

    if (Platform.OS === "android") {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
    }

    const response =
      await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) {
      throw {
        code: "SIGN_IN_CANCELLED",
        message:
          "Google sign-in was cancelled.",
      };
    }

    const idToken =
      response.data?.idToken;

    if (!idToken) {
      throw new Error(
        "Google did not return an ID token."
      );
    }

    const googleCredential =
      GoogleAuthProvider.credential(
        idToken
      );

    const userCredential =
      await signInWithCredential(
        auth,
        googleCredential
      );

    return userCredential.user;

  } catch (error) {
    if (isErrorWithCode(error)) {
      if (
        error.code ===
        statusCodes.SIGN_IN_CANCELLED
      ) {
        throw {
          code: "SIGN_IN_CANCELLED",
          message:
            "Google sign-in was cancelled.",
        };
      }

      if (
        error.code ===
        statusCodes.IN_PROGRESS
      ) {
        throw {
          code: "GOOGLE_SIGN_IN_IN_PROGRESS",
          message:
            "Google sign-in is already in progress.",
        };
      }

      if (
        error.code ===
        statusCodes.PLAY_SERVICES_NOT_AVAILABLE
      ) {
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
    const isAvailable =
      await AppleAuthentication.isAvailableAsync();

    if (!isAvailable) {
      throw {
        code: "apple-not-available",
        message:
          "Apple Sign-In is not available on this device.",
      };
    }

    const credential =
      await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication
            .AppleAuthenticationScope
            .FULL_NAME,

          AppleAuthentication
            .AppleAuthenticationScope
            .EMAIL,
        ],
      });

    if (!credential.identityToken) {
      throw {
        code: "apple-no-token",
        message:
          "Apple did not return an identity token.",
      };
    }

    const provider =
      new OAuthProvider("apple.com");

    const appleCredential =
      provider.credential({
        idToken:
          credential.identityToken,
      });

    const userCredential =
      await signInWithCredential(
        auth,
        appleCredential
      );

    return userCredential.user;

  } catch (error) {
    if (
      error?.code ===
      "ERR_REQUEST_CANCELED"
    ) {
      throw {
        code:
          "auth/cancelled-popup-request",
        message:
          "Apple sign-in cancelled.",
      };
    }

    throw error;
  }
};

// PASSWORD RESET
export const resetPassword = async (
  email
) => {
  await sendPasswordResetEmail(
    auth,
    email
  );
};

// LOGOUT
// LOGOUT
export const logoutUser = async () => {
  if (!auth.currentUser) {
    return;
  }

  await signOut(auth);
};