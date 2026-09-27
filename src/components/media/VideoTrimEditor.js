import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

import { VideoView, useVideoPlayer } from "expo-video";
import { Ionicons } from "@expo/vector-icons";

import { showEditor } from "react-native-video-trim";

import { colors } from "../../theme";

const MAX_DURATION = 15;

/**
 * Native Android / iOS video trimming editor.
 *
 * Web uses:
 * videoTrimEditor.web.js
 *
 * Props:
 * videoUri
 * maxDuration
 * onCancel
 * onTrimComplete
 * onError
 * showCancel
 */

export default function VideoTrimEditor({
  videoUri,
  maxDuration = MAX_DURATION,
  onCancel,
  onTrimComplete,
  onError,
  showCancel = true,
}) {
  const [videoDuration, setVideoDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const playerRef = useRef(null);
  const playbackTimeoutRef = useRef(null);

  /*
   * ============================================================
   * VIDEO PLAYER
   * ============================================================
   */

  const player = useVideoPlayer(videoUri, (videoPlayer) => {
    playerRef.current = videoPlayer;

    videoPlayer.muted = false;
    videoPlayer.loop = false;
  });

  /*
   * ============================================================
   * VIDEO DURATION
   * ============================================================
   */

  useEffect(() => {
    if (!player) {
      return;
    }

    const checkDuration = () => {
      try {
        const duration = Number(player.duration);

        if (Number.isFinite(duration) && duration > 0) {
          setVideoDuration(duration);
        }
      } catch (error) {
        console.log("Video duration error:", error);
      }
    };

    checkDuration();

    const timer = setInterval(checkDuration, 300);

    return () => {
      clearInterval(timer);
    };
  }, [player]);

  /*
   * ============================================================
   * SAFE MAXIMUM
   * ============================================================
   */

  const allowedDuration = useMemo(() => {
    if (!videoDuration) {
      return maxDuration;
    }

    return Math.min(videoDuration, maxDuration);
  }, [videoDuration, maxDuration]);

  const maxStart = useMemo(() => {
    if (!videoDuration) {
      return 0;
    }

    return Math.max(0, videoDuration - allowedDuration);
  }, [videoDuration, allowedDuration]);

  /*
   * ============================================================
   * FORMAT TIME
   * ============================================================
   */

  const formatTime = useCallback((seconds) => {
    if (!Number.isFinite(seconds)) {
      return "00:00";
    }

    const totalSeconds = Math.max(0, Math.floor(seconds));

    const minutes = Math.floor(totalSeconds / 60);

    const remainingSeconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  }, []);

  /*
   * ============================================================
   * START POSITION
   * ============================================================
   */

  const changeStartPosition = useCallback(
    (value) => {
      const newStart = Math.max(0, Math.min(value, maxStart));

      setStartTime(newStart);

      try {
        const currentTime = Number(playerRef.current?.currentTime) || 0;

        playerRef.current?.seekBy?.(newStart - currentTime);
      } catch (error) {
        console.log("Video seek error:", error);
      }
    },
    [maxStart],
  );

  /*
   * ============================================================
   * PLAY SELECTED SECTION
   * ============================================================
   */

  const playSelection = useCallback(() => {
    const currentPlayer = playerRef.current;

    if (!currentPlayer) {
      return;
    }

    try {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }

      currentPlayer.currentTime = startTime;

      currentPlayer.play();

      setIsPlaying(true);

      playbackTimeoutRef.current = setTimeout(() => {
        try {
          currentPlayer.pause();

          currentPlayer.currentTime = startTime;
        } catch (error) {
          console.log("Playback stop error:", error);
        }

        setIsPlaying(false);
      }, allowedDuration * 1000);
    } catch (error) {
      console.log("Selection playback error:", error);

      setIsPlaying(false);
    }
  }, [startTime, allowedDuration]);

  /*
   * ============================================================
   * PAUSE
   * ============================================================
   */

  const pauseVideo = useCallback(() => {
    try {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }

      playerRef.current?.pause();

      setIsPlaying(false);
    } catch (error) {
      console.log("Pause error:", error);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
    };
  }, []);

  /*
   * ============================================================
   * NATIVE TRIM
   *
   * Android / iOS only.
   * ============================================================
   */

  const processVideo = useCallback(async () => {
    if (!videoUri) {
      return;
    }

    if (Platform.OS === "web") {
      return;
    }

    try {
      setIsProcessing(true);

      /*
       * No physical trimming is required when already <= 15 sec.
       */

      if (videoDuration <= maxDuration) {
        onTrimComplete?.({
          uri: videoUri,
          startTime: 0,
          endTime: videoDuration,
          duration: videoDuration,
          originalUri: videoUri,
        });

        return;
      }

      /*
       * react-native-video-trim handles the actual
       * native video processing.
       *
       * The result is delivered through the native
       * VideoTrim event listener below.
       */

      showEditor(videoUri, {
        type: "video",

        maxDuration: maxDuration * 1000,

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

        startTime: Math.round(startTime * 1000),
      });
    } catch (error) {
      console.log("Native video trimming error:", error);

      setIsProcessing(false);

      onError?.(error);

      Alert.alert(
        "Unable to trim video",
        "The video trimming tool could not be opened.",
      );
    }
  }, [
    videoUri,
    videoDuration,
    maxDuration,
    startTime,
    onTrimComplete,
    onError,
  ]);

  /*
   * ============================================================
   * NATIVE TRIM RESULT
   * ============================================================
   */

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    let subscription;

    try {
      const { NativeEventEmitter, NativeModules } = require("react-native");

      const VideoTrim = NativeModules.VideoTrim;

      if (!VideoTrim) {
        console.log("VideoTrim native module is unavailable.");

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
            setIsProcessing(false);

            onError?.(
              new Error("Video trimming finished without an output file."),
            );

            return;
          }

          const duration = Math.min(allowedDuration, maxDuration);

          setIsProcessing(false);

          onTrimComplete?.({
            uri: outputPath,
            startTime,
            endTime: startTime + duration,
            duration,
            originalUri: videoUri,
          });

          return;
        }

        if (event.name === "onCancel" || event.name === "onCancelTrimming") {
          setIsProcessing(false);

          return;
        }

        if (event.name === "onError") {
          console.log("Native video trim error:", event);

          setIsProcessing(false);

          const error = new Error(event.message || "Unable to trim the video.");

          onError?.(error);
        }
      });
    } catch (error) {
      console.log("Video trim listener error:", error);
    }

    return () => {
      subscription?.remove();
    };
  }, [
    allowedDuration,
    maxDuration,
    startTime,
    videoUri,
    onTrimComplete,
    onError,
  ]);

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (!videoDuration) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-5">
        <ActivityIndicator size="large" color={colors.primary} />

        <Text className="mt-3 text-[15px] text-text-secondary">
          Loading video...
        </Text>
      </View>
    );
  }

  /*
   * ============================================================
   * TIMELINE
   * ============================================================
   */

  const timelineWidth = 320;

  const selectionWidth =
    videoDuration > 0
      ? (allowedDuration / videoDuration) * timelineWidth
      : timelineWidth;

  const selectionLeft =
    videoDuration > 0 ? (startTime / videoDuration) * timelineWidth : 0;

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <View className="flex-1 bg-background p-4">
      {/* VIDEO */}

      <View className="relative h-[390px] w-full overflow-hidden rounded-[18px] bg-surface">
        <VideoView
          player={player}
          className="h-full w-full"
          contentFit="contain"
          nativeControls={false}
        />

        <Pressable
          onPress={isPlaying ? pauseVideo : playSelection}
          className="absolute left-1/2 top-1/2 h-[58px] w-[58px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/65"
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={30}
            color={colors.white}
          />
        </Pressable>
      </View>

      {/* TITLE */}

      <View className="mt-5 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-[20px] font-bold text-text-primary">
            Trim your video
          </Text>

          <Text className="mt-1 text-[14px] text-text-secondary">
            Select up to {maxDuration} seconds
          </Text>
        </View>

        <View className="rounded-[10px] bg-surface-elevated px-3 py-2">
          <Text className="text-[14px] font-bold text-primary">
            {formatTime(allowedDuration)}
          </Text>
        </View>
      </View>

      {/* TIMELINE */}

      <View className="mt-7 items-center">
        <View
          style={{
            width: timelineWidth,
            height: 54,
          }}
          className="relative justify-center"
        >
          <View className="absolute left-0 right-0 h-[42px] rounded-[10px] bg-surface-elevated" />

          <View
            style={{
              left: selectionLeft,
              width: selectionWidth,
            }}
            className="absolute top-[-2px] h-[46px] rounded-[10px] border-2 border-primary bg-primary/15"
          />

          <View
            style={{
              left: selectionLeft - 7,
            }}
            className="absolute top-[-5px] h-[56px] w-[14px] rounded-[7px] bg-primary"
          />

          <View
            style={{
              left: selectionLeft + selectionWidth - 7,
            }}
            className="absolute top-[-5px] h-[56px] w-[14px] rounded-[7px] bg-primary"
          />
        </View>
      </View>

      {/* POSITION CONTROLS */}

      <View className="mt-4 flex-row items-center justify-center">
        <Pressable
          disabled={startTime <= 0}
          onPress={() => changeStartPosition(Math.max(0, startTime - 1))}
          className={`h-[44px] w-[44px] items-center justify-center rounded-full bg-surface-elevated ${
            startTime <= 0 ? "opacity-35" : ""
          }`}
        >
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </Pressable>

        <View className="mx-5 min-w-[190px] flex-row items-center justify-center">
          <Text className="text-[12px] text-text-secondary">Start</Text>

          <Text className="ml-2 text-[15px] font-bold text-text-primary">
            {formatTime(startTime)}
          </Text>

          <Text className="mx-3 text-text-secondary">→</Text>

          <Text className="text-[12px] text-text-secondary">End</Text>

          <Text className="ml-2 text-[15px] font-bold text-text-primary">
            {formatTime(Math.min(videoDuration, startTime + allowedDuration))}
          </Text>
        </View>

        <Pressable
          disabled={startTime >= maxStart}
          onPress={() => changeStartPosition(Math.min(maxStart, startTime + 1))}
          className={`h-[44px] w-[44px] items-center justify-center rounded-full bg-surface-elevated ${
            startTime >= maxStart ? "opacity-35" : ""
          }`}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.white} />
        </Pressable>
      </View>

      {/* INFORMATION */}

      <View className="mt-5 flex-row items-center rounded-[12px] bg-surface-elevated p-[13px]">
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={colors.accent}
        />

        <Text className="ml-2.5 text-[13px] leading-[19px] text-text-secondary">
          Original video: {formatTime(videoDuration)}
          {"\n"}
          Selected: {formatTime(allowedDuration)}
        </Text>
      </View>

      {/* ACTIONS */}

      <View className="mt-[22px] flex-row gap-3">
        {showCancel && (
          <Pressable
            onPress={onCancel}
            disabled={isProcessing}
            className="h-[50px] flex-1 items-center justify-center rounded-[13px] border border-border"
          >
            <Text className="text-[16px] font-semibold text-text-primary">
              Cancel
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={processVideo}
          disabled={isProcessing}
          className={`h-[50px] flex-[1.5] flex-row items-center justify-center rounded-[13px] bg-primary ${
            isProcessing ? "opacity-70" : ""
          }`}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark" size={22} color={colors.white} />

              <Text className="ml-2 text-[16px] font-bold text-white">
                Use Video
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
