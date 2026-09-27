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
  Platform,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";

import SelectDropdown from "../../src/components/SelectDropdown";
import { saveUserDetails } from "../../src/services/OnboardingServices";
import { colors } from "../../src/theme";

const GENDER_OPTIONS = [
  {
    label: "Male",
    value: "male",
  },
  {
    label: "Female",
    value: "female",
  },
  {
    label: "Other",
    value: "other",
  },
  {
    label: "Prefer not to say",
    value: "prefer_not_to_say",
  },
];

const AGE_OPTIONS = Array.from({ length: 63 }, (_, index) => {
  const age = index + 18;

  return {
    label: `${age}`,
    value: `${age}`,
  };
});

const INTEREST_OPTIONS = [
  {
    label: "Pet Lover",
    value: "pet_lover",
  },
  {
    label: "Photography",
    value: "photography",
  },
  {
    label: "Travel",
    value: "travel",
  },
  {
    label: "Fitness",
    value: "fitness",
  },
  {
    label: "Music",
    value: "music",
  },
  {
    label: "Food",
    value: "food",
  },
  {
    label: "Nature",
    value: "nature",
  },
  {
    label: "Gaming",
    value: "gaming",
  },
  {
    label: "Movies",
    value: "movies",
  },
  {
    label: "Reading",
    value: "reading",
  },
  {
    label: "Art",
    value: "art",
  },
  {
    label: "Cooking",
    value: "cooking",
  },
];

export default function AboutYouScreen({ navigation }) {
  const auth = getAuth();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [interests, setInterests] = useState([]);
  const [saving, setSaving] = useState(false);

  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to select your profile photo.",
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
      setProfileImage(result.assets[0].uri);
    }
  };

  const toggleInterest = (interest) => {
    setInterests((current) => {
      const exists = current.includes(interest);

      if (exists) {
        return current.filter((item) => item !== interest);
      }

      return [...current, interest];
    });
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter your name.");
      return false;
    }

    if (!age) {
      Alert.alert("Required", "Please select your age.");
      return false;
    }

    if (!gender) {
      Alert.alert("Required", "Please select your gender.");
      return false;
    }

    if (!location.trim()) {
      Alert.alert("Required", "Please enter your location.");
      return false;
    }

    if (!bio.trim()) {
      Alert.alert("Required", "Please write a short bio.");
      return false;
    }

    if (interests.length === 0) {
      Alert.alert("Required", "Please select at least one interest.");
      return false;
    }

    return true;
  };

  const handleFinish = async () => {
    if (!validateForm()) {
      return;
    }

    const userId = auth.currentUser?.uid;

    if (!userId) {
      Alert.alert("Session expired", "Please login again.");
      return;
    }

    try {
      setSaving(true);

      await saveUserDetails(userId, {
        name: name.trim(),
        age: Number(age),
        gender,
        location: location.trim(),
        bio: bio.trim(),
        interests,
        profileImage: profileImage || null,
      });

      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Main",
          },
        ],
      });
    } catch (error) {
      console.error("ABOUT YOU SAVE ERROR:", error);

      Alert.alert(
        "Unable to save",
        error?.message ||
          "Your profile could not be completed. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const isWeb = Platform.OS === "web";

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: colors.background,
      }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: isWeb ? 32 : 20,
          paddingTop: isWeb ? 40 : 24,
          paddingBottom: 50,
          alignItems: isWeb ? "center" : "stretch",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            width: "100%",
            maxWidth: isWeb ? 620 : undefined,
          }}
        >
          {/* HEADER */}

          <Text
            className="text-3xl font-bold"
            style={{
              color: colors["text-primary"],
            }}
          >
            About you
          </Text>

          <Text
            className="mt-2 text-base"
            style={{
              color: colors["text-secondary"],
            }}
          >
            Tell the community a little about yourself.
          </Text>

          {/* PROFILE PHOTO */}

          <View className="mt-7 items-center">
            <Pressable onPress={pickProfileImage} className="relative">
              <View
                className="h-[112px] w-[112px] items-center justify-center rounded-full border-2"
                style={{
                  borderColor: colors.primary,
                  backgroundColor: colors.surface,
                }}
              >
                {profileImage ? (
                  <Image
                    source={{
                      uri: profileImage,
                    }}
                    className="h-[104px] w-[104px] rounded-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Text
                    className="text-4xl font-light"
                    style={{
                      color: colors.primary,
                    }}
                  >
                    +
                  </Text>
                )}
              </View>

              <View
                className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full"
                style={{
                  backgroundColor: colors.primary,
                }}
              >
                <Text
                  className="text-lg font-bold"
                  style={{
                    color: colors.white,
                  }}
                >
                  +
                </Text>
              </View>
            </Pressable>

            <Text
              className="mt-3 text-sm font-medium"
              style={{
                color: colors["text-secondary"],
              }}
            >
              {profileImage ? "Change profile photo" : "Add profile photo"}
            </Text>
          </View>

          {/* NAME */}

          <View className="mt-7">
            <Text
              className="mb-2 text-sm font-medium"
              style={{
                color: colors["text-secondary"],
              }}
            >
              Your name
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors["text-placeholder"]}
              className="h-[52px] rounded-xl px-4 text-base"
              style={{
                color: colors["text-primary"],
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
          </View>

          {/* AGE */}

          <View className="mt-4">
            <SelectDropdown
              label="Age"
              placeholder="Select your age"
              options={AGE_OPTIONS}
              value={age}
              onSelect={setAge}
            />
          </View>

          {/* GENDER */}

          <SelectDropdown
            label="Gender"
            placeholder="Select your gender"
            options={GENDER_OPTIONS}
            value={gender}
            onSelect={setGender}
          />

          {/* LOCATION */}

          <View className="mt-0">
            <Text
              className="mb-2 text-sm font-medium"
              style={{
                color: colors["text-secondary"],
              }}
            >
              Location
            </Text>

            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="City or area"
              placeholderTextColor={colors["text-placeholder"]}
              className="h-[52px] rounded-xl px-4 text-base"
              style={{
                color: colors["text-primary"],
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />

            <Text
              className="mt-2 text-xs"
              style={{
                color: colors["text-muted"],
              }}
            >
              Example: Ludhiana, Punjab
            </Text>
          </View>

          {/* INTERESTS */}

          <View className="mt-6">
            <View className="flex-row items-center justify-between">
              <Text
                className="text-sm font-medium"
                style={{
                  color: colors["text-secondary"],
                }}
              >
                Interests
              </Text>

              <Text
                className="text-xs"
                style={{
                  color: colors["text-muted"],
                }}
              >
                {interests.length} selected
              </Text>
            </View>

            <Text
              className="mt-1 text-xs"
              style={{
                color: colors["text-muted"],
              }}
            >
              Select things you enjoy.
            </Text>

            <View className="mt-3 flex-row flex-wrap">
              {INTEREST_OPTIONS.map((interest) => {
                const selected = interests.includes(interest.value);

                return (
                  <Pressable
                    key={interest.value}
                    onPress={() => toggleInterest(interest.value)}
                    className="mb-2 mr-2 rounded-full border px-3 py-2"
                    style={{
                      backgroundColor: selected
                        ? colors.primary
                        : colors.surface,
                      borderColor: selected ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{
                        color: selected ? colors.white : colors["text-primary"],
                      }}
                    >
                      {interest.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* BIO */}

          <View className="mt-5">
            <View className="flex-row items-center justify-between">
              <Text
                className="text-sm font-medium"
                style={{
                  color: colors["text-secondary"],
                }}
              >
                Bio
              </Text>

              <Text
                className="text-xs"
                style={{
                  color: colors["text-muted"],
                }}
              >
                {bio.length}/160
              </Text>
            </View>

            <TextInput
              value={bio}
              onChangeText={(text) => {
                if (text.length <= 160) {
                  setBio(text);
                }
              }}
              placeholder="Tell people a little about yourself..."
              placeholderTextColor={colors["text-placeholder"]}
              multiline
              textAlignVertical="top"
              className="mt-2 min-h-[120px] rounded-xl px-4 py-3 text-base"
              style={{
                color: colors["text-primary"],
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
          </View>

          {/* COMPLETE */}

          <Pressable
            disabled={saving}
            onPress={handleFinish}
            className="mt-7 h-[52px] items-center justify-center rounded-xl"
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
                style={{
                  color: colors.white,
                }}
              >
                Complete Profile
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
