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
  clearOnboardingDraft,
  getOnboardingDraft,
  updateOnboardingDraft,
} from "../../src/storage/onboardingStorage";

import {
  completeOnboarding,
  isFirebaseStorageEnabled,
} from "../../src/services/OnboardingServices";
import { fetchAndCacheUserProfileData } from "../../src/services/ProfileServices";

import { colors } from "../../src/theme";

const TYPE_OPTIONS = ["Dog", "Cat", "Bird", "Rabbit", "Other"];

const GENDER_OPTIONS = ["Male", "Female"];

const SIZE_OPTIONS = ["Small", "Medium", "Large"];

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

export default function PetProfileSetupScreen({ onComplete }) {
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

  const [petName, setPetName] = useState("");
  const [type, setType] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [size, setSize] = useState("");
  const [imageUri, setImageUri] = useState(null);

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

      if (!draft?.pet) {
        return;
      }

      setPetName(draft.pet.petName || "");
      setType(draft.pet.type || "");
      setGender(draft.pet.gender || "");

      setAge(
        draft.pet.age !== undefined && draft.pet.age !== null
          ? String(draft.pet.age)
          : "",
      );

      setSize(draft.pet.size || "");
      setImageUri(draft.pet.imageUri || null);
    } catch (err) {
      console.error("Failed to load pet onboarding draft:", err);

      setError(err?.message || "Unable to load your saved pet information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  const selectPetImage = async () => {
    try {
      setError("");

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError(
          "Photo library permission is required to select a pet picture.",
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
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Pet image selection failed:", err);
      setError("Unable to select the pet picture.");
    }
  };

  const validate = () => {
    const trimmedName = petName.trim();
    const numericAge = Number(age);

    if (!trimmedName) {
      return "Please enter your pet's name.";
    }

    if (!type) {
      return "Please select your pet type.";
    }

    if (!gender) {
      return "Please select your pet's gender.";
    }

    if (!Number.isInteger(numericAge) || numericAge < 0 || numericAge > 100) {
      return "Please enter a valid pet age.";
    }

    if (!size) {
      return "Please select your pet's size.";
    }

    return null;
  };

  const handleComplete = async () => {
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

    if (imageUri && !isFirebaseStorageEnabled()) {
      setError(
        "Firebase Storage is not enabled. Please remove the selected pet image or enable Firebase Storage before completing your profile.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const draft = await updateOnboardingDraft(user.uid, {
        pet: {
          petName: petName.trim(),
          type,
          gender,
          age: Number(age),
          size,
          imageUri: imageUri || null,
        },
      });

      if (!draft.user) {
        throw new Error(
          "Your About You information is missing. Please go back and complete it.",
        );
      }

      await completeOnboarding(user.uid, {
        user: draft.user,
        pet: draft.pet,
      });

      try {
        await fetchAndCacheUserProfileData(user.uid);
      } catch (cacheError) {
        // Onboarding is already saved to Firestore; the next cache miss can retry.
        console.warn("Unable to populate profile cache after onboarding:", cacheError);
      }

      try {
        await clearOnboardingDraft(user.uid);
      } catch (clearError) {
        console.warn(
          "Onboarding completed, but local draft could not be cleared:",
          clearError,
        );
      }

      onComplete?.();
    } catch (err) {
      console.error("Onboarding completion failed:", err);

      setError(
        err?.message ||
          "We couldn't complete your profile. Your information has been kept locally. Please try again.",
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
              Meet your pet
            </Text>

            <Text className="mt-2 text-base leading-6 text-text-secondary">
              Add your pet's details to complete your Paws & Pastures profile.
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
                  borderColor: imageUri ? colors.primary : colors.border,
                }}
                onPress={selectPetImage}
              >
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons
                    name="paw-outline"
                    size={40}
                    color={colors.primary}
                  />
                )}
              </Pressable>

              <Pressable className="mt-3" onPress={selectPetImage}>
                <Text className="font-semibold text-primary">
                  {imageUri ? "Change pet picture" : "Add pet picture"}
                </Text>
              </Pressable>
            </View>

            <View className="mt-8">
              <Text className="mb-2 text-sm font-semibold text-text-primary">
                Pet name
              </Text>

              <TextInput
                value={petName}
                onChangeText={setPetName}
                placeholder="Enter your pet's name"
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
              <DropdownField
                label="Pet type"
                value={type}
                options={TYPE_OPTIONS}
                placeholder="Select pet type"
                onChange={setType}
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
                Age
              </Text>

              <TextInput
                value={age}
                onChangeText={setAge}
                placeholder="Enter your pet's age"
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
                label="Size"
                value={size}
                options={SIZE_OPTIONS}
                placeholder="Select size"
                onChange={setSize}
              />
            </View>

            <Pressable
              className="min-h-[56px] flex-row items-center rounded-2xl border px-4"
              style={{
                backgroundColor: colors["surface-elevated"],
                borderColor: colors.border,
              }}
              onPress={selectPetImage}
            >
              <Ionicons name="image-outline" size={22} color={colors.primary} />

              <Text className="ml-3 flex-1 text-base text-text-secondary">
                {imageUri ? "Pet picture selected" : "Add a pet picture"}
              </Text>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors["icon-muted"]}
              />
            </Pressable>

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
              onPress={handleComplete}
            >
              {saving ? (
                <ActivityIndicator color={colors["text-primary"]} />
              ) : (
                <View className="flex-row items-center">
                  <Text className="font-bold text-text-primary">
                    Complete Profile
                  </Text>

                  <Ionicons
                    name="checkmark-circle-outline"
                    size={19}
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
