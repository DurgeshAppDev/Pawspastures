import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import {
  getCachedProfile,
  updateCachedPet,
} from "../../src/services/profileCache";

import {
  updateUserPet,
} from "../../src/services/ProfileServices";

import { colors } from "../../src/theme";

const TYPE_OPTIONS = [
  "Dog",
  "Cat",
  "Bird",
  "Rabbit",
  "Other",
];

const GENDER_OPTIONS = [
  "Male",
  "Female",
];

const SIZE_OPTIONS = [
  "Small",
  "Medium",
  "Large",
];

function DropdownField({
  label,
  value,
  options,
  placeholder,
  onChange,
}) {
  const [open, setOpen] = useState(false);

  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-semibold text-text-primary">
        {label}
      </Text>

      <Pressable
        className="min-h-[56px] flex-row items-center justify-between rounded-2xl border border-border bg-surface-elevated px-4"
        onPress={() =>
          setOpen((current) => !current)
        }
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
          name={
            open
              ? "chevron-up"
              : "chevron-down"
          }
          size={18}
          className="text-icon-muted"
        />
      </Pressable>

      {open ? (
        <View className="mt-2 overflow-hidden rounded-2xl border border-border bg-surface-elevated">
          {options.map((option) => {
            const selected =
              option === value;

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

export default function EditPetScreen() {
  const navigation =
    useNavigation();

  const route = useRoute();

  const petId =
    route.params?.petId;

  const { width } =
    useWindowDimensions();

  const isDesktop = width >= 900;
  const isTablet =
    width >= 600 && width < 900;

  const contentWidth = useMemo(() => {
    if (isDesktop) {
      return Math.min(
        width - 64,
        680,
      );
    }

    if (isTablet) {
      return Math.min(
        width - 48,
        640,
      );
    }

    return width - 32;
  }, [
    width,
    isDesktop,
    isTablet,
  ]);

  const [petName, setPetName] =
    useState("");
  const [type, setType] =
    useState("");
  const [gender, setGender] =
    useState("");
  const [age, setAge] =
    useState("");
  const [size, setSize] =
    useState("");
  const [imageUrl, setImageUrl] =
    useState(null);

  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [error, setError] =
    useState("");

  const loadPetFromCache =
    useCallback(
      async () => {
        const userId =
          getAuth().currentUser
            ?.uid;

        if (!userId) {
          setError(
            "Your session has expired. Please log in again.",
          );
          setLoading(false);
          return;
        }

        if (!petId) {
          setError(
            "Pet information is missing.",
          );
          setLoading(false);
          return;
        }

        try {
          const cache =
            await getCachedProfile(
              userId,
            );

          const pet =
            cache?.pets?.find(
              (item) =>
                item.id === petId ||
                item.petId === petId,
            );

          if (!pet) {
            throw new Error(
              "This pet could not be found in your local profile.",
            );
          }

          setPetName(
            pet.petName || "",
          );

          setType(
            pet.type || "",
          );

          setGender(
            pet.gender || "",
          );

          setAge(
            pet.age !== undefined &&
              pet.age !== null
              ? String(pet.age)
              : "",
          );

          setSize(
            pet.size || "",
          );

          setImageUrl(
            pet.imageUrl || null,
          );
        } catch (err) {
          console.error(
            "Failed to load pet from cache:",
            err,
          );

          setError(
            err?.message ||
              "Unable to load this pet.",
          );
        } finally {
          setLoading(false);
        }
      },
      [petId],
    );

  useEffect(() => {
    loadPetFromCache();
  }, [loadPetFromCache]);

  const selectImage = async () => {
    try {
      setError("");

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError(
          "Photo library permission is required.",
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
          },
        );

      if (
        !result.canceled &&
        result.assets?.[0]?.uri
      ) {
        setImageUrl(
          result.assets[0].uri,
        );
      }
    } catch (err) {
      console.error(
        "Pet image selection failed:",
        err,
      );

      setError(
        "Unable to select the pet picture.",
      );
    }
  };

  const validate = () => {
    if (!petName.trim()) {
      return "Please enter your pet's name.";
    }

    if (!type) {
      return "Please select your pet type.";
    }

    if (!gender) {
      return "Please select your pet's gender.";
    }

    const numericAge =
      Number(age);

    if (
      !Number.isInteger(
        numericAge,
      ) ||
      numericAge < 0 ||
      numericAge > 100
    ) {
      return "Please enter a valid pet age.";
    }

    if (!size) {
      return "Please select your pet's size.";
    }

    return null;
  };

  const handleDone = async () => {
    const validationError =
      validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    const userId =
      getAuth().currentUser
        ?.uid;

    if (!userId) {
      setError(
        "Your session has expired. Please log in again.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updatedPet =
        await updateUserPet(
          userId,
          petId,
          {
            petName:
              petName.trim(),
            type,
            gender,
            age: Number(age),
            size,
            imageUrl:
              imageUrl || null,
          },
        );

      if (!updatedPet) {
        throw new Error(
          "Pet could not be updated.",
        );
      }

      await updateCachedPet(
        userId,
        petId,
        updatedPet,
      );

      navigation.goBack();
    } catch (err) {
      console.error(
        "Pet update failed:",
        err,
      );

      setError(
        err?.message ||
          "Unable to update your pet. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator
          size="large"
          className="text-primary"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center border-b border-border-subtle bg-background px-4 py-4">
        <Pressable
          onPress={() =>
            navigation.goBack()
          }
          className="h-10 w-10 items-center justify-center rounded-xl bg-surface"
        >
          <Ionicons
            name="arrow-back"
            size={21}
            className="text-text-primary"
          />
        </Pressable>

        <View className="ml-3 flex-1">
          <Text className="text-lg font-extrabold text-text-primary">
            Edit Pet
          </Text>

          <Text className="mt-0.5 text-xs text-text-secondary">
            Update your pet's information
          </Text>
        </View>

        <Pressable
          onPress={handleDone}
          disabled={saving}
          className="rounded-xl bg-primary px-4 py-2.5"
          style={{
            opacity: saving
              ? 0.6
              : 1,
          }}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              className="text-text-primary"
            />
          ) : (
            <Text className="font-bold text-text-primary">
              Done
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal:
            isDesktop ? 32 : 16,
          paddingTop:
            isDesktop ? 40 : 24,
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
                onPress={
                  selectImage
                }
                className="h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-surface-icon"
              >
                {imageUrl ? (
                  <Image
                    source={{
                      uri: imageUrl,
                    }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons
                    name="paw-outline"
                    size={40}
                    className="text-icon-muted"
                  />
                )}
              </Pressable>

              <Pressable
                onPress={
                  selectImage
                }
                className="mt-3"
              >
                <Text className="font-semibold text-primary">
                  Change pet picture
                </Text>
              </Pressable>
            </View>

            <View className="mt-8">
              <Text className="mb-2 text-sm font-semibold text-text-primary">
                Pet name
              </Text>

              <TextInput
                value={petName}
                onChangeText={
                  setPetName
                }
                placeholder="Enter your pet's name"
                placeholderTextColor={
                  colors[
                    "text-placeholder"
                  ]
                }
                className="min-h-[56px] rounded-2xl border border-border bg-surface-elevated px-4 text-base text-text-primary"
              />
            </View>

            <DropdownField
              label="Pet type"
              value={type}
              options={TYPE_OPTIONS}
              placeholder="Select pet type"
              onChange={setType}
            />

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
                placeholderTextColor={
                  colors[
                    "text-placeholder"
                  ]
                }
                keyboardType="number-pad"
                className="min-h-[56px] rounded-2xl border border-border bg-surface-elevated px-4 text-base text-text-primary"
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
              onPress={
                handleDone
              }
              disabled={saving}
              className="mt-3 min-h-[56px] items-center justify-center rounded-2xl bg-primary"
              style={{
                opacity: saving
                  ? 0.6
                  : 1,
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