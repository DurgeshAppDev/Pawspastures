import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StatusBar,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";

import { colors } from "../../src/theme";

/*
  Expected story format:

  {
    id: "story-1",
    type: "image",
    uri: "https://..."
  }

  OR

  {
    id: "story-2",
    type: "video",
    uri: "https://..."
  }

  The screen also accepts:
  - route.params.stories
  - route.params.initialIndex
*/

const IMAGE_DURATION = 5000;

function StoryVideo({ uri, isActive, onFinished, onLoading, onLoaded }) {
  const player = useVideoPlayer(uri, (videoPlayer) => {
    videoPlayer.loop = false;
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!player) return;

    const statusSubscription = player.addListener(
      "statusChange",
      ({ status }) => {
        if (status === "readyToPlay") {
          setIsReady(true);
          onLoaded?.();
        }

        if (status === "error") {
          setIsReady(false);
        }
      },
    );

    const endSubscription = player.addListener("playToEnd", () => {
      onFinished?.();
    });

    return () => {
      statusSubscription?.remove();
      endSubscription?.remove();
    };
  }, [player, onFinished, onLoaded]);

  useEffect(() => {
    if (!player) return;

    if (isActive) {
      try {
        player.currentTime = 0;
        player.play();
      } catch (error) {
        console.log("Video play error:", error);
      }
    } else {
      try {
        player.pause();
      } catch (error) {
        console.log("Video pause error:", error);
      }
    }
  }, [player, isActive]);

  return (
    <View className="absolute inset-0 items-center justify-center bg-background">
      <VideoView
        player={player}
        style={{
          width: "100%",
          height: "100%",
        }}
        contentFit="contain"
        nativeControls={false}
      />

      {!isReady && (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
}

export default function StoryViewerScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();

  const stories = useMemo(() => {
    const incomingStories = route?.params?.stories;

    if (Array.isArray(incomingStories) && incomingStories.length > 0) {
      return incomingStories;
    }

    return [];
  }, [route?.params?.stories]);

  const initialIndex = Math.max(
    0,
    Math.min(
      Number(route?.params?.initialIndex ?? 0),
      Math.max(stories.length - 1, 0),
    ),
  );

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);

  const currentStory = stories[currentIndex];

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const goPrevious = useCallback(() => {
    setImageProgress(0);

    if (currentIndex > 0) {
      setCurrentIndex((previous) => previous - 1);
    } else {
      navigation.goBack();
    }
  }, [currentIndex, navigation]);

  const goNext = useCallback(() => {
    setImageProgress(0);

    if (currentIndex < stories.length - 1) {
      setCurrentIndex((previous) => previous + 1);
    } else {
      navigation.goBack();
    }
  }, [currentIndex, stories.length, navigation]);

  /*
    Image story timer.
    Videos advance themselves through the playToEnd event.
  */
  useEffect(() => {
    if (!currentStory) return;
    if (currentStory.type === "video") return;
    if (isPaused) return;

    setImageProgress(0);

    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / IMAGE_DURATION, 1);

      setImageProgress(progress);

      if (progress >= 1) {
        clearInterval(interval);
        goNext();
      }
    }, 50);

    return () => {
      clearInterval(interval);
    };
  }, [currentIndex, currentStory, isPaused, goNext]);

  /*
    Reset progress whenever a new story opens.
  */
  useEffect(() => {
    setImageProgress(0);
    setIsPaused(false);
  }, [currentIndex]);

  if (!currentStory) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background}
        />

        <Text className="mb-5 text-lg font-semibold text-text-primary">
          No stories available
        </Text>

        <Pressable
          onPress={goBack}
          className="rounded-full bg-primary px-6 py-3"
        >
          <Text className="text-base font-bold text-background">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const storyType = currentStory.type === "video" ? "video" : "image";

  return (
    <View className="flex-1 bg-background">
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
        translucent
      />

      {/* Story content */}
      {storyType === "image" ? (
        <Image
          source={{ uri: currentStory.uri }}
          resizeMode="contain"
          className="absolute inset-0 h-full w-full bg-background"
        />
      ) : (
        <StoryVideo
          uri={currentStory.uri}
          isActive={!isPaused}
          onFinished={goNext}
        />
      )}

      {/* Dark top gradient-like overlay */}
      <View
        pointerEvents="none"
        className="absolute left-0 right-0 top-0 h-32"
        style={{
          backgroundColor: "rgba(0,0,0,0.38)",
        }}
      />

      {/* Progress bars */}
      <View
        className="absolute left-0 right-0 flex-row gap-1.5 px-3"
        style={{
          top: insets.top + 8,
        }}
      >
        {stories.map((story, index) => {
          let progress = 0;

          if (index < currentIndex) {
            progress = 1;
          } else if (index === currentIndex) {
            progress = story.type === "video" ? 0 : imageProgress;
          }

          return (
            <View
              key={story.id ?? `${index}`}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/30"
            >
              <View
                className="h-full rounded-full bg-white"
                style={{
                  width: `${Math.max(0, Math.min(progress, 1)) * 100}%`,
                }}
              />
            </View>
          );
        })}
      </View>

      {/* Header */}
      <View
        className="absolute left-0 right-0 flex-row items-center justify-between px-4"
        style={{
          top: insets.top + 24,
        }}
      >
        <View className="flex-1 flex-row items-center">
          {currentStory.avatar ? (
            <Image
              source={{ uri: currentStory.avatar }}
              className="mr-3 h-10 w-10 rounded-full"
            />
          ) : (
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-surface-elevated">
              <Ionicons name="paw" size={21} color={colors.primary} />
            </View>
          )}

          <View className="flex-1">
            <Text numberOfLines={1} className="text-base font-bold text-white">
              {currentStory.userName || "Paws & Pastures"}
            </Text>

            {currentStory.time ? (
              <Text className="mt-0.5 text-xs text-white/75">
                {currentStory.time}
              </Text>
            ) : null}
          </View>
        </View>

        <Pressable
          onPress={goBack}
          hitSlop={12}
          className="ml-3 h-11 w-11 items-center justify-center rounded-full bg-black/35"
        >
          <Ionicons name="close" size={27} color={colors.white} />
        </Pressable>
      </View>

      {/* Left/right navigation zones */}
      <View className="absolute inset-0 flex-row">
        <Pressable
          className="h-full w-[35%]"
          onPress={goPrevious}
          onLongPress={() => setIsPaused(true)}
          onPressOut={() => setIsPaused(false)}
        />

        <Pressable
          className="h-full flex-1"
          onPress={goNext}
          onLongPress={() => setIsPaused(true)}
          onPressOut={() => setIsPaused(false)}
        />
      </View>

      {/* Bottom story information */}
      {(currentStory.caption || currentStory.description) && (
        <View
          className="absolute bottom-0 left-0 right-0 px-5 pb-8"
          style={{
            paddingBottom: Math.max(insets.bottom + 20, 32),
          }}
          pointerEvents="none"
        >
          {currentStory.caption ? (
            <Text className="text-base font-semibold leading-6 text-white">
              {currentStory.caption}
            </Text>
          ) : null}

          {currentStory.description ? (
            <Text className="mt-1 text-sm leading-5 text-white/80">
              {currentStory.description}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}
