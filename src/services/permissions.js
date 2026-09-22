import { Platform } from "react-native";

import * as Notifications from "expo-notifications";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

/**
 * =========================================================
 * NOTIFICATIONS
 * =========================================================
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
      console.log("Notification permission cannot be requested again.");
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
 * =========================================================
 * CAMERA
 * =========================================================
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
      console.log("Camera permission cannot be requested again.");

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
 * =========================================================
 * MICROPHONE
 * =========================================================
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
      console.log("Microphone permission cannot be requested again.");

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
 * =========================================================
 * GALLERY / PHOTOS
 * =========================================================
 */
export const requestGalleryPermission = async () => {
  try {
    if (Platform.OS === "web") {
      return false;
    }

    const current = await ImagePicker.getMediaLibraryPermissionsAsync();

    console.log("Current gallery permission:", current);

    if (current.granted) {
      return true;
    }

    if (!current.canAskAgain) {
      console.log("Gallery permission cannot be requested again.");

      return false;
    }

    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();

    console.log("Gallery permission result:", result);

    return result.granted;
  } catch (error) {
    console.log("Gallery permission error:", error);

    return false;
  }
};

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

export const openStoryCamera = async () => {
  try {
    /**
     * Camera permission
     */
    const cameraAllowed = await requestCameraPermission();

    if (!cameraAllowed) {
      console.log("Story camera permission denied.");

      return null;
    }

    /**
     * Microphone permission
     *
     * Required for video recording.
     */
    const microphoneAllowed = await requestMicrophonePermission();

    if (!microphoneAllowed) {
      console.log("Story microphone permission denied.");

      return null;
    }

    /**
     * Open native camera.
     */
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,

      allowsEditing: false,

      quality: 1,

      videoMaxDuration: 15,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets?.[0];

    if (!asset) {
      return null;
    }

    /**
     * -----------------------------------------------------
     * PHOTO
     * -----------------------------------------------------
     */
    if (asset.type === "image") {
      console.log("Story camera captured photo.");

      return {
        ...result,

        assets: [
          {
            ...asset,
            type: "image",
          },
        ],
      };
    }

    /**
     * -----------------------------------------------------
     * VIDEO
     * -----------------------------------------------------
     */
    if (asset.type === "video") {
      const duration = asset.duration;

      console.log("Captured story video duration:", duration);

      if (typeof duration === "number" && duration > 15000) {
        console.log("Camera returned a video longer than 15 seconds.");

        return {
          ...result,
          storyVideoTooLong: true,
          assets: [
            {
              ...asset,
              type: "video",
            },
          ],
        };
      }

      console.log("Story camera captured video.");

      return {
        ...result,

        assets: [
          {
            ...asset,
            type: "video",
          },
        ],
      };
    }

    return null;
  } catch (error) {
    console.log("Story camera error:", error);

    return null;
  }
};

/**
=======================================================
 */
export const openStoryGallery = async () => {
  try {
    /**
     * Gallery permission
     */
    const allowed = await requestGalleryPermission();

    if (!allowed) {
      console.log("Story gallery permission denied.");

      return null;
    }

    /**
     * Open native gallery.
     */
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,

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

    /**
     * -----------------------------------------------------
     * PHOTO
     * -----------------------------------------------------
     */
    if (asset.type === "image") {
      console.log("Story gallery selected photo.");

      return {
        ...result,

        assets: [
          {
            ...asset,
            type: "image",
          },
        ],
      };
    }

    if (asset.type === "video") {
      console.log("Story gallery selected video.");

      console.log("Gallery video duration:", asset.duration);

      return {
        ...result,

        assets: [
          {
            ...asset,
            type: "video",
          },
        ],
      };
    }

    return null;
  } catch (error) {
    console.log("Story gallery error:", error);

    return null;
  }
};
