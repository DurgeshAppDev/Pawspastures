import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithCredential,
    OAuthProvider,
} from "firebase/auth";

import{
GoogleSignin,
isSuccessResponse,
isErrorWithCode,
statusCodes,
} from "@react-native-google-signin/google-signin";

import * as AppleAuthentication from "expo-apple-authentication";

import{auth} from "../../src/config/firebase";

//    Register user

export const registerUser = async (email,password) => {
    const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );
    return userCredential.user;
}

// login user
export const loginUser = async (email,password) => {
    const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

    return userCredential.user;
}

GoogleSignin.configure({
  webClientId:
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

// login with google

export const loginWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) {
      throw new Error("Google sign-in was cancelled.");
    }

    const { idToken } = response.data;

    if (!idToken) {
      throw new Error("Google did not return an ID token.");
    }

    const googleCredential =
      GoogleAuthProvider.credential(idToken);

    const userCredential =
      await signInWithCredential(
        auth,
        googleCredential
      );

    return userCredential.user;
  } catch (error) {
    console.log("Google Sign-In Error:", error);

    if (
      isErrorWithCode(error) &&
      error.code === statusCodes.SIGN_IN_CANCELLED
    ) {
      throw {
        code: "auth/cancelled-popup-request",
        message: "Google sign-in cancelled.",
      };
    }

    throw error;
  }
};

//    Apple login

export const loginWithApple = async ()=>{
 try {
    // Check whether Apple Authentication is available
    const isAvailable =
      await AppleAuthentication.isAvailableAsync();

    if (!isAvailable) {
      throw {
        code: "apple-not-available",
        message: "Apple Sign-In is not available on this device.",
      };
    }

    // Ask Apple for authentication
    const credential =
      await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

    // Apple must return an identity token
    if (!credential.identityToken) {
      throw {
        code: "apple-no-token",
        message: "Apple did not return an identity token.",
      };
    }

    // Firebase Apple OAuth provider
    const provider = new OAuthProvider("apple.com");

    const appleCredential = provider.credential({
      idToken: credential.identityToken,
    });

    // Sign into Firebase
    const userCredential = await signInWithCredential(
      auth,
      appleCredential
    );

    return userCredential.user;
  } catch (error) {
    console.log("Apple Sign-In Error:", error);

    // User cancelled Apple login
    if (error?.code === "ERR_REQUEST_CANCELED") {
      throw {
        code: "auth/cancelled-popup-request",
        message: "Apple sign-in cancelled.",
      };
    }

    throw error;
 };
};

 // logout user
export const logoutUser = async ()=>{
    await signOut(auth);
};