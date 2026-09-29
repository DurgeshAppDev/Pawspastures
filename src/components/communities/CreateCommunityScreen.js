import React, { useMemo, useState } from "react";

import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { Ionicons } from "@expo/vector-icons";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { colors } from "../../theme";

/* =========================================================
   CONSTANTS
========================================================= */

const COMMUNITY_CATEGORIES = [
  "Dog Lovers",
  "Cat Lovers",
  "Pet Parents",
  "Training",
  "Pet Care",
  "Pet Activities",
  "Local Community",
  "Other",
];

const MAX_NAME_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 300;
const MAX_LOCATION_LENGTH = 100;
const MAX_RULES_LENGTH = 600;

/* =========================================================
   INPUT
========================================================= */

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  maxLength,
  required = false,
}) {
  return (
    <View className="mt-5">
      <View className="mb-2 flex-row items-center">
        <Text className="text-sm font-semibold text-text-primary">{label}</Text>

        {required && (
          <Text className="ml-1 text-sm font-bold text-primary">*</Text>
        )}
      </View>

      <View
        className={`rounded-2xl border border-border bg-surface px-4 ${
          multiline ? "py-3" : "h-14"
        }`}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textPlaceholder}
          multiline={multiline}
          maxLength={maxLength}
          textAlignVertical={multiline ? "top" : "center"}
          autoCorrect
          className={`text-[15px] text-text-primary ${
            multiline ? "min-h-[100px]" : "h-full"
          }`}
        />
      </View>

      {maxLength ? (
        <Text className="mt-1.5 self-end text-[11px] text-text-secondary">
          {value.length}/{maxLength}
        </Text>
      ) : null}
    </View>
  );
}

/* =========================================================
   CATEGORY
========================================================= */

function CategorySelector({ value, onChange }) {
  return (
    <View className="mt-5">
      <View className="mb-2 flex-row items-center">
        <Text className="text-sm font-semibold text-text-primary">
          Category
        </Text>

        <Text className="ml-1 text-sm font-bold text-primary">*</Text>
      </View>

      <View className="flex-row flex-wrap">
        {COMMUNITY_CATEGORIES.map((category) => {
          const selected = value === category;

          return (
            <Pressable
              key={category}
              onPress={() => onChange(category)}
              className={`mb-2 mr-2 rounded-full border px-4 py-2.5 ${
                selected
                  ? "border-primary bg-primary"
                  : "border-border bg-surface"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selected ? "text-white" : "text-text-secondary"
                }`}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* =========================================================
   PRIVACY
========================================================= */

function PrivacySelector({ value, onChange }) {
  return (
    <View className="mt-5">
      <Text className="mb-2 text-sm font-semibold text-text-primary">
        Community Privacy
      </Text>

      <View className="flex-col gap-3 md:flex-row">
        <Pressable
          onPress={() => onChange("public")}
          className={`flex-1 rounded-2xl border p-4 ${
            value === "public"
              ? "border-primary bg-surface-elevated"
              : "border-border bg-surface"
          }`}
        >
          <View className="flex-row items-center">
            <View
              className={`h-9 w-9 items-center justify-center rounded-full ${
                value === "public" ? "bg-primary" : "bg-surface-elevated"
              }`}
            >
              <Ionicons
                name="globe-outline"
                size={19}
                color={value === "public" ? colors.white : colors.iconMuted}
              />
            </View>

            <Text className="ml-2 text-sm font-bold text-text-primary">
              Public
            </Text>
          </View>

          <Text className="mt-2 text-xs leading-4 text-text-secondary">
            Anyone can discover and join this community.
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onChange("private")}
          className={`flex-1 rounded-2xl border p-4 ${
            value === "private"
              ? "border-primary bg-surface-elevated"
              : "border-border bg-surface"
          }`}
        >
          <View className="flex-row items-center">
            <View
              className={`h-9 w-9 items-center justify-center rounded-full ${
                value === "private" ? "bg-primary" : "bg-surface-elevated"
              }`}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={value === "private" ? colors.white : colors.iconMuted}
              />
            </View>

            <Text className="ml-2 text-sm font-bold text-text-primary">
              Private
            </Text>
          </View>

          <Text className="mt-2 text-xs leading-4 text-text-secondary">
            People can discover it, but joining requires approval.
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* =========================================================
   IMAGE SECTION
========================================================= */

function CommunityImagePicker({ imageUri, onPress, disabled }) {
  return (
    <View className="mt-6">
      <Text className="mb-2 text-sm font-semibold text-text-primary">
        Community Image
      </Text>

      <Pressable
        onPress={onPress}
        disabled={disabled}
        className="w-full overflow-hidden rounded-2xl border border-border bg-surface"
        style={{
          aspectRatio: 16 / 9,
        }}
      >
        {imageUri ? (
          <View className="h-full w-full">
            <Image
              source={{ uri: imageUri }}
              className="h-full w-full"
              resizeMode="cover"
            />

            <View className="absolute bottom-3 right-3 flex-row items-center rounded-full bg-background/90 px-3 py-2">
              <Ionicons
                name="camera-outline"
                size={16}
                color={colors.textPrimary}
              />

              <Text className="ml-1.5 text-xs font-semibold text-text-primary">
                Change
              </Text>
            </View>
          </View>
        ) : (
          <View className="h-full w-full items-center justify-center px-4">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-elevated">
              <Ionicons name="image-outline" size={27} color={colors.primary} />
            </View>

            <Text className="mt-3 text-center text-sm font-bold text-text-primary">
              Add community image
            </Text>

            <Text className="mt-1 text-center text-xs text-text-secondary">
              Recommended: landscape image
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

/* =========================================================
   SCREEN
========================================================= */

export default function CreateCommunityScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();

  const [imageUri, setImageUri] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [rules, setRules] = useState("");
  const [creating, setCreating] = useState(false);

  const creatorId = route?.params?.creatorId || null;

  /* =========================================================
     SUBMIT STATE
  ========================================================= */

  const canSubmit = useMemo(() => {
    return (
      name.trim().length >= 3 &&
      description.trim().length >= 10 &&
      category.length > 0 &&
      !creating
    );
  }, [name, description, category, creating]);

  /* =========================================================
     IMAGE PICKER
  ========================================================= */

  const pickCommunityImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Permission required",
            "Please allow photo library access to choose a community image.",
          );

          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("COMMUNITY IMAGE ERROR:", error);

      Alert.alert(
        "Unable to select image",
        "Please try selecting the image again.",
      );
    }
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    if (name.trim().length < 3) {
      Alert.alert(
        "Community name required",
        "Please enter a community name with at least 3 characters.",
      );

      return false;
    }

    if (description.trim().length < 10) {
      Alert.alert(
        "Description required",
        "Please add a short description of your community.",
      );

      return false;
    }

    if (!category) {
      Alert.alert(
        "Category required",
        "Please select a category for your community.",
      );

      return false;
    }

    return true;
  };

  /* =========================================================
     CREATE COMMUNITY
  ========================================================= */

  const handleCreateCommunity = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setCreating(true);

      /*
       * Firebase-ready structure.
       *
       * Later the service layer can:
       * 1. create the Firestore document
       * 2. upload coverImageUri
       * 3. replace coverImageUri with the Storage URL
       * 4. set createdAt / updatedAt
       *
       * The UI does not need to change.
       */

      const communityDraft = {
        id: null,

        name: name.trim(),

        description: description.trim(),

        category,

        location: location.trim() || null,

        coverImage: null,

        coverImageUri: imageUri || null,

        privacy,

        rules: rules.trim() || null,

        creatorId,

        memberCount: 1,

        verified: false,

        createdAt: null,

        updatedAt: null,
      };

      if (route?.params?.onCreated) {
        route.params.onCreated(communityDraft);
      }

      Alert.alert(
        "Community ready",
        "Your community details have been prepared successfully.",
        [
          {
            text: "Continue",
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.error("CREATE COMMUNITY ERROR:", error);

      Alert.alert(
        "Unable to create",
        "Something went wrong while preparing your community.",
      );
    } finally {
      setCreating(false);
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <View className="h-[68px] flex-row items-center border-b border-border bg-surface px-3">
          <Pressable
            onPress={() => navigation.goBack()}
            disabled={creating}
            className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-elevated"
          >
            <Ionicons name="arrow-back" size={23} color={colors.textPrimary} />
          </Pressable>

          <View className="ml-2 flex-1">
            <Text className="text-xl font-bold text-text-primary">
              Create Community
            </Text>

            <Text className="mt-0.5 text-xs text-text-secondary">
              Bring pet parents together
            </Text>
          </View>
        </View>

        {/* =====================================================
            SCROLL
        ===================================================== */}

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: Math.max(32, insets.bottom + 24),
          }}
        >
          {/* ===================================================
              RESPONSIVE WEB CONTAINER

              Mobile:
              full width

              Web:
              centered + max width
          =================================================== */}

          <View className="w-full self-center max-w-[1100px]">
            {/* INTRO */}

            <Text className="max-w-[760px] text-sm leading-5 text-text-secondary">
              Create a space where pet parents can connect, share experiences
              and build a community around their interests.
            </Text>

            {/* =================================================
                WEB / MOBILE FORM AREA

                Mobile  → column
                Web     → two columns
            ================================================= */}

            <View className="mt-1 flex-col md:flex-row md:gap-8">
              {/* =================================================
                  LEFT COLUMN
              ================================================= */}

              <View className="flex-1">
                <CommunityImagePicker
                  imageUri={imageUri}
                  onPress={pickCommunityImage}
                  disabled={creating}
                />

                <FormInput
                  label="Community Name"
                  required
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Chandigarh Pet Parents"
                  maxLength={MAX_NAME_LENGTH}
                />

                <FormInput
                  label="Description"
                  required
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What is this community about?"
                  multiline
                  maxLength={MAX_DESCRIPTION_LENGTH}
                />

                <CategorySelector value={category} onChange={setCategory} />
              </View>

              {/* =================================================
                  RIGHT COLUMN
              ================================================= */}

              <View className="flex-1">
                <FormInput
                  label="Location"
                  value={location}
                  onChangeText={setLocation}
                  placeholder="e.g. Ludhiana, Punjab"
                  maxLength={MAX_LOCATION_LENGTH}
                />

                <PrivacySelector value={privacy} onChange={setPrivacy} />

                <FormInput
                  label="Community Rules"
                  value={rules}
                  onChangeText={setRules}
                  placeholder="Add rules members should follow..."
                  multiline
                  maxLength={MAX_RULES_LENGTH}
                />

                {/* INFO */}

                <View className="mt-5 flex-row rounded-2xl border border-border bg-surface px-4 py-3">
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color={colors.iconMuted}
                  />

                  <Text className="ml-3 flex-1 text-xs leading-5 text-text-secondary">
                    You will become the community owner. You can manage members,
                    moderation and community settings later.
                  </Text>
                </View>
              </View>
            </View>

            {/* =================================================
                CREATE BUTTON
            ================================================= */}

            <Pressable
              onPress={handleCreateCommunity}
              disabled={!canSubmit}
              className={`mt-6 h-14 w-full flex-row items-center justify-center rounded-2xl ${
                canSubmit ? "bg-primary" : "bg-surface-elevated"
              }`}
              style={{
                marginBottom: Math.max(8, insets.bottom),
              }}
            >
              {creating ? (
                <Text className="text-base font-bold text-white">
                  Creating...
                </Text>
              ) : (
                <>
                  <Ionicons
                    name="people-outline"
                    size={20}
                    color={canSubmit ? colors.white : colors.iconMuted}
                  />

                  <Text
                    className={`ml-2 text-base font-bold ${
                      canSubmit ? "text-white" : "text-text-secondary"
                    }`}
                  >
                    Create Community
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
