import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";

import {
  getUserProfileData,
  updateUserProfile,
} from "../../src/services/ProfileServices";

import {
  updateCachedProfile,
} from "../../src/services/profileCache";

import { colors } from "../../src/theme";

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];

const INTEREST_OPTIONS = [
  "Dogs",
  "Cats",
  "Pet Care",
  "Training",
  "Pet Activities",
  "Animal Welfare",
  "Outdoor Activities",
  "Photography",
];

function DropdownField({ label, value, options, placeholder, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-semibold text-text-primary">
        {label}
      </Text>

      <Pressable
        className="min-h-[56px] flex-row items-center justify-between rounded-2xl border bg-surface-elevated px-4"
        onPress={() => setOpen((value) => !value)}
      >
        <Text
          className={
            value
              ? "flex-1 text-base text-text-primary"
              : "flex-1 text-base text-text-placeholder"
          }
        >
          {value || placeholder}
        </Text>

        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          className="text-icon-muted"
        />
      </Pressable>

      {open ? (
        <View className="mt-2 overflow-hidden rounded-2xl border border-border bg-surface-elevated">
          {options.map((option) => {
            const selected = option === value;

            return (
              <Pressable
                key={option}
                className={
                  selected
                    ? "flex-row items-center bg-surface px-4 py-3.5"
                    : "flex-row items-center px-4 py-3.5"
                }
                onPress={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                {selected ? (
                  <Ionicons
                    name="checkmark"
                    size={17}
                    className="text-primary"
                  />
                ) : null}

                <Text
                  className={
                    selected
                      ? "ml-2 text-base font-semibold text-primary"
                      : "text-base text-text-primary"
                  }
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

export default function EditProfileScreen() {
  const navigation = require("@react-navigation/native").useNavigation();

  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;
  const isTablet = width >= 600 && width < 900;

  const contentWidth = useMemo(() => {
    if (isDesktop) {
      return Math.min(width - 64, 680);
    }

    if (isTablet) {
      return Math.min(width - 48, 640);
    }

    return width - 32;
  }, [width, isDesktop, isTablet]);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState([]);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const userId = getAuth().currentUser?.uid;

  const loadCachedProfile = useCallback(async () => {
    if (!userId) {
      setError("Your session has expired. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { profile } = await getUserProfileData(userId);

      if (!profile) {
        throw new Error("Your profile data could not be found.");
      }

      setName(profile.name || "");

      setAge(
        profile.age !== undefined && profile.age !== null
          ? String(profile.age)
          : "",
      );

      setGender(profile.gender || "");
      setLocation(profile.location || "");
      setBio(profile.bio || "");

      setInterests(Array.isArray(profile.interests) ? profile.interests : []);

      setProfileImageUrl(profile.profileImageUrl || null);
    } catch (err) {
      console.error("Failed to load cached profile:", err);

      setError(err?.message || "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadCachedProfile();
  }, [loadCachedProfile]);

  const selectProfileImage = async () => {
    try {
      setError("");

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError("Photo library permission is required.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setProfileImageUrl(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Profile image selection failed:", err);

      setError("Unable to select the profile picture.");
    }
  };

  const toggleInterest = (interest) => {
    setInterests((current) => {
      if (current.includes(interest)) {
        return current.filter((item) => item !== interest);
      }

      return [...current, interest];
    });
  };

  const validate = () => {
    if (!name.trim()) {
      return "Please enter your name.";
    }

    const numericAge = Number(age);

    if (!Number.isInteger(numericAge) || numericAge < 13 || numericAge > 120) {
      return "Please enter a valid age.";
    }

    if (!gender) {
      return "Please select your gender.";
    }

    if (!location.trim()) {
      return "Please enter your location.";
    }

    if (!bio.trim()) {
      return "Please enter your bio.";
    }

    if (interests.length === 0) {
      return "Please select at least one interest.";
    }

    return null;
  };

  const handleDone = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!userId) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const firebaseProfile = await updateUserProfile(userId, {
        name: name.trim(),
        age: Number(age),
        gender,
        location: location.trim(),
        bio: bio.trim(),
        interests,
        profileImageUrl: profileImageUrl || null,
      });

      if (!firebaseProfile) {
        throw new Error("Profile could not be updated.");
      }

      await updateCachedProfile(userId, firebaseProfile);

      navigation.goBack();
    } catch (err) {
      console.error("Profile update failed:", err);

      setError(
        err?.message || "Unable to update your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center border-b border-border-subtle bg-background px-4 py-4">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-10 w-10 items-center justify-center rounded-xl bg-surface"
        >
          <Ionicons name="arrow-back" size={21} className="text-text-primary" />
        </Pressable>

        <View className="ml-3 flex-1">
          <Text className="text-lg font-extrabold text-text-primary">
            Edit Profile
          </Text>

          <Text className="mt-0.5 text-xs text-text-secondary">
            Update your personal information
          </Text>
        </View>

        <Pressable
          onPress={handleDone}
          disabled={saving}
          className="rounded-xl bg-primary px-4 py-2.5"
          style={{
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? (
            <ActivityIndicator size="small" className="text-text-primary" />
          ) : (
            <Text className="font-bold text-text-primary">Done</Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: isDesktop ? 32 : 16,
          paddingTop: isDesktop ? 40 : 24,
          paddingBottom: 50,
        }}
      >
        <View
          style={{
            width: contentWidth,
            maxWidth: "100%",
          }}
        >
          <View className="rounded-[28px] bg-surface p-5">
            {error ? (
              <View className="mb-6 rounded-2xl border border-accent bg-surface-elevated px-4 py-3.5">
                <View className="flex-row items-start">
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    className="text-accent"
                  />

                  <Text className="ml-3 flex-1 text-sm leading-5 text-text-primary">
                    {error}
                  </Text>
                </View>
              </View>
            ) : null}

            <View className="items-center">
              <Pressable
                onPress={selectProfileImage}
                className="h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-surface-icon"
              >
                {profileImageUrl ? (
                  <Image
                    source={{
                      uri: profileImageUrl,
                    }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons
                    name="person"
                    size={38}
                    className="text-icon-muted"
                  />
                )}
              </Pressable>

              <Pressable onPress={selectProfileImage} className="mt-3">
                <Text className="font-semibold text-primary">
                  Change profile picture
                </Text>
              </Pressable>
            </View>

            <View className="mt-8">
              <Text className="mb-2 text-sm font-semibold text-text-primary">
                Name
              </Text>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors["text-placeholder"]}
                className="min-h-[56px] rounded-2xl border border-border bg-surface-elevated px-4 text-base text-text-primary"
                maxLength={60}
              />
            </View>

            <View className="mt-5">
              <Text className="mb-2 text-sm font-semibold text-text-primary">
                Age
              </Text>

              <TextInput
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
                placeholderTextColor={colors["text-placeholder"]}
                keyboardType="number-pad"
                className="min-h-[56px] rounded-2xl border border-border bg-surface-elevated px-4 text-base text-text-primary"
                maxLength={3}
              />
            </View>

            <DropdownField
              label="Gender"
              value={gender}
              options={GENDER_OPTIONS}
              placeholder="Select gender"
              onChange={setGender}
            />

            <View>
              <Text className="mb-2 text-sm font-semibold text-text-primary">
                Location
              </Text>

              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Enter your location"
                placeholderTextColor={colors["text-placeholder"]}
                className="min-h-[56px] rounded-2xl border border-border bg-surface-elevated px-4 text-base text-text-primary"
                maxLength={100}
              />
            </View>

            <View className="mt-5">
              <Text className="mb-2 text-sm font-semibold text-text-primary">
                Bio
              </Text>

              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Tell the community about yourself"
                placeholderTextColor={colors["text-placeholder"]}
                multiline
                textAlignVertical="top"
                className="rounded-2xl border border-border bg-surface-elevated px-4 py-4 text-base text-text-primary"
                style={{
                  minHeight: 130,
                }}
                maxLength={300}
              />

              <Text className="mt-2 text-right text-xs text-text-muted">
                {bio.length}/300
              </Text>
            </View>

            <View className="mt-5">
              <Text className="mb-3 text-sm font-semibold text-text-primary">
                Interests
              </Text>

              <View className="flex-row flex-wrap">
                {INTEREST_OPTIONS.map((interest) => {
                  const selected = interests.includes(interest);

                  return (
                    <Pressable
                      key={interest}
                      onPress={() => toggleInterest(interest)}
                      className={
                        selected
                          ? "mb-2 mr-2 rounded-full border border-primary bg-primary px-4 py-2.5"
                          : "mb-2 mr-2 rounded-full border border-border bg-surface-elevated px-4 py-2.5"
                      }
                    >
                      <View className="flex-row items-center">
                        {selected ? (
                          <Ionicons
                            name="checkmark"
                            size={15}
                            className="text-text-primary"
                          />
                        ) : null}

                        <Text
                          className={
                            selected
                              ? "ml-1 text-sm font-semibold text-text-primary"
                              : "text-sm font-medium text-text-secondary"
                          }
                        >
                          {interest}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable
              onPress={handleDone}
              disabled={saving}
              className="mt-8 min-h-[56px] items-center justify-center rounded-2xl bg-primary"
              style={{
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? (
                <ActivityIndicator className="text-text-primary" />
              ) : (
                <Text className="font-bold text-text-primary">
                  Save Changes
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
