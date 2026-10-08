import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAuth } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { VideoView, useVideoPlayer } from "expo-video";

import { colors } from "../../src/theme";
import { requestGalleryPermission } from "../../src/services/permissions";
import { createUserPost } from "../../src/services/PostServices";

function SelectedVideo({ uri }) {
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = true;
    instance.muted = true;
  });

  useEffect(() => {
    player.play();
    return () => player.pause();
  }, [player]);

  return (
    <VideoView
      player={player}
      style={{ width: "100%", height: "100%" }}
      contentFit="cover"
      nativeControls
    />
  );
}

const getDurationInSeconds = (duration) => {
  const value = Number(duration);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value / 1000;
};

export default function CreatePostScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const contentWidth = isDesktop ? Math.min(width - 64, 1020) : width - 32;

  const [kind, setKind] = useState("post");
  const [media, setMedia] = useState(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [isPicking, setIsPicking] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const allowExitRef = useRef(false);

  useEffect(() => navigation.addListener("beforeRemove", (event) => {
    if (isPublishing && !allowExitRef.current) {
      event.preventDefault();
    }
  }), [navigation, isPublishing]);

  useEffect(() => {
    const editedPost = route?.params?.editedPost;
    if (!editedPost) return;

    setKind(editedPost.mode === "reel" ? "reel" : "post");
    setMedia(editedPost);
    navigation.setParams({ editedPost: undefined });
  }, [navigation, route?.params?.editedPost]);

  const chooseKind = (nextKind) => {
    if (nextKind !== kind) {
      setKind(nextKind);
      setMedia(null);
    }
    setError("");
  };

  const selectMedia = async () => {
    try {
      setError("");
      setIsPicking(true);

      if (Platform.OS !== "web") {
        const allowed = await requestGalleryPermission();
        if (!allowed) {
          setError("Allow photo and video access to choose media.");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: kind === "reel" ? ["videos"] : ["images"],
        allowsEditing: false,
        quality: 1,
        selectionLimit: 1,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      const mediaType = asset.type === "video" ? "video" : "image";

      if (kind === "reel" && mediaType !== "video") {
        setError("Choose a video to create a reel.");
        return;
      }

      setMedia({
        mediaUri: asset.uri,
        mediaType,
        videoDuration: mediaType === "video"
          ? getDurationInSeconds(asset.duration)
          : null,
      });
    } catch (pickError) {
      console.error("Media selection failed:", pickError);
      setError("Could not open your photo library. Please try again.");
    } finally {
      setIsPicking(false);
    }
  };

  const openEditor = () => {
    if (!media?.mediaUri) {
      setError(kind === "reel" ? "Choose a video before continuing." : "Choose a photo before continuing.");
      return;
    }

    navigation.navigate("MediaEditor", {
      ...media,
      mode: kind,
      overlayText: media.overlayText || "",
    });
  };

  const publish = async () => {
    if (isPublishing) return;
    if (!media?.mediaUri) {
      setError("Choose and edit your media before publishing.");
      return;
    }
    if (kind === "reel" && media.mediaType !== "video") {
      setError("Reels must be video clips.");
      return;
    }
    if (kind === "reel" && !(Number(media.videoDuration) > 0)) {
      setError("We couldn't verify this video's length. Choose another clip and try again.");
      return;
    }
    if (kind === "reel" && Number(media.videoDuration) > 30) {
      setError("Reels can be up to 30 seconds. Trim your video before publishing.");
      return;
    }

    const userId = getAuth().currentUser?.uid;
    if (!userId) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setIsPublishing(true);
      setUploadProgress(0);
      setError("");

      await createUserPost(userId, {
        ...media,
        kind,
        caption,
      }, {
        onProgress: setUploadProgress,
      });

      allowExitRef.current = true;
      navigation.navigate("MainTabs", { screen: "Profile" });
    } catch (publishError) {
      console.error("Post publishing failed:", publishError);
      setError(publishError?.message || "Unable to publish. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const options = [
    { id: "post", title: "Photo post", icon: "images-outline", subtitle: "Share a photo" },
    { id: "reel", title: "Reel", icon: "play-circle-outline", subtitle: "Video up to 30 sec" },
  ];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center border-b border-border-subtle px-4 py-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          className="h-11 w-11 items-center justify-center rounded-full bg-surface"
        >
          <Ionicons name="arrow-back" size={21} color={colors["text-primary"]} />
        </Pressable>
        <View className="ml-3 flex-1">
          <Text className="text-lg font-extrabold text-text-primary">Create</Text>
          <Text className="text-xs text-text-secondary">Share a moment with your community</Text>
        </View>
        <Pressable
          onPress={publish}
          disabled={isPublishing || !media}
          className="min-h-10 items-center justify-center rounded-full bg-primary px-4"
          style={{ opacity: isPublishing || !media ? 0.55 : 1 }}
        >
          {isPublishing ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Text className="font-bold text-background">Share</Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center", paddingHorizontal: 16, paddingVertical: 24, paddingBottom: 40 }}
      >
        <View style={{ width: contentWidth, maxWidth: "100%" }}>
          {error ? (
            <View className="mb-4 rounded-2xl border border-accent bg-surface px-4 py-3">
              <Text className="text-sm leading-5 text-text-primary">{error}</Text>
            </View>
          ) : null}

          <View className="rounded-[26px] border border-border bg-surface p-4 md:p-6">
            <Text className="text-base font-bold text-text-primary">What are you sharing?</Text>
            <View className="mt-4 flex-row rounded-2xl bg-surface-elevated p-1">
              {options.map((option) => {
                const selected = kind === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => chooseKind(option.id)}
                    className="min-h-[76px] flex-1 flex-row items-center rounded-xl px-3"
                    style={{ backgroundColor: selected ? colors.surface : "transparent" }}
                  >
                    <Ionicons name={option.icon} size={25} color={selected ? colors.primary : colors["text-secondary"]} />
                    <View className="ml-2 min-w-0 flex-1">
                      <Text className="font-bold text-text-primary">{option.title}</Text>
                      <Text className="mt-1 text-xs text-text-secondary">{option.subtitle}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-5 flex-row flex-wrap items-start gap-5">
              <View
                className="overflow-hidden rounded-2xl border border-border bg-surface-elevated"
                style={{ width: isDesktop ? 420 : "100%", height: isDesktop ? 390 : Math.min(width - 64, 390) }}
              >
                {media?.mediaUri ? (
                  media.mediaType === "video" ? (
                    <SelectedVideo uri={media.mediaUri} />
                  ) : (
                    <Image source={{ uri: media.mediaUri }} className="h-full w-full" resizeMode="cover" />
                  )
                ) : (
                  <View className="flex-1 items-center justify-center px-5">
                    <View className="h-16 w-16 items-center justify-center rounded-full bg-surface">
                      <Ionicons name={kind === "reel" ? "videocam-outline" : "image-outline"} size={30} color={colors.primary} />
                    </View>
                    <Text className="mt-4 text-center text-base font-bold text-text-primary">{kind === "reel" ? "Choose a video to get started" : "Choose a photo to get started"}</Text>
                    <Text className="mt-2 text-center text-sm leading-5 text-text-secondary">
                      {kind === "reel" ? "Choose a video and trim it to 30 seconds or less." : "Choose a photo, then add text and a caption."}
                    </Text>
                  </View>
                )}
              </View>

              <View className="min-w-0 flex-1" style={{ minWidth: isDesktop ? 300 : undefined }}>
                <Text className="text-base font-bold text-text-primary">Your media</Text>
                <Text className="mt-1 text-sm leading-5 text-text-secondary">
                  {media ? (media.mediaType === "video" ? "Video ready to edit" : "Photo ready to edit") : "No media selected"}
                </Text>

                <Pressable
                  onPress={selectMedia}
                  disabled={isPicking}
                  className="mt-4 min-h-[52px] flex-row items-center justify-center rounded-2xl border border-border bg-surface-elevated px-4"
                >
                  {isPicking ? <ActivityIndicator color={colors.primary} /> : <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />}
                  <Text className="ml-2 font-bold text-text-primary">{media ? "Choose different media" : "Choose from device"}</Text>
                </Pressable>

                {media ? (
                  <Pressable onPress={openEditor} className="mt-3 min-h-[52px] flex-row items-center justify-center rounded-2xl bg-surface px-4">
                    <Ionicons name="color-wand-outline" size={20} color={colors.primary} />
                    <Text className="ml-2 font-bold text-primary">Edit media · Trim video</Text>
                  </Pressable>
                ) : null}

                {kind === "reel" && media?.mediaType === "video" ? (
                  <View className="mt-4 rounded-2xl border border-border bg-surface-elevated p-4">
                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={20} color={colors.primary} />
                      <Text className="ml-2 font-semibold text-text-primary">Maximum reel length: 30 seconds</Text>
                    </View>
                    {media.videoDuration ? <Text className="mt-2 text-sm text-text-secondary">Selected clip: {media.videoDuration.toFixed(1)} sec</Text> : null}
                    <Text className="mt-2 text-xs leading-5 text-text-secondary">Longer clips can be trimmed in the editor before sharing.</Text>
                  </View>
                ) : null}

                <Text className="mb-2 mt-6 text-sm font-bold text-text-primary">Caption</Text>
                <View className="rounded-2xl border border-border bg-surface-elevated px-4 py-3">
                  <TextInput
                    value={caption}
                    onChangeText={setCaption}
                    placeholder="Tell the story behind this moment..."
                    placeholderTextColor={colors["text-placeholder"]}
                    multiline
                    maxLength={500}
                    textAlignVertical="top"
                    className="min-h-[112px] text-sm leading-5 text-text-primary"
                  />
                  <Text className="self-end text-xs text-text-muted">{caption.length}/500</Text>
                </View>

                <Pressable
                  onPress={publish}
                  disabled={isPublishing || !media}
                  className="mt-5 min-h-[54px] flex-row items-center justify-center rounded-2xl bg-primary px-4"
                  style={{ opacity: isPublishing || !media ? 0.55 : 1 }}
                >
                  {isPublishing ? <ActivityIndicator color={colors.background} /> : <Ionicons name="paper-plane-outline" size={19} color={colors.background} />}
                  <Text className="ml-2 font-extrabold text-background">{isPublishing ? "Publishing..." : `Share ${kind === "reel" ? "reel" : "post"}`}</Text>
                </Pressable>
                <Text className="mt-3 text-center text-xs leading-5 text-text-muted">
                  {kind === "reel" ? "Reels are stored on your profile and must be 30 seconds or shorter." : "Your photo post will appear in your profile grid."}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {isPublishing ? (
        <View className="absolute inset-0 z-50 items-center justify-center bg-background/90 px-6">
          <View className="w-full max-w-[420px] rounded-[26px] border border-border bg-surface p-6">
            <View className="h-14 w-14 items-center justify-center self-center rounded-full bg-surface-elevated">
              <Ionicons name="cloud-upload-outline" size={27} color={colors.primary} />
            </View>
            <Text className="mt-4 text-center text-lg font-extrabold text-text-primary">
              {uploadProgress >= 100 ? "Finishing your post" : media?.mediaType === "image" ? "Optimizing and uploading" : "Compressing and uploading your video"}
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-text-secondary">
              Keep this screen open while your {kind === "reel" ? "reel" : "post"} is uploaded.
            </Text>
            <View className="mt-6 h-2.5 overflow-hidden rounded-full bg-surface-elevated">
              <View
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(uploadProgress, 100)}%` }}
              />
            </View>
            <Text className="mt-3 text-center text-sm font-bold text-primary">
              {uploadProgress >= 100 ? "Saving details…" : `${uploadProgress}% uploaded`}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
