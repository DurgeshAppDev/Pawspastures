import React, { useEffect, useState } from "react";

import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import * as Notifications from "expo-notifications";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

import { colors } from "../../src/theme";

import {
  requestNotificationPermission,
  requestCameraPermission,
  requestMicrophonePermission,
  requestGalleryPermission,
} from "../../src/services/permissions";

/**
 * =========================================================
 * SETTINGS SCREEN
 * =========================================================
 */
export default function SettingsScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const [cameraEnabled, setCameraEnabled] = useState(false);

  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);

  const [mediaEnabled, setMediaEnabled] = useState(false);

  const [darkMode, setDarkMode] = useState(true);

  const [autoPlayVideos, setAutoPlayVideos] = useState(true);

  /**
   * ---------------------------------------------------------
   * LOAD PERMISSION STATES
   * ---------------------------------------------------------
   */
  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      if (Platform.OS === "web") {
        return;
      }

      const notification = await Notifications.getPermissionsAsync();

      const camera = await Camera.getCameraPermissionsAsync();

      const microphone = await Camera.getMicrophonePermissionsAsync();

      const media = await ImagePicker.getMediaLibraryPermissionsAsync();

      setNotificationsEnabled(notification.granted);
      setCameraEnabled(camera.granted);
      setMicrophoneEnabled(microphone.granted);
      setMediaEnabled(media.granted);
    } catch (error) {
      console.log("Settings permission load error:", error);
    }
  };

  /**
   * ---------------------------------------------------------
   * NOTIFICATION
   * ---------------------------------------------------------
   */
  const handleNotificationToggle = async (value) => {
    if (!value) {
      Alert.alert(
        "Disable Notifications",
        "To completely disable notifications, change the notification permission from your device settings.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Open Settings",
            onPress: () => {
              if (Platform.OS !== "web") {
                Linking.openSettings();
              }
            },
          },
        ],
      );

      return;
    }

    const allowed = await requestNotificationPermission();

    setNotificationsEnabled(allowed);

    if (!allowed) {
      showPermissionSettingsAlert("notifications");
    }
  };

  /**
   * ---------------------------------------------------------
   * CAMERA
   * ---------------------------------------------------------
   */
  const handleCameraToggle = async (value) => {
    if (!value) {
      Alert.alert(
        "Disable Camera",
        "Camera permission must be disabled from your device settings.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Open Settings",
            onPress: () => {
              Linking.openSettings();
            },
          },
        ],
      );

      return;
    }

    const allowed = await requestCameraPermission();

    setCameraEnabled(allowed);

    if (!allowed) {
      showPermissionSettingsAlert("camera");
    }
  };

  /**
   * ---------------------------------------------------------
   * MICROPHONE
   * ---------------------------------------------------------
   */
  const handleMicrophoneToggle = async (value) => {
    if (!value) {
      Alert.alert(
        "Disable Microphone",
        "Microphone permission must be disabled from your device settings.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Open Settings",
            onPress: () => {
              Linking.openSettings();
            },
          },
        ],
      );

      return;
    }

    const allowed = await requestMicrophonePermission();

    setMicrophoneEnabled(allowed);

    if (!allowed) {
      showPermissionSettingsAlert("microphone");
    }
  };

  /**
   * ---------------------------------------------------------
   * MEDIA
   * ---------------------------------------------------------
   */
  const handleMediaToggle = async (value) => {
    if (!value) {
      Alert.alert(
        "Disable Photos & Media",
        "Photos and media permission must be disabled from your device settings.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Open Settings",
            onPress: () => {
              Linking.openSettings();
            },
          },
        ],
      );

      return;
    }

    const allowed = await requestGalleryPermission();

    setMediaEnabled(allowed);

    if (!allowed) {
      showPermissionSettingsAlert("photos and media");
    }
  };

  /**
   * ---------------------------------------------------------
   * PERMISSION SETTINGS ALERT
   * ---------------------------------------------------------
   */
  const showPermissionSettingsAlert = (permission) => {
    Alert.alert(
      "Permission Required",
      `Paws & Pastures needs ${permission} permission for this feature.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Open Settings",
          onPress: () => {
            Linking.openSettings();
          },
        },
      ],
    );
  };

  /**
   * ---------------------------------------------------------
   * LOGOUT
   * ---------------------------------------------------------
   */
  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            /**
             * Firebase logout will be connected here.
             *
             * Example:
             *
             * await signOut(auth);
             *
             * Your App.js auth listener should then
             * automatically show AuthLayout.
             */

            console.log("User logout requested.");
          } catch (error) {
            console.log("Logout error:", error);

            Alert.alert(
              "Logout Failed",
              "Something went wrong while logging out.",
            );
          }
        },
      },
    ]);
  };

  /**
   * ---------------------------------------------------------
   * DELETE ACCOUNT
   * ---------------------------------------------------------
   */
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action will permanently delete your Paws & Pastures account and associated account data. This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => {
            /**
             * Firebase account deletion will be
             * connected here.
             *
             * Usually:
             *
             * await deleteUser(auth.currentUser);
             *
             * Firestore user data should also be
             * handled according to your backend rules.
             */

            console.log("Account deletion requested.");

            Alert.alert(
              "Delete Account",
              "Account deletion will be connected to Firebase here.",
            );
          },
        },
      ],
    );
  };

  /**
   * ---------------------------------------------------------
   * SIMPLE ROW
   * ---------------------------------------------------------
   */
  const SettingRow = ({
    icon,
    title,
    subtitle,
    onPress,
    danger = false,
    right,
  }) => {
    return (
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        className="flex-row items-center px-4 py-4"
      >
        <View
          className="mr-4 h-11 w-11 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: danger
              ? colors["surface-icon"]
              : colors["surface-elevated"],
          }}
        >
          <Ionicons
            name={icon}
            size={22}
            color={danger ? colors.primary : colors["text-primary"]}
          />
        </View>

        <View className="flex-1">
          <Text
            className="text-[16px] font-semibold"
            style={{
              color: danger ? colors.primary : colors["text-primary"],
            }}
          >
            {title}
          </Text>

          {subtitle ? (
            <Text
              className="mt-1 text-[13px]"
              style={{
                color: colors["text-secondary"],
              }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {right}

        {!right && onPress ? (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors["icon-muted"]}
          />
        ) : null}
      </Pressable>
    );
  };

  /**
   * ---------------------------------------------------------
   * SWITCH ROW
   * ---------------------------------------------------------
   */
  const PermissionRow = ({ icon, title, subtitle, value, onValueChange }) => {
    return (
      <View className="flex-row items-center px-4 py-4">
        <View
          className="mr-4 h-11 w-11 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: colors["surface-elevated"],
          }}
        >
          <Ionicons name={icon} size={22} color={colors["text-primary"]} />
        </View>

        <View className="flex-1">
          <Text
            className="text-[16px] font-semibold"
            style={{
              color: colors["text-primary"],
            }}
          >
            {title}
          </Text>

          <Text
            className="mt-1 text-[13px]"
            style={{
              color: colors["text-secondary"],
            }}
          >
            {subtitle}
          </Text>
        </View>

        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{
            false: colors.border,
            true: colors.primary,
          }}
          thumbColor={colors.white}
          ios_backgroundColor={colors.border}
        />
      </View>
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top", "bottom"]}
      style={{
        backgroundColor: colors.background,
      }}
    >
      {/* ===================================================
          HEADER
          =================================================== */}
      <View
        className="flex-row items-center px-5 pb-4 pt-2"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: colors["border-subtle"],
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          className="mr-4 h-11 w-11 items-center justify-center rounded-full"
          style={{
            backgroundColor: colors["surface-elevated"],
          }}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={colors["text-primary"]}
          />
        </Pressable>

        <View>
          <Text
            className="text-[24px] font-bold"
            style={{
              color: colors["text-primary"],
            }}
          >
            Settings
          </Text>

          <Text
            className="mt-1 text-[13px]"
            style={{
              color: colors["text-secondary"],
            }}
          >
            Manage your account and preferences
          </Text>
        </View>
      </View>

      {/* ===================================================
          CONTENT
          =================================================== */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 35,
        }}
      >
        {/* =================================================
            ACCOUNT
            ================================================= */}
        <Text
          className="px-5 pb-2 pt-6 text-[13px] font-bold uppercase"
          style={{
            color: colors.primary,
          }}
        >
          Account
        </Text>

        <View
          className="mx-4 overflow-hidden rounded-2xl"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors["border-subtle"],
          }}
        >
          <SettingRow
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update your profile and pet information"
            onPress={() => {
              Alert.alert(
                "Edit Profile",
                "Profile editing screen will be connected here.",
              );
            }}
          />

          <View
            className="mx-4 h-px"
            style={{
              backgroundColor: colors["border-subtle"],
            }}
          />

          <SettingRow
            icon="lock-closed-outline"
            title="Change Password"
            subtitle="Update your account password"
            onPress={() => {
              Alert.alert(
                "Change Password",
                "Password change screen will be connected here.",
              );
            }}
          />
        </View>

        {/* =================================================
            PERMISSIONS
            ================================================= */}
        <Text
          className="px-5 pb-2 pt-7 text-[13px] font-bold uppercase"
          style={{
            color: colors.primary,
          }}
        >
          Permissions
        </Text>

        <View
          className="mx-4 overflow-hidden rounded-2xl"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors["border-subtle"],
          }}
        >
          <PermissionRow
            icon="notifications-outline"
            title="Notifications"
            subtitle="Receive story and activity notifications"
            value={notificationsEnabled}
            onValueChange={handleNotificationToggle}
          />

          <View
            className="mx-4 h-px"
            style={{
              backgroundColor: colors["border-subtle"],
            }}
          />

          <PermissionRow
            icon="camera-outline"
            title="Camera"
            subtitle="Allow camera access for photos and videos"
            value={cameraEnabled}
            onValueChange={handleCameraToggle}
          />

          <View
            className="mx-4 h-px"
            style={{
              backgroundColor: colors["border-subtle"],
            }}
          />

          <PermissionRow
            icon="mic-outline"
            title="Microphone"
            subtitle="Allow microphone access for video recording"
            value={microphoneEnabled}
            onValueChange={handleMicrophoneToggle}
          />

          <View
            className="mx-4 h-px"
            style={{
              backgroundColor: colors["border-subtle"],
            }}
          />

          <PermissionRow
            icon="images-outline"
            title="Photos & Media"
            subtitle="Allow access to photos and videos"
            value={mediaEnabled}
            onValueChange={handleMediaToggle}
          />
        </View>

        {/* =================================================
            PREFERENCES
            ================================================= */}
        <Text
          className="px-5 pb-2 pt-7 text-[13px] font-bold uppercase"
          style={{
            color: colors.primary,
          }}
        >
          Preferences
        </Text>

        <View
          className="mx-4 overflow-hidden rounded-2xl"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors["border-subtle"],
          }}
        >
          <PermissionRow
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Use the dark Paws & Pastures appearance"
            value={darkMode}
            onValueChange={setDarkMode}
          />

          <View
            className="mx-4 h-px"
            style={{
              backgroundColor: colors["border-subtle"],
            }}
          />

          <PermissionRow
            icon="play-circle-outline"
            title="Auto-play Videos"
            subtitle="Automatically play videos while browsing"
            value={autoPlayVideos}
            onValueChange={setAutoPlayVideos}
          />
        </View>

        {/* =================================================
            ABOUT
            ================================================= */}
        <Text
          className="px-5 pb-2 pt-7 text-[13px] font-bold uppercase"
          style={{
            color: colors.primary,
          }}
        >
          About
        </Text>

        <View
          className="mx-4 overflow-hidden rounded-2xl"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors["border-subtle"],
          }}
        >
          <SettingRow
            icon="paw-outline"
            title="About Paws & Pastures"
            subtitle="Learn more about our app"
            onPress={() => {
              Alert.alert(
                "Paws & Pastures",
                "A social community where pets bring people together.",
              );
            }}
          />

          <View
            className="mx-4 h-px"
            style={{
              backgroundColor: colors["border-subtle"],
            }}
          />

          <SettingRow
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            subtitle="Learn how your information is handled"
            onPress={() => {
              Alert.alert(
                "Privacy Policy",
                "Privacy Policy page will be connected here.",
              );
            }}
          />

          <View
            className="mx-4 h-px"
            style={{
              backgroundColor: colors["border-subtle"],
            }}
          />

          <SettingRow
            icon="document-text-outline"
            title="Terms & Conditions"
            subtitle="Review the terms of using Paws & Pastures"
            onPress={() => {
              Alert.alert(
                "Terms & Conditions",
                "Terms and Conditions page will be connected here.",
              );
            }}
          />
        </View>

        {/* =================================================
            SUPPORT
            ================================================= */}
        <Text
          className="px-5 pb-2 pt-7 text-[13px] font-bold uppercase"
          style={{
            color: colors.primary,
          }}
        >
          Support
        </Text>

        <View
          className="mx-4 overflow-hidden rounded-2xl"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors["border-subtle"],
          }}
        >
          <SettingRow
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help with your account"
            onPress={() => {
              Alert.alert(
                "Help & Support",
                "Support center will be connected here.",
              );
            }}
          />

          <View
            className="mx-4 h-px"
            style={{
              backgroundColor: colors["border-subtle"],
            }}
          />

          <SettingRow
            icon="flag-outline"
            title="Report a Problem"
            subtitle="Tell us about an issue"
            onPress={() => {
              Alert.alert(
                "Report a Problem",
                "Problem reporting will be connected here.",
              );
            }}
          />
        </View>

        {/* =================================================
            LOGOUT
            ================================================= */}
        <View className="mx-4 mt-8">
          <Pressable
            onPress={handleLogout}
            className="h-[54px] flex-row items-center justify-center rounded-2xl"
            style={{
              backgroundColor: colors["surface-elevated"],
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.primary} />

            <Text
              className="ml-3 text-[16px] font-bold"
              style={{
                color: colors.primary,
              }}
            >
              Log Out
            </Text>
          </Pressable>
        </View>

        {/* =================================================
            DELETE ACCOUNT
            ================================================= */}
        <Pressable
          onPress={handleDeleteAccount}
          className="mt-5 items-center px-5"
        >
          <Text
            className="text-[14px] font-semibold"
            style={{
              color: colors["text-muted"],
            }}
          >
            Delete Account
          </Text>
        </Pressable>

        {/* =================================================
            VERSION
            ================================================= */}
        <Text
          className="mt-5 text-center text-[12px]"
          style={{
            color: colors["text-placeholder"],
          }}
        >
          Paws & Pastures
        </Text>

        <Text
          className="mt-1 text-center text-[11px]"
          style={{
            color: colors["text-placeholder"],
          }}
        >
          Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
