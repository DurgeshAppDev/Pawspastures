import { Platform } from "react-native";

import * as Notifications from "expo-notifications";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

/**
 * ---------------------------------------------------------
 * NOTIFICATIONS
 * ---------------------------------------------------------
 */
export const requestNotificationPermission = async () => {
  try {
    if (Platform.OS === "web") {
      return false;
    }

    const current = await Notifications.getPermissionsAsync();

    console.log("Current notification permission:", current);

    if (current.granted) {
      return true;
    }

    if (!current.canAskAgain) {
      console.log(
        "Notification permission cannot be requested again."
      );
      return false;
    }

    const result = await Notifications.requestPermissionsAsync();

    console.log("Notification permission result:", result);

    return result.granted;
  } catch (error) {
    console.log("Notification permission error:", error);
    return false;
  }
};

/**
 * ---------------------------------------------------------
 * CAMERA
 * ---------------------------------------------------------
 */
export const requestCameraPermission = async () => {
  try {
    if (Platform.OS === "web") {
      return false;
    }

    const current = await Camera.getCameraPermissionsAsync();

    console.log("Current camera permission:", current);

    if (current.granted) {
      return true;
    }

    if (!current.canAskAgain) {
      console.log(
        "Camera permission cannot be requested again."
      );
      return false;
    }

    const result = await Camera.requestCameraPermissionsAsync();

    console.log("Camera permission result:", result);

    return result.granted;
  } catch (error) {
    console.log("Camera permission error:", error);
    return false;
  }
};

/**
 * ---------------------------------------------------------
 * MICROPHONE
 * ---------------------------------------------------------
 */
export const requestMicrophonePermission = async () => {
  try {
    if (Platform.OS === "web") {
      return false;
    }

    const current = await Camera.getMicrophonePermissionsAsync();

    console.log("Current microphone permission:", current);

    if (current.granted) {
      return true;
    }

    if (!current.canAskAgain) {
      console.log(
        "Microphone permission cannot be requested again."
      );
      return false;
    }

    const result = await Camera.requestMicrophonePermissionsAsync();

    console.log("Microphone permission result:", result);

    return result.granted;
  } catch (error) {
    console.log("Microphone permission error:", error);
    return false;
  }
};

/**
 * ---------------------------------------------------------
 * GALLERY / PHOTOS
 * ---------------------------------------------------------
 */
export const requestGalleryPermission = async () => {
  try {
    if (Platform.OS === "web") {
      return false;
    }

    const current =
      await ImagePicker.getMediaLibraryPermissionsAsync();

    console.log("Current gallery permission:", current);

    if (current.granted) {
      return true;
    }

    if (!current.canAskAgain) {
      console.log(
        "Gallery permission cannot be requested again."
      );
      return false;
    }

    const result =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    console.log("Gallery permission result:", result);

    return result.granted;
  } catch (error) {
    console.log("Gallery permission error:", error);
    return false;
  }
};

/**
 * ---------------------------------------------------------
 * STARTUP PERMISSIONS
 *
 * Order:
 * 1. Notifications
 * 2. Camera
 * 3. Microphone
 * 4. Gallery
 * ---------------------------------------------------------
 */
export const requestStartupPermissions = async () => {
  try {
    if (Platform.OS === "web") {
      return;
    }

    console.log("Starting startup permission requests...");

    await requestNotificationPermission();

    await requestCameraPermission();

    await requestMicrophonePermission();

    await requestGalleryPermission();

    console.log("Startup permission requests completed.");
  } catch (error) {
    console.log("Startup permission error:", error);
  }
};

/**
 * ---------------------------------------------------------
 * OPEN CAMERA SAFELY
 *
 * This checks permission AGAIN when camera is actually used.
 * ---------------------------------------------------------
 */
export const openCameraSafely = async () => {
  try {
    const allowed = await requestCameraPermission();

    if (!allowed) {
      console.log(
        "Camera was not opened because permission was denied."
      );
      return null;
    }

    const microphoneAllowed =
      await requestMicrophonePermission();

    if (!microphoneAllowed) {
      console.log(
        "Microphone permission is not available."
      );

      // We don't launch video recording if microphone
      // permission is unavailable.
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled) {
      return null;
    }

    return result;
  } catch (error) {
    console.log("Camera launch error:", error);
    return null;
  }
};

/**
 * ---------------------------------------------------------
 * OPEN GALLERY SAFELY
 *
 * This checks gallery permission AGAIN when gallery
 * is actually used.
 * ---------------------------------------------------------
 */
export const openGallerySafely = async () => {
  try {
    const allowed = await requestGalleryPermission();

    if (!allowed) {
      console.log(
        "Gallery was not opened because permission was denied."
      );
      return null;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsEditing: false,
        quality: 1,
        selectionLimit: 1,
      });

    if (result.canceled) {
      return null;
    }

    return result;
  } catch (error) {
    console.log("Gallery launch error:", error);
    return null;
  }
};