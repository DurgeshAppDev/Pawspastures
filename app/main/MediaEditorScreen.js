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

import AsyncStorage from "@react-native-async-storage/async-storage";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../src/theme";

import MediaTextToolbar from "../../src/components/media/MediaTextToolbar";

const isWeb = Platform.OS === "web";

const MAX_STORY_VIDEO_DURATION = 15;

const PREVIEW_HEIGHT = 500;

const STORY_DRAFT_KEY = "@paws_pastures_story_draft";

const POST_DRAFT_KEY = "@paws_pastures_post_draft";

function EditorVideoPreview({ uri }) {
  const [VideoView, setVideoView] = useState(null);
  const [useVideoPlayer, setUseVideoPlayer] = useState(null);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    let mounted = true;

    if (Platform.OS === "web") {
      return undefined;
    }

    try {
      const ExpoVideo = require("expo-video");

      if (!mounted) {
        return undefined;
      }

      setVideoView(() => ExpoVideo.VideoView);
      setUseVideoPlayer(() => ExpoVideo.useVideoPlayer);
    } catch (error) {
      console.log("expo-video load error:", error);
    }

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Create native player after expo-video has loaded.
   */
  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    if (!useVideoPlayer || !uri) {
      return;
    }

    try {
      const createdPlayer = useVideoPlayer(uri, (videoPlayer) => {
        videoPlayer.loop = true;
        videoPlayer.muted = false;
      });

      setPlayer(createdPlayer);
    } catch (error) {
      console.log("Video player creation error:", error);
    }
  }, [useVideoPlayer, uri]);

  /*
   * Play native video.
   */
  useEffect(() => {
    if (!player) {
      return;
    }

    try {
      player.play();
    } catch (error) {
      console.log("Video play error:", error);
    }
  }, [player]);

  /*
   * WEB
   */
  if (Platform.OS === "web") {
    return (
      <video
        src={uri}
        autoPlay
        loop
        muted={false}
        controls
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    );
  }

  /*
   * NATIVE
   */
  if (VideoView && player) {
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

  return (
    <View className="flex-1 items-center justify-center bg-surface">
      <Ionicons
        name="videocam-outline"
        size={42}
        color={colors["text-secondary"]}
      />

      <Text className="mt-3 text-[14px] text-text-secondary">
        Preparing video...
      </Text>
    </View>
  );
}

/* =========================================================
   MAIN SCREEN
   ========================================================= */

export default function MediaEditorScreen({ navigation, route }) {
  const params = route?.params || {};

  const mode = params.mode || "story";

  const [mediaUri, setMediaUri] = useState(params.mediaUri || null);

  const mediaType = params.mediaType || "image";

  const petName = params.petName || "Your pet";

  const petImage = params.petImage || null;

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
    x: 40,
    y: 210,
  };

  const [textPosition, setTextPosition] = useState(initialPosition);

  const textPositionRef = useRef(initialPosition);

  const [showTextInput, setShowTextInput] = useState(false);

  /* =======================================================
     VIDEO
     ======================================================= */

  const [videoDuration, setVideoDuration] = useState(
    params.videoDuration || null,
  );

  const [checkingVideo, setCheckingVideo] = useState(mediaType === "video");

  const [isTrimming, setIsTrimming] = useState(false);

  /* =======================================================
     OTHER STATE
     ======================================================= */

  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const [isPosting, setIsPosting] = useState(false);

  /* =======================================================
     BACK BUTTON
     ======================================================= */

  useEffect(() => {
    if (Platform.OS === "web") {
      return undefined;
    }

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

  /* =======================================================
     VIDEO DURATION
     ======================================================= */

  useEffect(() => {
    if (mediaType !== "video") {
      setCheckingVideo(false);
      return undefined;
    }

    /*
     * If the previous screen already supplied duration,
     * use it immediately.
     */
    if (params.videoDuration && Number.isFinite(Number(params.videoDuration))) {
      setVideoDuration(Number(params.videoDuration));

      setCheckingVideo(false);

      return undefined;
    }

    /*
     * Web
     */
    if (Platform.OS === "web") {
      let mounted = true;

      const timer = setTimeout(() => {
        if (!mounted) {
          return;
        }

        /*
         * We cannot reliably inspect an arbitrary local
         * file URI here without creating a video element.
         */
        try {
          const video = document.createElement("video");

          video.preload = "metadata";

          video.onloadedmetadata = () => {
            if (!mounted) {
              return;
            }

            if (Number.isFinite(video.duration) && video.duration > 0) {
              setVideoDuration(video.duration);
            }

            setCheckingVideo(false);
          };

          video.onerror = () => {
            if (mounted) {
              setCheckingVideo(false);
            }
          };

          video.src = mediaUri;
        } catch (error) {
          console.log("Web video duration error:", error);

          setCheckingVideo(false);
        }
      }, 100);

      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    }

    /*
     * Native
     *
     * Load expo-video dynamically so Web does not attempt
     * to initialize the native module.
     */
    let mounted = true;

    let player = null;

    try {
      const ExpoVideo = require("expo-video");

      if (!ExpoVideo || !ExpoVideo.useVideoPlayer) {
        setCheckingVideo(false);

        return undefined;
      }

      player = ExpoVideo.useVideoPlayer(mediaUri, (videoPlayer) => {
        videoPlayer.muted = true;
      });

      const checkDuration = () => {
        try {
          const duration = player?.duration;

          if (duration && Number.isFinite(duration) && duration > 0) {
            if (mounted) {
              setVideoDuration(duration);

              setCheckingVideo(false);
            }
          }
        } catch (error) {
          console.log("Native duration error:", error);

          if (mounted) {
            setCheckingVideo(false);
          }
        }
      };

      checkDuration();

      const timer = setInterval(checkDuration, 500);

      return () => {
        mounted = false;
        clearInterval(timer);
      };
    } catch (error) {
      console.log("expo-video duration load error:", error);

      setCheckingVideo(false);

      return undefined;
    }
  }, [mediaUri, mediaType, params.videoDuration]);

  /* =======================================================
     DRAG TEXT
     ======================================================= */

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

        const safeX = Math.max(0, Math.min(nextX, 280));

        const safeY = Math.max(
          0,
          Math.min(nextY, PREVIEW_HEIGHT - selectedTextSize - 30),
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

  /*
   * Keep ref synchronized with state.
   */
  useEffect(() => {
    textPositionRef.current = textPosition;
  }, [textPosition]);

  /* =======================================================
     TRIM VIDEO
     ======================================================= */

  const openVideoTrimmer = useCallback(() => {
    if (!mediaUri) {
      return;
    }

    /*
     * Web
     *
     * There is intentionally no native trimmer here.
     * The native VideoTrim module must never be loaded
     * on Web.
     */
    if (Platform.OS === "web") {
      Alert.alert(
        "Video trimming",
        "Video trimming is currently available on Android and iOS. On Web, please select a video that is already 15 seconds or shorter.",
      );

      return;
    }

    /*
     * Native dynamic import.
     */
    try {
      setIsTrimming(true);

      const ReactNative = require("react-native");

      const NativeModules = ReactNative.NativeModules;

      const NativeEventEmitter = ReactNative.NativeEventEmitter;

      /*
       * VideoTrim must be installed and available
       * in the native development build.
       */
      const VideoTrim = NativeModules?.VideoTrim;

      if (!VideoTrim) {
        setIsTrimming(false);

        Alert.alert(
          "Video trimmer unavailable",
          "The native video trimming module is not installed in the current development build.",
        );

        return;
      }

      /*
       * Different versions of react-native-video-trim
       * expose showEditor differently.
       */
      let showEditorFunction = null;

      try {
        const VideoTrimPackage = require("react-native-video-trim");

        showEditorFunction =
          VideoTrimPackage?.showEditor || VideoTrimPackage?.default?.showEditor;
      } catch (error) {
        console.log("VideoTrim package load error:", error);
      }

      if (typeof showEditorFunction !== "function") {
        setIsTrimming(false);

        Alert.alert(
          "Video trimmer unavailable",
          "The video trimming package is missing or its native API is unavailable.",
        );

        return;
      }

      /*
       * Listen for trimming result.
       */
      const emitter = new NativeEventEmitter(VideoTrim);

      const subscription = emitter.addListener("VideoTrim", (event) => {
        if (!event) {
          return;
        }

        if (event.name === "onFinishTrimming") {
          const outputPath = event.outputPath;

          if (outputPath) {
            setMediaUri(outputPath);

            setVideoDuration(MAX_STORY_VIDEO_DURATION);

            setIsTrimming(false);

            Alert.alert(
              "Video trimmed",
              "Your video is now ready for your story.",
            );
          } else {
            setIsTrimming(false);
          }

          subscription.remove();

          return;
        }

        if (event.name === "onCancel" || event.name === "onCancelTrimming") {
          setIsTrimming(false);

          subscription.remove();

          return;
        }

        if (event.name === "onError") {
          console.log("Video trim error:", event);

          setIsTrimming(false);

          subscription.remove();

          Alert.alert(
            "Trim failed",
            event.message || "Unable to trim the video.",
          );
        }
      });

      /*
       * Open native editor.
       *
       * maxDuration is milliseconds.
       */
      showEditorFunction(mediaUri, {
        type: "video",

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

      setIsTrimming(false);

      Alert.alert(
        "Unable to trim video",
        "The video trimming tool could not be opened.",
      );
    }
  }, [mediaUri]);

  /* =======================================================
     ADD TEXT
     ======================================================= */

  const handleAddText = useCallback(() => {
    setShowTextInput(true);
  }, []);

  /* =======================================================
     EDITOR DATA
     ======================================================= */

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

  /* =======================================================
     SAVE DRAFT
     ======================================================= */

  const handleSaveDraft = useCallback(async () => {
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
  }, [mode, createEditorData]);

  /* =======================================================
     POST
     ======================================================= */

  const handlePost = useCallback(async () => {
    if (isPosting) {
      return;
    }

    if (!mediaUri) {
      Alert.alert("Media required", "Please select a photo or video.");

      return;
    }

    /*
     * Story video duration validation.
     */
    if (
      mode === "story" &&
      mediaType === "video" &&
      videoDuration &&
      videoDuration > MAX_STORY_VIDEO_DURATION
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

      /* ==========================================
           STORY
           ========================================== */

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
              onPress: () => {
                navigation.navigate("MainTabs");
              },
            },
          ],
        );

        return;
      }

      /* ==========================================
           POST
           ========================================== */

      navigation.navigate("NewPost", {
        editedPost: createEditorData(),
      });
    } catch (error) {
      console.log("Post error:", error);

      Alert.alert(
        "Unable to post",
        error?.message || "Something went wrong while posting.",
      );
    } finally {
      setIsPosting(false);
    }
  }, [
    isPosting,
    mediaUri,
    mode,
    mediaType,
    videoDuration,
    petName,
    petImage,
    text,
    selectedTextColor,
    selectedTextSize,
    isBold,
    isItalic,
    isUnderline,
    textAlign,
    navigation,
    openVideoTrimmer,
    createEditorData,
  ]);

  /* =======================================================
     NO MEDIA
     ======================================================= */

  if (!mediaUri) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="images-outline"
            size={54}
            color={colors["text-secondary"]}
          />

          <Text className="mt-4 text-center text-[18px] font-bold text-text-primary">
            No media selected
          </Text>

          <Text className="mt-2 text-center text-[14px] text-text-secondary">
            Please select a photo or video before opening the editor.
          </Text>

          <Pressable
            onPress={() => navigation.goBack()}
            className="mt-6 h-[48px] min-w-[150px] items-center justify-center rounded-[13px] bg-primary px-5"
          >
            <Text className="text-[15px] font-bold text-white">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /* =======================================================
     SCREEN
     ======================================================= */

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* =================================================
            HEADER
            ================================================= */}

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

        {/* =================================================
            CONTENT
            ================================================= */}

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 35,
          }}
        >
          {/* =================================================
              MEDIA PREVIEW
              ================================================= */}

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

            {/* ===============================================
                DRAGGABLE TEXT
                =============================================== */}

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

          {/* =================================================
              VIDEO INFORMATION
              ================================================= */}

          {mode === "story" && mediaType === "video" && (
            <View className="mx-4 mt-4 rounded-[14px] border border-border bg-surface p-4">
              <View className="flex-row items-center">
                <Ionicons
                  name="videocam-outline"
                  size={23}
                  color={colors.primary}
                />

                <View className="ml-3 flex-1">
                  <Text className="text-[15px] font-bold text-text-primary">
                    Story video
                  </Text>

                  <Text className="mt-1 text-[13px] text-text-secondary">
                    Maximum duration: 15 seconds
                  </Text>

                  {videoDuration ? (
                    <Text className="mt-1 text-[13px] text-text-secondary">
                      Current duration: {videoDuration.toFixed(1)}s
                    </Text>
                  ) : checkingVideo ? (
                    <Text className="mt-1 text-[13px] text-text-secondary">
                      Checking video duration...
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          )}

          {/* =================================================
              LONG VIDEO WARNING
              ================================================= */}

          {mode === "story" &&
            mediaType === "video" &&
            videoDuration > MAX_STORY_VIDEO_DURATION && (
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
                  disabled={isTrimming}
                  className="mt-3 h-[46px] flex-row items-center justify-center rounded-[11px] bg-primary"
                >
                  <Ionicons name="cut-outline" size={21} color={colors.white} />

                  <Text className="ml-2 text-[14px] font-bold text-white">
                    {isTrimming ? "Opening..." : "Trim Video"}
                  </Text>
                </Pressable>
              </View>
            )}

          {/* =================================================
              TEXT INPUT
              ================================================= */}

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

          {/* =================================================
              TEXT TOOLBAR
              ================================================= */}

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

          {/* =================================================
              POST BUTTON
              ================================================= */}

          <Pressable
            onPress={handlePost}
            disabled={isPosting || isTrimming || checkingVideo}
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

          {/* =================================================
              WEB TRIMMING INFORMATION
              ================================================= */}

          {Platform.OS === "web" &&
            mode === "story" &&
            mediaType === "video" &&
            videoDuration > MAX_STORY_VIDEO_DURATION && (
              <View className="mx-4 mt-3 rounded-[12px] bg-surface-elevated p-3">
                <Text className="text-center text-[12px] text-text-secondary">
                  Video trimming is available on Android and iOS. On Web, please
                  choose a video that is already 15 seconds or shorter.
                </Text>
              </View>
            )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
