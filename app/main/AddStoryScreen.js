import React, { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  openStoryCamera,
  openStoryGallery,
} from "../../src/services/permissions";

import { colors } from "../../src/theme";

import { VideoView, useVideoPlayer } from "expo-video";

const PREVIEW_HEIGHT = 500;

const pets = [
  {
    name: "Bruno",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500",
  },
  {
    name: "Luna",
    image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=500",
  },
];

function VideoPreview({ uri }) {
  const player = useVideoPlayer(uri, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = false;
  });

  useEffect(() => {
    if (!player) {
      return;
    }

    try {
      player.play();
    } catch (error) {
      console.log("Story video preview error:", error);
    }
  }, [player]);

  return (
    <VideoView
      player={player}
      style={{
        width: "100%",
        height: "100%",
      }}
      contentFit="cover"
      nativeControls
    />
  );
}

export default function AddStoryScreen({ navigation, route }) {
  const [selectedPet, setSelectedPet] = useState("Bruno");

  const [selectedMedia, setSelectedMedia] = useState(null);

  const [mediaType, setMediaType] = useState(null);

  const [loading, setLoading] = useState(false);

  const selectedPetData = useMemo(
    () => pets.find((pet) => pet.name === selectedPet),
    [selectedPet],
  );

  /* --------------------------------------------- */
  /* RECEIVE DRAFT / RETURNED MEDIA */
  /* --------------------------------------------- */

  useEffect(() => {
    const params = route?.params || {};

    if (params.mediaUri) {
      setSelectedMedia(params.mediaUri);
    }

    if (params.mediaType) {
      setMediaType(params.mediaType);
    }
  }, [route?.params]);

  /* --------------------------------------------- */
  /* CAMERA */
  /* --------------------------------------------- */

  const handleCamera = async () => {
    try {
      setLoading(true);

      const result = await openStoryCamera();

      if (!result || result.canceled) {
        return;
      }

      /*
       * Camera is already limited to
       * 15 seconds by videoMaxDuration.
       */

      const asset = result.assets?.[0];

      if (!asset?.uri) {
        return;
      }

      setSelectedMedia(asset.uri);

      setMediaType(asset.type === "video" ? "video" : "image");
    } catch (error) {
      console.log("Camera error:", error);

      Alert.alert("Camera error", "Unable to open the camera.");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------- */
  /* GALLERY */
  /* --------------------------------------------- */

  const handleGallery = async () => {
    try {
      setLoading(true);

      const result = await openStoryGallery();

      if (!result || result.canceled) {
        return;
      }

      const asset = result.assets?.[0];

      if (!asset?.uri) {
        return;
      }

      /*
       * IMPORTANT:
       *
       * Do NOT reject long videos here.
       *
       * They are sent to MediaEditorScreen.
       *
       * If the user tries to post them,
       * MediaEditor gives the trim option.
       */

      setSelectedMedia(asset.uri);

      setMediaType(asset.type === "video" ? "video" : "image");
    } catch (error) {
      console.log("Gallery error:", error);

      Alert.alert("Gallery error", "Unable to open your gallery.");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------- */
  /* NEXT */
  /* --------------------------------------------- */

  const handleNext = () => {
    if (!selectedMedia) {
      Alert.alert("Media required", "Please select a photo or video first.");

      return;
    }

    navigation.navigate("MediaEditor", {
      mode: "story",

      mediaUri: selectedMedia,

      mediaType: mediaType || "image",

      petName: selectedPet,

      petImage: selectedPetData?.image,

      overlayText: "",

      textColor: colors.white,

      textSize: 24,

      textPosition: {
        x: 50,
        y: 210,
      },

      textBold: true,

      textItalic: false,

      textUnderline: false,

      textAlign: "left",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      {/* ----------------------------------------- */}
      {/* HEADER */}
      {/* ----------------------------------------- */}

      <View className="h-[58px] flex-row items-center border-b border-border px-4">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-[42px] w-[42px] items-center justify-center rounded-full bg-surface-elevated"
        >
          <Ionicons name="arrow-back" size={23} color={colors.white} />
        </Pressable>

        <Text className="ml-4 text-[19px] font-bold text-text-primary">
          Add Story
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      >
        {/* --------------------------------------- */}
        {/* SELECT PET */}
        {/* --------------------------------------- */}

        <View className="px-4 pt-5">
          <Text className="text-[16px] font-bold text-text-primary">
            Select Pet
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            {pets.map((pet) => {
              const active = selectedPet === pet.name;

              return (
                <Pressable
                  key={pet.name}
                  onPress={() => setSelectedPet(pet.name)}
                  className={`mr-3 items-center rounded-[15px] border p-2 ${
                    active
                      ? "border-primary bg-surface-elevated"
                      : "border-border bg-surface"
                  }`}
                >
                  <Image
                    source={{
                      uri: pet.image,
                    }}
                    className="h-[65px] w-[65px] rounded-full"
                  />

                  <Text
                    className={`mt-2 text-[13px] font-semibold ${
                      active ? "text-primary" : "text-text-secondary"
                    }`}
                  >
                    {pet.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* --------------------------------------- */}
        {/* MEDIA PREVIEW */}
        {/* --------------------------------------- */}

        <View
          className="mx-4 mt-5 overflow-hidden rounded-[18px] bg-surface"
          style={{
            height: PREVIEW_HEIGHT,
          }}
        >
          {!selectedMedia ? (
            <View className="flex-1 items-center justify-center">
              <Ionicons
                name="images-outline"
                size={55}
                color={colors["icon-muted"]}
              />

              <Text className="mt-4 text-[16px] font-semibold text-text-secondary">
                Select a photo or video
              </Text>
            </View>
          ) : mediaType === "video" ? (
            <VideoPreview uri={selectedMedia} />
          ) : (
            <Image
              source={{
                uri: selectedMedia,
              }}
              className="h-full w-full"
              resizeMode="cover"
            />
          )}
        </View>

        {/* --------------------------------------- */}
        {/* MEDIA BUTTONS */}
        {/* --------------------------------------- */}

        <View className="mt-5 flex-row gap-3 px-4">
          <Pressable
            onPress={handleCamera}
            disabled={loading}
            className="h-[54px] flex-1 flex-row items-center justify-center rounded-[14px] bg-surface-elevated"
          >
            <Ionicons name="camera-outline" size={23} color={colors.primary} />

            <Text className="ml-2 text-[15px] font-bold text-text-primary">
              Camera
            </Text>
          </Pressable>

          <Pressable
            onPress={handleGallery}
            disabled={loading}
            className="h-[54px] flex-1 flex-row items-center justify-center rounded-[14px] bg-surface-elevated"
          >
            <Ionicons name="images-outline" size={23} color={colors.primary} />

            <Text className="ml-2 text-[15px] font-bold text-text-primary">
              Gallery
            </Text>
          </Pressable>
        </View>

        {/* --------------------------------------- */}
        {/* NEXT ONLY */}
        {/* --------------------------------------- */}

        <Pressable
          onPress={handleNext}
          disabled={!selectedMedia || loading}
          className={`mx-4 mt-5 h-[52px] flex-row items-center justify-center rounded-[14px] ${
            selectedMedia ? "bg-primary" : "bg-surface-elevated"
          }`}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text className="text-[16px] font-bold text-white">NEXT</Text>

              <Ionicons
                name="arrow-forward"
                size={20}
                color={colors.white}
                style={{
                  marginLeft: 8,
                }}
              />
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
