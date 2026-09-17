import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  Animated,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/theme";

const storyUsers = [
  {
    userId: "user-1",
    userName: "Rahul Sharma",
    stories: [
      {
        id: "story-1",
        petName: "Max",
        petImage:
          "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600",
        storyImage:
          "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=1200",
        caption: "Morning walk with Max 🐾",
        time: "2h",
      },
      {
        id: "story-2",
        petName: "Bella",
        petImage:
          "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600",
        storyImage:
          "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=1200",
        caption: "Bella enjoying the sunshine ☀️",
        time: "1h",
      },
      {
        id: "story-3",
        petName: "Max",
        petImage:
          "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600",
        storyImage:
          "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200",
        caption: "Someone is ready for treats 😂",
        time: "45m",
      },
    ],
  },

  {
    userId: "user-2",
    userName: "Simran Kaur",
    stories: [
      {
        id: "story-4",
        petName: "Rocky",
        petImage:
          "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=600",
        storyImage:
          "https://images.unsplash.com/photo-1568572933382-74d440642117?w=1200",
        caption: "Rocky having a great day 🐶",
        time: "3h",
      },
      {
        id: "story-5",
        petName: "Coco",
        petImage:
          "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600",
        storyImage:
          "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1200",
        caption: "Coco's little adventure 🐾",
        time: "2h",
      },
    ],
  },

  {
    userId: "user-3",
    userName: "Aman Verma",
    stories: [
      {
        id: "story-6",
        petName: "Luna",
        petImage:
          "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600",
        storyImage:
          "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=1200",
        caption: "Luna says hello 👋",
        time: "4h",
      },
    ],
  },
];

export default function StoryViewerScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();

  const initialStoryId = route?.params?.storyId;

  // ------------------------------------------
  // FIND INITIAL USER
  // ------------------------------------------

  const initialUserIndex = storyUsers.findIndex((user) =>
    user.stories.some((story) => story.id === initialStoryId)
  );

  const safeUserIndex = initialUserIndex >= 0 ? initialUserIndex : 0;

  // ------------------------------------------
  // FIND INITIAL STORY
  // ------------------------------------------

  const initialStoryIndex = (() => {
    const user = storyUsers[safeUserIndex];

    if (!user) {
      return 0;
    }

    const index = user.stories.findIndex(
      (story) => story.id === initialStoryId
    );

    return index >= 0 ? index : 0;
  })();

  // ------------------------------------------
  // STATE
  // ------------------------------------------

  const [userIndex, setUserIndex] = useState(safeUserIndex);
  const [storyIndex, setStoryIndex] = useState(initialStoryIndex);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [paused, setPaused] = useState(false);

  // ------------------------------------------
  // PROGRESS
  // ------------------------------------------

  const progress = useRef(new Animated.Value(0)).current;

  const animationRef = useRef(null);

  // How much time has already been consumed.
  const elapsedRef = useRef(0);

  // Timestamp when the current running animation started.
  const startTimeRef = useRef(null);

  // ------------------------------------------
  // CURRENT STORY
  // ------------------------------------------

  const currentUser = storyUsers[userIndex];
  const currentStory = currentUser?.stories[storyIndex];

  if (!currentUser || !currentStory) {
    return null;
  }

  const totalStories = currentUser.stories.length;

  // ------------------------------------------
  // RESET STORY STATE
  // ------------------------------------------

  const resetStoryState = () => {
    setLiked(false);
    setComment("");
    setPaused(false);
  };

  // ------------------------------------------
  // NEXT STORY
  // ------------------------------------------

  const goNext = () => {
    if (storyIndex < currentUser.stories.length - 1) {
      setStoryIndex((previous) => previous + 1);
      resetStoryState();
      return;
    }

    if (userIndex < storyUsers.length - 1) {
      setUserIndex((previous) => previous + 1);
      setStoryIndex(0);
      resetStoryState();
      return;
    }

    navigation.goBack();
  };

  // ------------------------------------------
  // PREVIOUS STORY
  // ------------------------------------------

  const goPrevious = () => {
    if (storyIndex > 0) {
      setStoryIndex((previous) => previous - 1);
      resetStoryState();
      return;
    }

    if (userIndex > 0) {
      const previousUser = storyUsers[userIndex - 1];

      setUserIndex((previous) => previous - 1);
      setStoryIndex(previousUser.stories.length - 1);
      resetStoryState();
    }
  };

  // ------------------------------------------
  // START / RESUME PROGRESS
  // ------------------------------------------

  const startProgress = (duration) => {
    if (duration <= 0) {
      goNext();
      return;
    }

    startTimeRef.current = Date.now();

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    });

    animationRef.current = animation;

    animation.start(({ finished }) => {
      if (!finished) {
        return;
      }

      elapsedRef.current = 5000;
      animationRef.current = null;
      startTimeRef.current = null;

      goNext();
    });
  };

  // ------------------------------------------
  // STORY CHANGE
  // ------------------------------------------

  useEffect(() => {
    // Stop previous animation.
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }

    // Reset progress.
    progress.setValue(0);

    elapsedRef.current = 0;
    startTimeRef.current = null;

    // Always start a newly selected story.
    setPaused(false);

    startProgress(5000);

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }

      startTimeRef.current = null;
    };
  }, [userIndex, storyIndex]);

  // ------------------------------------------
  // PAUSE / RESUME
  // ------------------------------------------

  useEffect(() => {
    // Don't do anything during initial story setup.
    if (!animationRef.current && !paused) {
      return;
    }

    if (paused) {
      // Calculate how much time has passed
      // since the animation started/resumed.
      if (startTimeRef.current) {
        const runningTime = Date.now() - startTimeRef.current;

        elapsedRef.current = Math.min(
          5000,
          elapsedRef.current + runningTime
        );
      }

      startTimeRef.current = null;

      // Freeze animation exactly where it is.
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }

      return;
    }

    // ------------------------------------------
    // RESUME
    // ------------------------------------------

    const remainingTime = Math.max(
      5000 - elapsedRef.current,
      0
    );

    if (remainingTime <= 0) {
      goNext();
      return;
    }

    startProgress(remainingTime);
  }, [paused]);

  // ------------------------------------------
  // LONG PRESS
  // ------------------------------------------

  const handleStoryLongPress = () => {
    setPaused(true);
  };

  const handleStoryRelease = () => {
    setPaused(false);
  };

  // ------------------------------------------
  // COMMENT
  // ------------------------------------------

  const sendComment = () => {
    const value = comment.trim();

    if (!value) {
      return;
    }

    // Firebase comment functionality will be added later.

    setComment("");
  };

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  return (
    <View className="flex-1 bg-background">
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
      />

      {/* ========================================
          STORY IMAGE
      ======================================== */}

      <Image
        source={{ uri: currentStory.storyImage }}
        className="absolute inset-0 h-full w-full"
        resizeMode="cover"
      />

      {/* Theme overlay */}
      <View className="absolute inset-0 bg-background/20" />

      {/* ========================================
          TOP HEADER
      ======================================== */}

      <View
        className="absolute left-0 right-0"
        style={{
          top: Math.max(insets.top, 12),
        }}
      >
        {/* Progress bars */}

        <View className="flex-row gap-1.5 px-3">
          {currentUser.stories.map((story, index) => {
            const isPrevious = index < storyIndex;
            const isCurrent = index === storyIndex;

            return (
              <View
                key={story.id}
                className="h-[4px] flex-1 overflow-hidden rounded-full bg-border"
              >
                {isPrevious && (
                  <View className="h-full w-full bg-primary" />
                )}

                {isCurrent && (
                  <Animated.View
                    className="h-full bg-primary"
                    style={{
                      width: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    }}
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* Header card */}

        <View className="mx-3 mt-3 flex-row items-center rounded-2xl border border-border bg-surface px-3 py-2.5">
          {/* Pet image */}

          <View className="h-[46px] w-[46px] overflow-hidden rounded-full border-2 border-primary bg-surface-icon">
            <Image
              source={{ uri: currentStory.petImage }}
              className="h-full w-full"
              resizeMode="cover"
            />
          </View>

          {/* User + Pet */}

          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text className="text-[15px] font-extrabold text-text-primary">
                {currentUser.userName}
              </Text>

              <Text className="mx-2 text-[13px] text-text-muted">
                •
              </Text>

              <Text className="text-[14px] font-semibold text-primary">
                {currentStory.petName}
              </Text>
            </View>

            <Text className="mt-1 text-[12px] font-medium text-text-muted">
              {currentStory.time}
            </Text>
          </View>

          {/* Close */}

          <Pressable
            onPress={() => navigation.goBack()}
            className="h-[40px] w-[40px] items-center justify-center rounded-full border border-border bg-surface-elevated"
          >
            <Ionicons
              name="close"
              size={25}
              color={colors["icon-muted"]}
            />
          </Pressable>
        </View>
      </View>

      {/* ========================================
          LEFT STORY AREA
          TAP = PREVIOUS
          LONG PRESS = PAUSE
      ======================================== */}

      <Pressable
        onPress={goPrevious}
        onLongPress={handleStoryLongPress}
        onPressOut={handleStoryRelease}
        delayLongPress={250}
        className="absolute left-0 top-0 w-[35%]"
        style={{
          bottom: 175,
        }}
      />

      {/* ========================================
          RIGHT STORY AREA
          TAP = NEXT
          LONG PRESS = PAUSE
      ======================================== */}

      <Pressable
        onPress={goNext}
        onLongPress={handleStoryLongPress}
        onPressOut={handleStoryRelease}
        delayLongPress={250}
        className="absolute right-0 top-0 w-[65%]"
        style={{
          bottom: 175,
        }}
      />

      {/* ========================================
          PAUSED INDICATOR
      ======================================== */}

      {paused && (
        <View
          className="absolute left-1/2 top-1/2 items-center justify-center rounded-full border border-border bg-surface-elevated"
          style={{
            marginLeft: -28,
            marginTop: -28,
            height: 56,
            width: 56,
          }}
        >
          <Ionicons
            name="pause"
            size={26}
            color={colors.primary}
          />
        </View>
      )}

      {/* ========================================
          CAPTION
      ======================================== */}

      <View
        className="absolute left-4 right-4"
        style={{
          bottom: 145 + insets.bottom,
        }}
      >
        <View className="self-start max-w-[90%] rounded-2xl border border-border bg-surface px-4 py-3">
          <Text className="text-[14px] font-semibold leading-[20px] text-text-primary">
            {currentStory.caption}
          </Text>
        </View>
      </View>

      {/* ========================================
          BOTTOM ACTIONS
      ======================================== */}

      <View
        className="absolute left-0 right-0 flex-row items-center px-4"
        style={{
          bottom: Math.max(insets.bottom + 22, 32),
        }}
      >
        {/* COMMENT */}

        <View className="mr-3 flex-1 flex-row items-center rounded-full border border-border bg-surface px-4">
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color={colors["icon-muted"]}
          />

          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Comment on this story..."
            placeholderTextColor={colors["text-placeholder"]}
            className="ml-2 h-[46px] flex-1 text-[13px] font-medium text-text-primary"
            returnKeyType="send"
            onSubmitEditing={sendComment}
          />

          {comment.trim().length > 0 && (
            <Pressable
              onPress={sendComment}
              className="ml-1 h-[34px] w-[34px] items-center justify-center rounded-full bg-accent"
            >
              <Ionicons
                name="arrow-up"
                size={17}
                color={colors.background}
              />
            </Pressable>
          )}
        </View>

        {/* LIKE */}

        <Pressable
          onPress={() => setLiked((previous) => !previous)}
          className="h-[46px] w-[46px] items-center justify-center rounded-full border border-border bg-surface"
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={27}
            color={
              liked
                ? colors.accent
                : colors["icon-muted"]
            }
          />
        </Pressable>
      </View>

      {/* ========================================
          STORY COUNT
      ======================================== */}

      <View
        className="absolute right-4"
        style={{
          bottom: Math.max(insets.bottom + 82, 92),
        }}
      >
        <View className="rounded-full border border-border bg-surface px-3 py-1.5">
          <Text className="text-[11px] font-bold text-text-secondary">
            {storyIndex + 1} / {totalStories}
          </Text>
        </View>
      </View>

      {/* ========================================
          PAW BRANDING
      ======================================== */}

      <View
        className="absolute items-center justify-center rounded-full border border-primary bg-surface"
        style={{
          right: 16,
          top: Math.max(insets.top + 80, 90),
          height: 38,
          width: 38,
        }}
      >
        <Ionicons
          name="paw"
          size={20}
          color={colors.primary}
        />
      </View>
    </View>
  );
}