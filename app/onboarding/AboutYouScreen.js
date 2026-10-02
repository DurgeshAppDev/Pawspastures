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
    <View className="mb-4">
      <Text
        className="mb-2 text-sm font-semibold"
        style={{ color: colors.text }}
      >
        {label}
      </Text>

      <Pressable
        className="flex-row items-center justify-between rounded-2xl px-4 py-4"
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: open ? colors.primary : colors.border,
        }}
        onPress={() => setOpen((current) => !current)}
      >
        <Text
          className="flex-1"
          style={{
            color: value ? colors.text : colors.placeholder,
          }}
        >
          {value || placeholder}
        </Text>

        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.secondary}
        />
      </Pressable>

      {open && (
        <View
          className="mt-2 overflow-hidden rounded-2xl"
          style={{
            backgroundColor: colors.elevated,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {options.map((option) => (
            <Pressable
              key={option}
              className="px-4 py-3"
              style={{
                backgroundColor:
                  value === option ? colors.surface : "transparent",
              }}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              <Text
                style={{
                  color: value === option ? colors.primary : colors.text,
                }}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export default function AboutYouScreen({ navigation }) {
  const { width } = useWindowDimensions();

  const isWeb = width >= 768;

  const contentWidth = useMemo(() => {
    if (isWeb) {
      return Math.min(width - 48, 620);
    }

    return width - 32;
  }, [width, isWeb]);

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

      if (!draft.user) {
        return;
      }

      setName(draft.user.name || "");
      setAge(draft.user.age ? String(draft.user.age) : "");
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
      <View
        className="flex-1 items-center justify-center"
        style={{
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      style={{
        backgroundColor: colors.background,
      }}
      contentContainerStyle={{
        alignItems: "center",
        paddingVertical: isWeb ? 48 : 28,
        paddingHorizontal: 16,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ width: contentWidth }}>
        <Text className="text-3xl font-bold" style={{ color: colors.text }}>
          Tell us about you
        </Text>

        <Text
          className="mt-2 text-base leading-6"
          style={{ color: colors.secondary }}
        >
          Create your profile so the Paws & Pastures community can get to know
          you.
        </Text>

        {error ? (
          <View
            className="mt-5 rounded-2xl px-4 py-3"
            style={{
              backgroundColor: colors.elevated,
              borderWidth: 1,
              borderColor: colors.primary,
            }}
          >
            <Text className="leading-5" style={{ color: colors.accent }}>
              {error}
            </Text>
          </View>
        ) : null}

        <View className="mt-7 items-center">
          <Pressable
            className="h-28 w-28 items-center justify-center overflow-hidden rounded-full"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 2,
              borderColor: colors.border,
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
                size={34}
                color={colors.primary}
              />
            )}
          </Pressable>

          <Pressable className="mt-3" onPress={selectProfileImage}>
            <Text className="font-semibold" style={{ color: colors.primary }}>
              {profileImage ? "Change profile picture" : "Add profile picture"}
            </Text>
          </Pressable>
        </View>

        <View className="mt-7">
          <Text
            className="mb-2 text-sm font-semibold"
            style={{ color: colors.text }}
          >
            Name
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={colors.placeholder}
            className="rounded-2xl px-4 py-4"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.text,
            }}
            maxLength={60}
          />
        </View>

        <View className="mt-4">
          <Text
            className="mb-2 text-sm font-semibold"
            style={{ color: colors.text }}
          >
            Age
          </Text>

          <TextInput
            value={age}
            onChangeText={setAge}
            placeholder="Enter your age"
            placeholderTextColor={colors.placeholder}
            keyboardType="number-pad"
            className="rounded-2xl px-4 py-4"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.text,
            }}
            maxLength={3}
          />
        </View>

        <View className="mt-4">
          <DropdownField
            label="Gender"
            value={gender}
            options={GENDER_OPTIONS}
            placeholder="Select gender"
            onChange={setGender}
          />
        </View>

        <View className="mt-0">
          <Text
            className="mb-2 text-sm font-semibold"
            style={{ color: colors.text }}
          >
            Location
          </Text>

          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Enter your location"
            placeholderTextColor={colors.placeholder}
            className="rounded-2xl px-4 py-4"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.text,
            }}
            maxLength={100}
          />
        </View>

        <View className="mt-4">
          <Text
            className="mb-2 text-sm font-semibold"
            style={{ color: colors.text }}
          >
            Bio
          </Text>

          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Tell the community a little about yourself"
            placeholderTextColor={colors.placeholder}
            multiline
            textAlignVertical="top"
            className="rounded-2xl px-4 py-4"
            style={{
              minHeight: 120,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.text,
            }}
            maxLength={300}
          />
        </View>

        <View className="mt-5">
          <Text
            className="mb-2 text-sm font-semibold"
            style={{ color: colors.text }}
          >
            Interests
          </Text>

          <View className="flex-row flex-wrap">
            {INTEREST_OPTIONS.map((interest) => {
              const selected = interests.includes(interest);

              return (
                <Pressable
                  key={interest}
                  className="mb-2 mr-2 rounded-full px-4 py-2.5"
                  style={{
                    backgroundColor: selected ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: selected ? colors.primary : colors.border,
                  }}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{
                      color: selected ? colors.text : colors.secondary,
                    }}
                  >
                    {interest}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          className="mt-8 items-center justify-center rounded-2xl px-5 py-4"
          style={{
            backgroundColor: saving ? colors.elevated : colors.primary,
          }}
          disabled={saving}
          onPress={handleContinue}
        >
          {saving ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text className="font-bold" style={{ color: colors.text }}>
              Continue
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
