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
  getOnboardingDraft,
  updateOnboardingDraft,
} from "../../src/storage/onboardingStorage";

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
        className="min-h-[56px] flex-row items-center justify-between rounded-2xl border px-4"
        style={{
          backgroundColor: colors.surface,
          borderColor: open ? colors.primary : colors.border,
        }}
        onPress={() => setOpen((current) => !current)}
      >
        <Text
          className="flex-1 text-base"
          style={{
            color: value ? colors["text-primary"] : colors["text-placeholder"],
          }}
        >
          {value || placeholder}
        </Text>

        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors["icon-muted"]}
        />
      </Pressable>

      {open ? (
        <View
          className="mt-2 overflow-hidden rounded-2xl border"
          style={{
            backgroundColor: colors["surface-elevated"],
            borderColor: colors.border,
          }}
        >
          {options.map((option) => {
            const selected = value === option;

            return (
              <Pressable
                key={option}
                className="flex-row items-center px-4 py-3.5"
                style={{
                  backgroundColor: selected ? colors.surface : "transparent",
                }}
                onPress={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                {selected ? (
                  <Ionicons name="checkmark" size={17} color={colors.primary} />
                ) : null}

                <Text
                  className={
                    selected ? "ml-2 text-base font-semibold" : "text-base"
                  }
                  style={{
                    color: selected ? colors.primary : colors["text-primary"],
                  }}
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

export default function AboutYouScreen({ navigation }) {
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
  const [profileImage, setProfileImage] = useState(null);
  const [interests, setInterests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadDraft = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const user = getAuth().currentUser;

      if (!user?.uid) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const draft = await getOnboardingDraft(user.uid);

      if (!draft?.user) {
        return;
      }

      setName(draft.user.name || "");

      setAge(
        draft.user.age !== undefined && draft.user.age !== null
          ? String(draft.user.age)
          : "",
      );

      setGender(draft.user.gender || "");
      setLocation(draft.user.location || "");
      setBio(draft.user.bio || "");
      setProfileImage(draft.user.profileImage || null);

      setInterests(
        Array.isArray(draft.user.interests) ? draft.user.interests : [],
      );
    } catch (err) {
      console.error("Failed to load onboarding draft:", err);

      setError(err?.message || "Unable to load your saved information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  const selectProfileImage = async () => {
    try {
      setError("");

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError(
          "Photo library permission is required to select a profile picture.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setProfileImage(result.assets[0].uri);
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
    const trimmedName = name.trim();
    const numericAge = Number(age);
    const trimmedLocation = location.trim();
    const trimmedBio = bio.trim();

    if (!trimmedName) {
      return "Please enter your name.";
    }

    if (!Number.isInteger(numericAge) || numericAge < 13 || numericAge > 120) {
      return "Please enter a valid age.";
    }

    if (!gender) {
      return "Please select your gender.";
    }

    if (!trimmedLocation) {
      return "Please enter your location.";
    }

    if (!trimmedBio) {
      return "Please enter your bio.";
    }

    if (interests.length === 0) {
      return "Please select at least one interest.";
    }

    return null;
  };

  const handleContinue = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    const user = getAuth().currentUser;

    if (!user?.uid) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const provider = user.providerData?.[0]?.providerId || "password";

      await updateOnboardingDraft(user.uid, {
        user: {
          name: name.trim(),
          age: Number(age),
          gender,
          location: location.trim(),
          bio: bio.trim(),
          interests,
          profileImage: profileImage || null,
          authProvider: provider,
        },
      });

      navigation.navigate("PetProfileSetup");
    } catch (err) {
      console.error("Failed to save About You draft:", err);

      setError(
        err?.message || "Unable to save your information. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: isDesktop ? 32 : 16,
          paddingTop: isDesktop ? 56 : 28,
          paddingBottom: isDesktop ? 64 : 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            width: contentWidth,
            maxWidth: "100%",
          }}
        >
          <View
            className="rounded-[28px] p-5"
            style={{
              backgroundColor: colors.surface,
              borderWidth: isDesktop ? 1 : 0,
              borderColor: colors["border-subtle"],
              shadowOpacity: isDesktop ? 0.15 : 0,
              shadowRadius: 24,
              shadowOffset: {
                width: 0,
                height: 12,
              },
              elevation: isDesktop ? 4 : 0,
            }}
          >
            <Text className="text-3xl font-bold text-text-primary">
              Tell us about you
            </Text>

            <Text className="mt-2 text-base leading-6 text-text-secondary">
              Create your profile so the Paws & Pastures community can get to
              know you.
            </Text>

            {error ? (
              <View
                className="mt-6 rounded-2xl border px-4 py-3.5"
                style={{
                  backgroundColor: colors["surface-elevated"],
                  borderColor: colors.accent,
                }}
              >
                <View className="flex-row items-start">
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color={colors.accent}
                  />

                  <Text className="ml-3 flex-1 text-sm leading-5 text-text-primary">
                    {error}
                  </Text>
                </View>
              </View>
            ) : null}

            <View className="mt-8 items-center">
              <Pressable
                className="h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2"
                style={{
                  backgroundColor: colors["surface-icon"],
                  borderColor: profileImage ? colors.primary : colors.border,
                }}
                onPress={selectProfileImage}
              >
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons
                    name="camera-outline"
                    size={36}
                    color={colors.primary}
                  />
                )}
              </Pressable>

              <Pressable className="mt-3" onPress={selectProfileImage}>
                <Text className="font-semibold text-primary">
                  {profileImage
                    ? "Change profile picture"
                    : "Add profile picture"}
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
                className="min-h-[56px] rounded-2xl border px-4 text-base text-text-primary"
                style={{
                  backgroundColor: colors["surface-elevated"],
                  borderColor: colors.border,
                  outlineStyle: "none",
                }}
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
                className="min-h-[56px] rounded-2xl border px-4 text-base text-text-primary"
                style={{
                  backgroundColor: colors["surface-elevated"],
                  borderColor: colors.border,
                  outlineStyle: "none",
                }}
                maxLength={3}
              />
            </View>

            <View className="mt-5">
              <DropdownField
                label="Gender"
                value={gender}
                options={GENDER_OPTIONS}
                placeholder="Select gender"
                onChange={setGender}
              />
            </View>

            <View>
              <Text className="mb-2 text-sm font-semibold text-text-primary">
                Location
              </Text>

              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Enter your location"
                placeholderTextColor={colors["text-placeholder"]}
                className="min-h-[56px] rounded-2xl border px-4 text-base text-text-primary"
                style={{
                  backgroundColor: colors["surface-elevated"],
                  borderColor: colors.border,
                  outlineStyle: "none",
                }}
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
                placeholder="Tell the community a little about yourself"
                placeholderTextColor={colors["text-placeholder"]}
                multiline
                textAlignVertical="top"
                className="rounded-2xl border px-4 py-4 text-base text-text-primary"
                style={{
                  minHeight: 128,
                  backgroundColor: colors["surface-elevated"],
                  borderColor: colors.border,
                  outlineStyle: "none",
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
                      className="mb-2 mr-2 rounded-full border px-4 py-2.5"
                      style={{
                        backgroundColor: selected
                          ? colors.primary
                          : colors["surface-elevated"],
                        borderColor: selected ? colors.primary : colors.border,
                      }}
                      onPress={() => toggleInterest(interest)}
                    >
                      <View className="flex-row items-center">
                        {selected ? (
                          <Ionicons
                            name="checkmark"
                            size={15}
                            color={colors["text-primary"]}
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
              className="mt-8 min-h-[56px] items-center justify-center rounded-2xl"
              style={{
                backgroundColor: saving
                  ? colors["surface-elevated"]
                  : colors.primary,
                borderWidth: 1,
                borderColor: saving ? colors.border : colors.primary,
                opacity: saving ? 0.75 : 1,
              }}
              disabled={saving}
              onPress={handleContinue}
            >
              {saving ? (
                <ActivityIndicator color={colors["text-primary"]} />
              ) : (
                <View className="flex-row items-center">
                  <Text className="font-bold text-text-primary">Continue</Text>

                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={colors["text-primary"]}
                    style={{ marginLeft: 8 }}
                  />
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
