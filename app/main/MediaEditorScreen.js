import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  Alert,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { VideoView, useVideoPlayer } from "expo-video";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { showEditor } from "react-native-video-trim";

import { colors } from "../../src/theme";

import MediaTextToolbar from "../../src/components/media/MediaTextToolbar";

const PREVIEW_HEIGHT = 500;

const MAX_STORY_VIDEO_DURATION = 15;

const STORY_DRAFT_KEY = "@paws_pastures_story_draft";

const POST_DRAFT_KEY = "@paws_pastures_post_draft";

/* ======================================================= */
/* VIDEO PREVIEW */
/* ======================================================= */

function EditorVideoPreview({ uri }) {
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
      console.log("Editor video error:", error);
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

/* ======================================================= */
/* MAIN SCREEN */
/* ======================================================= */

export default function MediaEditorScreen({ navigation, route }) {
  const params = route?.params || {};

  const mode = params.mode || "story";

  const [mediaUri, setMediaUri] = useState(params.mediaUri || null);

  const mediaType = params.mediaType || "image";

  const petName = params.petName || "Your pet";

  const petImage = params.petImage || null;

  /* ===================================================== */
  /* TEXT STATE */
  /* ===================================================== */

  const [text, setText] = useState(params.overlayText || "");

  const [selectedTextColor, setSelectedTextColor] = useState(
    params.textColor || colors.white,
  );

  const [selectedTextSize, setSelectedTextSize] = useState(
    params.textSize || 24,
  );

  const [isBold, setIsBold] = useState(params.textBold ?? true);

  const [isItalic, setIsItalic] = useState(params.textItalic ?? false);

  const [isUnderline, setIsUnderline] = useState(params.textUnderline ?? false);

  const [textAlign, setTextAlign] = useState(params.textAlign || "left");

  const initialPosition = params.textPosition || {
    x: 50,
    y: 210,
  };

  const [textPosition, setTextPosition] = useState(initialPosition);

  const textPositionRef = useRef(initialPosition);

  const [showTextInput, setShowTextInput] = useState(false);

  /* ===================================================== */
  /* VIDEO */
  /* ===================================================== */

  const [videoDuration, setVideoDuration] = useState(
    params.videoDuration || null,
  );

  const [checkingVideo, setCheckingVideo] = useState(mediaType === "video");

  const [trimOpened, setTrimOpened] = useState(false);

  /* ===================================================== */
  /* OTHER */
  /* ===================================================== */

  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const [isPosting, setIsPosting] = useState(false);

  /* ===================================================== */
  /* BACK BUTTON */
  /* ===================================================== */

  useEffect(() => {
    const handleBack = () => {
      navigation.goBack();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBack,
    );

    return () => subscription.remove();
  }, [navigation]);

  /* ===================================================== */
  /* VIDEO PLAYER */
  /* ===================================================== */

  const videoPlayer = useVideoPlayer(
    mediaType === "video" ? mediaUri : null,
    (player) => {
      player.loop = true;
      player.muted = false;
    },
  );

  /* ===================================================== */
  /* VIDEO DURATION */
  /* ===================================================== */

  useEffect(() => {
    if (mediaType !== "video" || !videoPlayer) {
      setCheckingVideo(false);
      return;
    }

    const check = () => {
      try {
        const duration = videoPlayer.duration;

        if (duration && Number.isFinite(duration) && duration > 0) {
          setVideoDuration(duration);

          setCheckingVideo(false);
        }
      } catch (error) {
        console.log("Duration error:", error);

        setCheckingVideo(false);
      }
    };

    check();

    const timer = setInterval(check, 500);

    return () => clearInterval(timer);
  }, [videoPlayer, mediaType, mediaUri]);

  /* ===================================================== */
  /* DRAG TEXT */
  /* ===================================================== */

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        textPositionRef.current = textPosition;
      },

      onPanResponderMove: (_event, gesture) => {
        const nextX = textPositionRef.current.x + gesture.dx;

        const nextY = textPositionRef.current.y + gesture.dy;

        const safeX = Math.max(0, Math.min(nextX, 260));

        const safeY = Math.max(
          0,
          Math.min(nextY, PREVIEW_HEIGHT - selectedTextSize - 20),
        );

        setTextPosition({
          x: safeX,
          y: safeY,
        });
      },

      onPanResponderRelease: () => {
        textPositionRef.current = textPosition;
      },
    }),
  ).current;

  /* ===================================================== */
  /* TRIM RESULT LISTENER */
  /* ===================================================== */

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    let subscription;

    try {
      const { NativeEventEmitter, NativeModules } = require("react-native");

      const VideoTrim = NativeModules.VideoTrim;

      if (!VideoTrim) {
        return;
      }

      const emitter = new NativeEventEmitter(VideoTrim);

      subscription = emitter.addListener("VideoTrim", (event) => {
        if (!event) {
          return;
        }

        if (event.name === "onFinishTrimming") {
          const outputPath = event.outputPath;

          if (!outputPath) {
            return;
          }

          console.log("Trim completed:", outputPath);

          setMediaUri(outputPath);

          setVideoDuration(MAX_STORY_VIDEO_DURATION);

          setTrimOpened(false);

          Alert.alert(
            "Video trimmed",
            "Your video is now ready for your story.",
          );
        }

        if (event.name === "onCancel") {
          setTrimOpened(false);
        }

        if (event.name === "onCancelTrimming") {
          setTrimOpened(false);
        }

        if (event.name === "onError") {
          console.log("Video trim error:", event);

          setTrimOpened(false);

          Alert.alert(
            "Trim failed",
            event.message || "Unable to trim the video.",
          );
        }
      });
    } catch (error) {
      console.log("Video trim listener error:", error);
    }

    return () => {
      subscription?.remove();
    };
  }, []);

  /* ===================================================== */
  /* OPEN TRIMMER */
  /* ===================================================== */

  const openVideoTrimmer = useCallback(() => {
    if (!mediaUri) {
      return;
    }

    try {
      setTrimOpened(true);

      showEditor(mediaUri, {
        type: "video",

        /*
         * 15 seconds in milliseconds.
         */
        maxDuration: 15000,

        minDuration: 1000,

        theme: "dark",

        headerText: "Trim Story Video",

        cancelButtonText: "Cancel",

        saveButtonText: "Use Video",

        trimmingText: "Preparing your story video...",

        durationFormat: "mm:ss",

        enablePreciseTrimming: true,

        enableCancelTrimming: true,

        closeWhenFinish: true,

        saveToPhoto: false,

        openShareSheetOnFinish: false,

        enableEditTools: false,
      });
    } catch (error) {
      console.log("Unable to open video trimmer:", error);

      setTrimOpened(false);

      Alert.alert(
        "Unable to trim video",
        "The video trimming tool could not be opened.",
      );
    }
  }, [mediaUri]);

  /* ===================================================== */
  /* ADD TEXT */
  /* ===================================================== */

  const handleAddText = () => {
    setShowTextInput(true);
  };

  /* ===================================================== */
  /* EDITOR DATA */
  /* ===================================================== */

  const createEditorData = useCallback(
    () => ({
      mode,

      mediaUri,

      mediaType,

      petName,

      petImage,

      overlayText: text,

      textColor: selectedTextColor,

      textSize: selectedTextSize,

      textPosition: textPositionRef.current,

      textBold: isBold,

      textItalic: isItalic,

      textUnderline: isUnderline,

      textAlign,

      videoDuration,

      updatedAt: Date.now(),
    }),
    [
      mode,
      mediaUri,
      mediaType,
      petName,
      petImage,
      text,
      selectedTextColor,
      selectedTextSize,
      isBold,
      isItalic,
      isUnderline,
      textAlign,
      videoDuration,
    ],
  );

  /* ===================================================== */
  /* SAVE DRAFT */
  /* ===================================================== */

  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);

      const key = mode === "story" ? STORY_DRAFT_KEY : POST_DRAFT_KEY;

      await AsyncStorage.setItem(key, JSON.stringify(createEditorData()));

      Alert.alert("Draft saved", "Your draft has been saved on this device.");
    } catch (error) {
      console.log("Draft error:", error);

      Alert.alert("Draft error", "Unable to save your draft.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  /* ===================================================== */
  /* POST */
  /* ===================================================== */

  const handlePost = async () => {
    if (isPosting) {
      return;
    }

    if (!mediaUri) {
      Alert.alert("Media required", "Please select a photo or video.");

      return;
    }

    /*
     * IMPORTANT:
     *
     * This check happens again when the
     * user actually presses Post.
     */
    if (
      mode === "story" &&
      mediaType === "video" &&
      videoDuration &&
      videoDuration > 15
    ) {
      Alert.alert(
        "Video is too long",
        "Story videos can be a maximum of 15 seconds.",
        [
          {
            text: "Trim Video",
            onPress: openVideoTrimmer,
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
      );

      return;
    }

    try {
      setIsPosting(true);

      if (mode === "story") {
        const { addStory } = require("../../src/services/StoryStore");

        await addStory({
          userId: "current-user",

          userName: "You",

          petName,

          petImage,

          mediaType,

          mediaUri,

          caption: text,

          overlayText: text,

          overlayTextColor: selectedTextColor,

          overlayTextSize: selectedTextSize,

          overlayTextPosition: textPositionRef.current,

          overlayTextBold: isBold,

          overlayTextItalic: isItalic,

          overlayTextUnderline: isUnderline,

          overlayTextAlign: textAlign,
        });

        await AsyncStorage.removeItem(STORY_DRAFT_KEY);

        Alert.alert(
          "Story posted",
          "Your story has been posted successfully.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("MainTabs"),
            },
          ],
        );

        return;
      }

      /* ------------------------------------- */
      /* POST MODE */
      /* ------------------------------------- */

      navigation.navigate("NewPost", {
        editedPost: createEditorData(),
      });
    } catch (error) {
      console.log("Post error:", error);

      Alert.alert("Unable to post", "Something went wrong while posting.");
    } finally {
      setIsPosting(false);
    }
  };

  /* ===================================================== */
  /* SCREEN */
  /* ===================================================== */

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* =========================================== */}
        {/* HEADER */}
        {/* =========================================== */}

        <View className="h-[58px] flex-row items-center justify-between border-b border-border px-4">
          <Pressable
            onPress={() => navigation.goBack()}
            className="h-[42px] w-[42px] items-center justify-center rounded-full bg-surface-elevated"
          >
            <Ionicons name="arrow-back" size={23} color={colors.white} />
          </Pressable>

          <Text className="text-[18px] font-bold text-text-primary">
            {mode === "story" ? "Edit Story" : "Edit Post"}
          </Text>

          <Pressable
            onPress={handleSaveDraft}
            disabled={isSavingDraft}
            className="h-[42px] min-w-[70px] items-center justify-center rounded-[11px] bg-surface-elevated px-3"
          >
            <Text className="text-[13px] font-bold text-primary">
              {isSavingDraft ? "Saving..." : "Draft"}
            </Text>
          </Pressable>
        </View>

        {/* =========================================== */}
        {/* CONTENT */}
        {/* =========================================== */}

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 30,
          }}
        >
          {/* ========================================= */}
          {/* PREVIEW */}
          {/* ========================================= */}

          <View
            className="mx-3 mt-3 overflow-hidden rounded-[18px] bg-surface"
            style={{
              height: PREVIEW_HEIGHT,
            }}
          >
            {mediaType === "video" ? (
              <EditorVideoPreview uri={mediaUri} />
            ) : (
              <Image
                source={{
                  uri: mediaUri,
                }}
                className="h-full w-full"
                resizeMode="cover"
              />
            )}

            {/* ===================================== */}
            {/* DRAGGABLE TEXT */}
            {/* ===================================== */}

            {text.length > 0 && (
              <View
                {...panResponder.panHandlers}
                style={{
                  position: "absolute",

                  left: textPosition.x,

                  top: textPosition.y,

                  maxWidth: "75%",
                }}
              >
                <Text
                  style={{
                    color: selectedTextColor,

                    fontSize: selectedTextSize,

                    fontWeight: isBold ? "800" : "400",

                    fontStyle: isItalic ? "italic" : "normal",

                    textDecorationLine: isUnderline ? "underline" : "none",

                    textAlign,

                    textShadowColor: "rgba(0,0,0,0.65)",

                    textShadowOffset: {
                      width: 1,
                      height: 1,
                    },

                    textShadowRadius: 4,
                  }}
                >
                  {text}
                </Text>
              </View>
            )}
          </View>

          {/* ========================================= */}
          {/* LONG VIDEO WARNING */}
          {/* ========================================= */}

          {mode === "story" && mediaType === "video" && videoDuration > 15 && (
            <View className="mx-4 mt-4 rounded-[14px] border border-primary bg-surface p-4">
              <View className="flex-row items-center">
                <Ionicons
                  name="warning-outline"
                  size={24}
                  color={colors.primary}
                />

                <View className="ml-3 flex-1">
                  <Text className="text-[15px] font-bold text-text-primary">
                    Video is longer than 15 seconds
                  </Text>

                  <Text className="mt-1 text-[13px] text-text-secondary">
                    Trim the video before posting your story.
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={openVideoTrimmer}
                className="mt-3 h-[46px] flex-row items-center justify-center rounded-[11px] bg-primary"
              >
                <Ionicons name="cut-outline" size={21} color={colors.white} />

                <Text className="ml-2 text-[14px] font-bold text-white">
                  Trim Video
                </Text>
              </Pressable>
            </View>
          )}

          {/* ========================================= */}
          {/* TEXT INPUT */}
          {/* ========================================= */}

          {showTextInput && (
            <View className="mx-4 mt-4 rounded-[14px] border border-border bg-surface p-3">
              <View className="flex-row items-end">
                <TextInput
                  value={text}
                  onChangeText={setText}
                  autoFocus
                  multiline
                  placeholder="Write text over your media..."
                  placeholderTextColor={colors["text-placeholder"]}
                  className="min-h-[55px] flex-1 text-[16px] text-text-primary"
                />

                <Pressable
                  onPress={() => setShowTextInput(false)}
                  className="ml-2 h-[40px] w-[40px] items-center justify-center rounded-full bg-primary"
                >
                  <Ionicons name="checkmark" size={23} color={colors.white} />
                </Pressable>
              </View>
            </View>
          )}

          {/* ========================================= */}
          {/* TEXT TOOLBAR */}
          {/* ========================================= */}

          <View className="px-4">
            <MediaTextToolbar
              onAddText={handleAddText}

              textColor={selectedTextColor}
              onTextColorChange={setSelectedTextColor}

              textSize={selectedTextSize}
              onTextSizeChange={setSelectedTextSize}

              isBold={isBold}
              onBoldChange={setIsBold}

              isItalic={isItalic}
              onItalicChange={setIsItalic}

              isUnderline={isUnderline}
              onUnderlineChange={setIsUnderline}

              textAlign={textAlign}
              onTextAlignChange={setTextAlign}
            />
          </View>

          {/* ========================================= */}
          {/* POST */}
          {/* ========================================= */}

          <Pressable
            onPress={handlePost}
            disabled={isPosting || trimOpened || checkingVideo}
            className="mx-4 mt-7 h-[52px] flex-row items-center justify-center rounded-[14px] bg-primary"
          >
            <Ionicons
              name={mode === "story" ? "paper-plane-outline" : "send-outline"}
              size={21}
              color={colors.white}
            />

            <Text className="ml-2 text-[16px] font-bold text-white">
              {isPosting
                ? "Posting..."
                : mode === "story"
                  ? "Post Story"
                  : "Post"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
