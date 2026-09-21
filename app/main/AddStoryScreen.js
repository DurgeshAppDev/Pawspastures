import React, { useState } from "react";

import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  Alert,
  StatusBar,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../src/theme";

import {
  openStoryCamera,
  openStoryGallery,
} from "../../src/services/permissions";

import {
  addStory,
  getUserActiveStoryCount,
  getStoryLimits,
} from "../../src/services/StoryStore";

export default function AddStoryScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [selectedPet, setSelectedPet] = useState("Bruno");

  const [caption, setCaption] = useState("");

  const [selectedMedia, setSelectedMedia] =
    useState(null);

  const [mediaType, setMediaType] = useState(null);

  const pets = [
    {
      id: "1",
      name: "Bruno",
      image:
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
    },

    {
      id: "2",
      name: "Luna",
      image:
        "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400",
    },
  ];

  const selectedPetData = pets.find(
    (pet) => pet.name === selectedPet
  );

  /**
   * -----------------------------------------
   * CAMERA
   * -----------------------------------------
   *
   * Can return image OR video.
   */
  const handleOpenCamera = async () => {
    const result = await openStoryCamera();

    if (!result) {
      return;
    }

    const asset = result.assets?.[0];

    if (!asset) {
      return;
    }

    setSelectedMedia(asset.uri);

    if (asset.type === "video") {
      setMediaType("video");
    } else {
      setMediaType("image");
    }
  };

  /**
   * -----------------------------------------
   * GALLERY
   * -----------------------------------------
   */
  const handleOpenGallery = async () => {
    const result = await openStoryGallery();

    if (!result) {
      return;
    }

    const asset = result.assets?.[0];

    if (!asset) {
      return;
    }

    setSelectedMedia(asset.uri);

    if (asset.type === "video") {
      setMediaType("video");
    } else {
      setMediaType("image");
    }
  };

  /**
   * -----------------------------------------
   * CREATE STORY
   * -----------------------------------------
   */
  const handleCreateStory = () => {
    if (!selectedMedia) {
      Alert.alert(
        "Add media",
        "Please take a photo/video or choose one from your gallery."
      );

      return;
    }

    const currentCount =
      getUserActiveStoryCount("current-user");

    const limits = getStoryLimits();

    const newStory = addStory({
      userId: "current-user",
      userName: "You",
      petName: selectedPet,
      petImage: selectedPetData?.image,

      mediaType,
      mediaUri: selectedMedia,

      caption,
    });

    if (currentCount >= limits.maxStories) {
      Alert.alert(
        "Story limit reached",
        "You already had 10 active stories. Your oldest story has been removed and this new story is now active."
      );
    } else {
      Alert.alert(
        "Story Posted",
        "Your story is active for 24 hours."
      );
    }

    console.log("Created story:", newStory);

    navigation.goBack();
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
      }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
      />

      {/* HEADER */}

      <View className="flex-row items-center justify-between border-b border-border px-4 pb-4 pt-3">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-70"
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={colors.white}
          />
        </Pressable>

        <Text className="text-[19px] font-extrabold text-white">
          Create Story
        </Text>

        <View className="h-11 w-11" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30 + insets.bottom,
        }}
      >
        {/* STORY PREVIEW */}

        <View className="px-4 pt-5">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-[15px] font-bold text-white">
              Story Preview
            </Text>

            <View className="rounded-full border border-border bg-surface px-3 py-1.5">
              <Text className="text-[11px] font-bold text-text-secondary">
                24 hours
              </Text>
            </View>
          </View>

          <View className="h-[390px] overflow-hidden rounded-[24px] bg-surface">
            {selectedMedia && mediaType === "video" ? (
              <View className="h-full w-full items-center justify-center bg-black">
                <Ionicons
                  name="play-circle"
                  size={64}
                  color={colors.white}
                />

                <Text className="mt-3 text-[14px] font-bold text-white">
                  Video selected
                </Text>

                <Text className="mt-1 text-[12px] text-text-secondary">
                  Video audio will be preserved
                </Text>
              </View>
            ) : (
              <Image
                source={{
                  uri:
                    selectedMedia ||
                    selectedPetData?.image,
                }}
                className="h-full w-full"
                resizeMode="cover"
              />
            )}

            {/* OVERLAY */}

            <View className="absolute inset-0 bg-black/20" />

            {/* PET */}

            <View className="absolute left-4 right-4 top-4 flex-row items-center">
              <View className="h-11 w-11 overflow-hidden rounded-full border-2 border-primary">
                <Image
                  source={{
                    uri: selectedPetData?.image,
                  }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              </View>

              <View className="ml-3">
                <Text className="text-[14px] font-bold text-white">
                  {selectedPet}
                </Text>

                <Text className="mt-0.5 text-[11px] text-text-muted">
                  Story • 24h
                </Text>
              </View>
            </View>

            {/* VIDEO INDICATOR */}

            {mediaType === "video" && (
              <View className="absolute right-4 top-4 flex-row items-center rounded-full bg-black/60 px-3 py-2">
                <Ionicons
                  name="videocam"
                  size={16}
                  color={colors.white}
                />

                <Text className="ml-1.5 text-[11px] font-bold text-white">
                  Video + Sound
                </Text>
              </View>
            )}

            {/* CAPTION */}

            {caption.length > 0 && (
              <View className="absolute bottom-7 left-4 right-4">
                <View className="self-start rounded-2xl bg-black/45 px-4 py-3">
                  <Text className="text-[15px] font-semibold text-white">
                    {caption}
                  </Text>
                </View>
              </View>
            )}

            {/* PAW */}

            <View className="absolute bottom-5 right-5 h-11 w-11 items-center justify-center rounded-full bg-primary">
              <Ionicons
                name="paw"
                size={22}
                color={colors.background}
              />
            </View>
          </View>
        </View>

        {/* CHOOSE PET */}

        <View className="px-4 pt-7">
          <Text className="mb-3 text-[15px] font-bold text-white">
            Post as
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {pets.map((pet) => {
              const selected =
                selectedPet === pet.name;

              return (
                <Pressable
                  key={pet.id}
                  onPress={() =>
                    setSelectedPet(pet.name)
                  }
                  className={`mr-3 items-center rounded-2xl border px-3 py-3 ${
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface"
                  }`}
                >
                  <View
                    className={`h-14 w-14 overflow-hidden rounded-full ${
                      selected
                        ? "border-2 border-primary"
                        : "border border-border"
                    }`}
                  >
                    <Image
                      source={{ uri: pet.image }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  </View>

                  <Text
                    className={`mt-2 text-[12px] font-bold ${
                      selected
                        ? "text-primary"
                        : "text-white"
                    }`}
                  >
                    {pet.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* MEDIA OPTIONS */}

        <View className="px-4 pt-7">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-[15px] font-bold text-white">
              Add to your story
            </Text>

            <Text className="text-[11px] font-semibold text-text-secondary">
              Photo or video
            </Text>
          </View>

          <View className="flex-row">
            {/* CAMERA */}

            <Pressable
              className="mr-3 flex-1 rounded-2xl bg-surface p-4 active:opacity-70"
              onPress={handleOpenCamera}
            >
              <View className="mb-3 h-11 w-11 items-center justify-center rounded-full bg-elevated">
                <Ionicons
                  name="camera"
                  size={23}
                  color={colors.primary}
                />
              </View>

              <Text className="text-[14px] font-bold text-white">
                Camera
              </Text>

              <Text className="mt-1 text-[11px] text-secondary">
                Photo or video
              </Text>
            </Pressable>

            {/* GALLERY */}

            <Pressable
              className="flex-1 rounded-2xl bg-surface p-4 active:opacity-70"
              onPress={handleOpenGallery}
            >
              <View className="mb-3 h-11 w-11 items-center justify-center rounded-full bg-elevated">
                <Ionicons
                  name="images"
                  size={23}
                  color={colors.primary}
                />
              </View>

              <Text className="text-[14px] font-bold text-white">
                Gallery
              </Text>

              <Text className="mt-1 text-[11px] text-secondary">
                Photo or video
              </Text>
            </Pressable>
          </View>
        </View>

        {/* CAPTION */}

        <View className="px-4 pt-7">
          <Text className="mb-3 text-[15px] font-bold text-white">
            Add a message
          </Text>

          <View className="rounded-2xl border border-border bg-surface px-4 py-3">
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Say something about your pet..."
              placeholderTextColor={colors.placeholder}
              multiline
              maxLength={120}
              className="min-h-[80px] text-[14px] text-white"
              textAlignVertical="top"
            />

            <Text className="mt-2 self-end text-[10px] text-secondary">
              {caption.length}/120
            </Text>
          </View>
        </View>

        {/* STORY LIMIT */}

        <View className="mx-4 mt-7 rounded-2xl border border-border bg-surface px-4 py-4">
          <View className="flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-elevated">
              <Ionicons
                name="albums-outline"
                size={20}
                color={colors.primary}
              />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-[13px] font-bold text-white">
                Story limit
              </Text>

              <Text className="mt-1 text-[11px] text-text-secondary">
                You can have up to 10 active stories.
                Stories disappear after 24 hours.
              </Text>
            </View>
          </View>
        </View>

        {/* CREATE STORY */}

        <View
          className="px-4 pt-7"
          style={{
            paddingBottom: Math.max(
              insets.bottom,
              12
            ),
          }}
        >
          <Pressable
            onPress={handleCreateStory}
            className="h-[52px] flex-row items-center justify-center rounded-full bg-primary active:opacity-80"
          >
            <Ionicons
              name="sparkles"
              size={19}
              color={colors.background}
            />

            <Text className="ml-2 text-[15px] font-extrabold text-background">
              Post Story
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}