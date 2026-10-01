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
  useWindowDimensions,
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

import { logoutUser } from "../../src/services/AuthServices";

export default function SettingsScreen({ navigation }) {
  const { width } = useWindowDimensions();

  const isWeb = width >= 768;
  const isDesktop = width >= 1100;
  const isWideDesktop = width >= 1400;

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [mediaEnabled, setMediaEnabled] = useState(false);

  const [darkMode, setDarkMode] = useState(true);
  const [autoPlayVideos, setAutoPlayVideos] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      if (Platform.OS === "web") {
        return;
      }

      const notification =
        await Notifications.getPermissionsAsync();

      const camera =
        await Camera.getCameraPermissionsAsync();

      const microphone =
        await Camera.getMicrophonePermissionsAsync();

      const media =
        await ImagePicker.getMediaLibraryPermissionsAsync();

      setNotificationsEnabled(notification.granted);
      setCameraEnabled(camera.granted);
      setMicrophoneEnabled(microphone.granted);
      setMediaEnabled(media.granted);
    } catch (error) {
      console.log("Settings permission load error:", error);
    }
  };

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

    const allowed =
      await requestNotificationPermission();

    setNotificationsEnabled(allowed);

    if (!allowed) {
      showPermissionSettingsAlert("notifications");
    }
  };

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

    const allowed =
      await requestCameraPermission();

    setCameraEnabled(allowed);

    if (!allowed) {
      showPermissionSettingsAlert("camera");
    }
  };

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

    const allowed =
      await requestMicrophonePermission();

    setMicrophoneEnabled(allowed);

    if (!allowed) {
      showPermissionSettingsAlert("microphone");
    }
  };

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

    const allowed =
      await requestGalleryPermission();

    setMediaEnabled(allowed);

    if (!allowed) {
      showPermissionSettingsAlert(
        "photos and media",
      );
    }
  };

const handleLogout = () => {
  Alert.alert(
    "Log Out",
    "Are you sure you want to log out?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await logoutUser();

            console.log(
              "Firebase logout successful.",
            );
          } catch (error) {
            console.log(
              "Firebase logout error:",
              error,
            );

            Alert.alert(
              "Logout Failed",
              error?.message ||
                "Something went wrong while logging out.",
            );
          }
        },
      },
    ],
  );
};

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
            console.log(
              "Account deletion requested.",
            );

            Alert.alert(
              "Delete Account",
              "Account deletion will be connected to Firebase here.",
            );
          },
        },
      ],
    );
  };

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
        className="flex-row items-center"
        style={{
          paddingHorizontal: isDesktop ? 22 : 16,
          paddingVertical: isDesktop ? 17 : 16,
        }}
      >
        <View
          className="items-center justify-center rounded-2xl"
          style={{
            width: isDesktop ? 46 : 44,
            height: isDesktop ? 46 : 44,
            marginRight: isDesktop ? 16 : 14,
            backgroundColor: danger
              ? colors["surface-icon"]
              : colors["surface-elevated"],
          }}
        >
          <Ionicons
            name={icon}
            size={22}
            color={
              danger
                ? colors.primary
                : colors["text-primary"]
            }
          />
        </View>

        <View className="flex-1">
          <Text
            className="font-semibold"
            style={{
              color: danger
                ? colors.primary
                : colors["text-primary"],
              fontSize: isDesktop ? 15 : 16,
            }}
          >
            {title}
          </Text>

          {subtitle ? (
            <Text
              className="mt-1"
              style={{
                color: colors["text-secondary"],
                fontSize: 13,
                lineHeight: 18,
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

  const PermissionRow = ({
    icon,
    title,
    subtitle,
    value,
    onValueChange,
  }) => {
    return (
      <View
        className="flex-row items-center"
        style={{
          paddingHorizontal: isDesktop ? 22 : 16,
          paddingVertical: isDesktop ? 17 : 16,
        }}
      >
        <View
          className="items-center justify-center rounded-2xl"
          style={{
            width: isDesktop ? 46 : 44,
            height: isDesktop ? 46 : 44,
            marginRight: isDesktop ? 16 : 14,
            backgroundColor:
              colors["surface-elevated"],
          }}
        >
          <Ionicons
            name={icon}
            size={22}
            color={colors["text-primary"]}
          />
        </View>

        <View className="flex-1">
          <Text
            className="font-semibold"
            style={{
              color: colors["text-primary"],
              fontSize: isDesktop ? 15 : 16,
            }}
          >
            {title}
          </Text>

          <Text
            className="mt-1"
            style={{
              color: colors["text-secondary"],
              fontSize: 13,
              lineHeight: 18,
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

  const SectionTitle = ({ children }) => (
    <Text
      className="font-bold uppercase"
      style={{
        color: colors.primary,
        fontSize: 12,
        letterSpacing: 0.8,
        marginBottom: 8,
        marginTop: isDesktop ? 28 : 24,
      }}
    >
      {children}
    </Text>
  );

  const SectionCard = ({ children }) => (
    <View
      className="overflow-hidden rounded-2xl"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors["border-subtle"],
      }}
    >
      {children}
    </View>
  );

  const Divider = () => (
    <View
      style={{
        height: 1,
        marginHorizontal: isDesktop ? 22 : 16,
        backgroundColor: colors["border-subtle"],
      }}
    />
  );

  const contentMaxWidth = isDesktop ? 760 : 620;

  const horizontalPadding = !isWeb
    ? 16
    : isWideDesktop
      ? 32
      : 24;

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top", "bottom"]}
      style={{
        backgroundColor: colors.background,
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: contentMaxWidth,
          alignSelf: "center",
          flex: 1,
        }}
      >
        <View
          className="flex-row items-center"
          style={{
            paddingHorizontal: horizontalPadding,
            paddingTop: isDesktop ? 18 : 8,
            paddingBottom: isDesktop ? 18 : 16,
            borderBottomWidth: 1,
            borderBottomColor:
              colors["border-subtle"],
          }}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            className="items-center justify-center rounded-full"
            style={{
              width: 42,
              height: 42,
              marginRight: 14,
              backgroundColor:
                colors["surface-elevated"],
            }}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={colors["text-primary"]}
            />
          </Pressable>

          <View className="flex-1">
            <Text
              className="font-bold"
              style={{
                color: colors["text-primary"],
                fontSize: isDesktop ? 25 : 24,
              }}
            >
              Settings
            </Text>

            <Text
              className="mt-1"
              style={{
                color: colors["text-secondary"],
                fontSize: 13,
              }}
            >
              Manage your account and preferences
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingBottom: isDesktop ? 50 : 35,
          }}
        >
          <SectionTitle>
            Account
          </SectionTitle>

          <SectionCard>
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

            <Divider />

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
          </SectionCard>

          <SectionTitle>
            Permissions
          </SectionTitle>

          <SectionCard>
            <PermissionRow
              icon="notifications-outline"
              title="Notifications"
              subtitle="Receive story and activity notifications"
              value={notificationsEnabled}
              onValueChange={
                handleNotificationToggle
              }
            />

            <Divider />

            <PermissionRow
              icon="camera-outline"
              title="Camera"
              subtitle="Allow camera access for photos and videos"
              value={cameraEnabled}
              onValueChange={handleCameraToggle}
            />

            <Divider />

            <PermissionRow
              icon="mic-outline"
              title="Microphone"
              subtitle="Allow microphone access for video recording"
              value={microphoneEnabled}
              onValueChange={
                handleMicrophoneToggle
              }
            />

            <Divider />

            <PermissionRow
              icon="images-outline"
              title="Photos & Media"
              subtitle="Allow access to photos and videos"
              value={mediaEnabled}
              onValueChange={handleMediaToggle}
            />
          </SectionCard>

          <SectionTitle>
            Preferences
          </SectionTitle>

          <SectionCard>
            <PermissionRow
              icon="moon-outline"
              title="Dark Mode"
              subtitle="Use the dark Paws & Pastures appearance"
              value={darkMode}
              onValueChange={setDarkMode}
            />

            <Divider />

            <PermissionRow
              icon="play-circle-outline"
              title="Auto-play Videos"
              subtitle="Automatically play videos while browsing"
              value={autoPlayVideos}
              onValueChange={setAutoPlayVideos}
            />
          </SectionCard>

          <SectionTitle>
            About
          </SectionTitle>

          <SectionCard>
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

            <Divider />

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

            <Divider />

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
          </SectionCard>

          <SectionTitle>
            Support
          </SectionTitle>

          <SectionCard>
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

            <Divider />

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
          </SectionCard>

          <Pressable
            onPress={handleLogout}
            className="flex-row items-center justify-center rounded-2xl"
            style={{
              height: 54,
              marginTop: isDesktop ? 30 : 28,
              backgroundColor:
                colors["surface-elevated"],
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color={colors.primary}
            />

            <Text
              className="ml-3 font-bold"
              style={{
                color: colors.primary,
                fontSize: 16,
              }}
            >
              Log Out
            </Text>
          </Pressable>

          <Pressable
            onPress={handleDeleteAccount}
            className="items-center"
            style={{
              marginTop: 20,
            }}
          >
            <Text
              className="font-semibold"
              style={{
                color: colors["text-muted"],
                fontSize: 14,
              }}
            >
              Delete Account
            </Text>
          </Pressable>

          <Text
            className="text-center"
            style={{
              color: colors["text-placeholder"],
              fontSize: 12,
              marginTop: 20,
            }}
          >
            Paws & Pastures
          </Text>

          <Text
            className="text-center"
            style={{
              color: colors["text-placeholder"],
              fontSize: 11,
              marginTop: 4,
            }}
          >
            Version 1.0.0
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}