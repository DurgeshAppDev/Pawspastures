import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
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

import { colors } from "../../src/theme";

const TYPE_OPTIONS = ["Dog", "Cat", "Bird", "Rabbit", "Other"];

const GENDER_OPTIONS = ["Male", "Female"];

const SIZE_OPTIONS = ["Small", "Medium", "Large"];

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

export default function PetProfileSetupScreen({ onComplete }) {
  const { width } = useWindowDimensions();

  const isWeb = width >= 768;

  const contentWidth = useMemo(() => {
    if (isWeb) {
      return Math.min(width - 48, 620);
    }

    return width - 32;
  }, [width, isWeb]);

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

      if (!draft.pet) {
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
        "Firebase Storage is not enabled yet. Please remove the selected pet image or enable Firebase Storage before completing your profile.",
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
          Meet your pet
        </Text>

        <Text
          className="mt-2 text-base leading-6"
          style={{ color: colors.secondary }}
        >
          Add your pet's details to complete your Paws & Pastures profile.
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
            onPress={selectPetImage}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="paw-outline" size={38} color={colors.primary} />
            )}
          </Pressable>

          <Pressable className="mt-3" onPress={selectPetImage}>
            <Text className="font-semibold" style={{ color: colors.primary }}>
              {imageUri ? "Change pet picture" : "Add pet picture"}
            </Text>
          </Pressable>
        </View>

        <View className="mt-7">
          <Text
            className="mb-2 text-sm font-semibold"
            style={{ color: colors.text }}
          >
            Pet name
          </Text>

          <TextInput
            value={petName}
            onChangeText={setPetName}
            placeholder="Enter your pet's name"
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
          <DropdownField
            label="Pet type"
            value={type}
            options={TYPE_OPTIONS}
            placeholder="Select pet type"
            onChange={setType}
          />
        </View>

        <View className="mt-0">
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
            Age
          </Text>

          <TextInput
            value={age}
            onChangeText={setAge}
            placeholder="Enter your pet's age"
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
            label="Size"
            value={size}
            options={SIZE_OPTIONS}
            placeholder="Select size"
            onChange={setSize}
          />
        </View>

        <Pressable
          className="mt-4 flex-row items-center rounded-2xl px-4 py-4"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
          onPress={selectPetImage}
        >
          <Ionicons name="image-outline" size={22} color={colors.primary} />

          <Text className="ml-3 flex-1" style={{ color: colors.secondary }}>
            {imageUri ? "Pet picture selected" : "Add a pet picture"}
          </Text>

          <Ionicons name="chevron-forward" size={18} color={colors.secondary} />
        </Pressable>

        <Pressable
          className="mt-8 items-center justify-center rounded-2xl px-5 py-4"
          style={{
            backgroundColor: saving ? colors.elevated : colors.primary,
          }}
          disabled={saving}
          onPress={handleComplete}
        >
          {saving ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text className="font-bold" style={{ color: colors.text }}>
              Complete Profile
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
