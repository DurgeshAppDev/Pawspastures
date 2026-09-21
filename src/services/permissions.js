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
 * OPEN STORY CAMERA SAFELY
 *
 * Story-specific camera.
 * Video maximum = 15 seconds.
 * ---------------------------------------------------------
 */
export const openStoryCamera = async () => {
  try {
    const cameraAllowed = await requestCameraPermission();

    if (!cameraAllowed) {
      console.log("Story camera permission denied.");
      return null;
    }

    const microphoneAllowed = await requestMicrophonePermission();

    if (!microphoneAllowed) {
      console.log("Story microphone permission denied.");
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: false,
      quality: 1,

      // Story videos only
      videoMaxDuration: 15,
    });

    if (result.canceled) {
      return null;
    }

    return result;
  } catch (error) {
    console.log("Story camera error:", error);
    return null;
  }
};


/**
 * ---------------------------------------------------------
 * OPEN STORY GALLERY SAFELY
 *
 * Story-specific gallery.
 * Gallery videos longer than 15 seconds are rejected.
 * ---------------------------------------------------------
 */
export const openStoryGallery = async () => {
  try {
    const allowed = await requestGalleryPermission();

    if (!allowed) {
      console.log("Story gallery permission denied.");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: false,
      quality: 1,
      selectionLimit: 1,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets?.[0];

    if (!asset) {
      return null;
    }

    // Only Story videos have the 15-second restriction.
    if (
      asset.type === "video" &&
      asset.duration &&
      asset.duration > 15000
    ) {
      console.log(
        "Selected Story video is longer than 15 seconds."
      );

      return {
        ...result,
        storyVideoTooLong: true,
      };
    }

    return result;
  } catch (error) {
    console.log("Story gallery error:", error);
    return null;
  }
};