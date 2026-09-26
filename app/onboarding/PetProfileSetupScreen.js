import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";

import SelectDropdown from "../../src/components/SelectDropdown";
import { savePetDetails } from "../../src/services/OnboardingServices";
import { colors } from "../../src/theme";

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const AGE_OPTIONS = [
  { label: "1 year", value: "1" },
  { label: "2 years", value: "2" },
  { label: "3 years", value: "3" },
  { label: "4 years", value: "4" },
  { label: "5 years", value: "5" },
  { label: "5+", value: "5+" },
];

const SIZE_OPTIONS = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
];

const PET_TYPE_OPTIONS = [
  { label: "Dog", value: "dog" },
  { label: "Cat", value: "cat" },
  { label: "Other", value: "other" },
];

export default function PetProfileSetupScreen({ navigation }) {
  const auth = getAuth();

  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [size, setSize] = useState("");

  const [imageUri, setImageUri] = useState(null);
  const [saving, setSaving] = useState(false);

  const pickPetImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to select your pet image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const handleContinue = async () => {
    if (!petName.trim()) {
      Alert.alert("Required", "Please enter your pet's name.");
      return;
    }

    if (!petType) {
      Alert.alert("Required", "Please select pet type.");
      return;
    }

    if (!gender) {
      Alert.alert("Required", "Please select gender.");
      return;
    }

    if (!age) {
      Alert.alert("Required", "Please select pet age.");
      return;
    }

    if (!size) {
      Alert.alert("Required", "Please select pet size.");
      return;
    }

    const userId = auth.currentUser?.uid;

    if (!userId) {
      Alert.alert("Session expired", "Please login again.");
      return;
    }

    try {
      setSaving(true);

      await savePetDetails(userId, {
        petName: petName.trim(),
        petType,
        gender,
        age,
        size,

        // Temporary local URI.
        // Replace with Firebase Storage URL when Storage is enabled.
        imageUri: imageUri || null,
      });

      navigation.navigate("AboutYou");
    } catch (error) {
      console.error("PET SAVE ERROR:", error);

      Alert.alert(
        "Unable to save",
        "Something went wrong while saving your pet details.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="text-3xl font-bold"
          style={{ color: colors["text-primary"] }}
        >
          Tell us about your pet
        </Text>

        <Text
          className="mt-2 mb-6 text-base"
          style={{ color: colors["text-secondary"] }}
        >
          Add your pet's basic information.
        </Text>

        {/* PET IMAGE */}

        <View className="mb-6 items-center">
          {imageUri ? (
            <View className="items-center">
              <Image
                source={{ uri: imageUri }}
                className="h-[180px] w-[180px] rounded-3xl"
              />

              <View className="mt-3 flex-row gap-3">
                <Pressable
                  onPress={pickPetImage}
                  className="rounded-xl px-5 py-3"
                  style={{
                    backgroundColor: colors["surface-elevated"],
                  }}
                >
                  <Text
                    className="font-semibold"
                    style={{ color: colors.primary }}
                  >
                    Change
                  </Text>
                </Pressable>

                <Pressable
                  onPress={removeImage}
                  className="rounded-xl px-5 py-3"
                  style={{
                    backgroundColor: colors["surface-elevated"],
                  }}
                >
                  <Text
                    className="font-semibold"
                    style={{ color: colors["text-primary"] }}
                  >
                    Remove
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={pickPetImage}
              className="h-[180px] w-[180px] items-center justify-center rounded-3xl"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text className="text-4xl" style={{ color: colors.primary }}>
                +
              </Text>

              <Text
                className="mt-2 font-medium"
                style={{ color: colors["text-secondary"] }}
              >
                Add pet photo
              </Text>
            </Pressable>
          )}
        </View>

        <Text
          className="mb-2 text-sm font-medium"
          style={{ color: colors["text-secondary"] }}
        >
          Pet name
        </Text>

        <TextInput
          value={petName}
          onChangeText={setPetName}
          placeholder="Enter pet name"
          placeholderTextColor={colors["text-placeholder"]}
          className="mb-4 h-[52px] rounded-xl px-4 text-base"
          style={{
            color: colors["text-primary"],
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        />

        <SelectDropdown
          label="Pet type"
          placeholder="Select pet type"
          options={PET_TYPE_OPTIONS}
          value={petType}
          onSelect={setPetType}
        />

        <SelectDropdown
          label="Gender"
          placeholder="Select gender"
          options={GENDER_OPTIONS}
          value={gender}
          onSelect={setGender}
        />

        <SelectDropdown
          label="Pet age"
          placeholder="Select age"
          options={AGE_OPTIONS}
          value={age}
          onSelect={setAge}
        />

        <SelectDropdown
          label="Pet size"
          placeholder="Select size"
          options={SIZE_OPTIONS}
          value={size}
          onSelect={setSize}
        />

        <Pressable
          disabled={saving}
          onPress={handleContinue}
          className="mt-4 h-[52px] items-center justify-center rounded-xl"
          style={{
            backgroundColor: colors.primary,
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text
              className="text-base font-bold"
              style={{ color: colors.white }}
            >
              Continue
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
