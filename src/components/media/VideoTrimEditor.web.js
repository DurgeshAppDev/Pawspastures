import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import {
  fetchFile,
  toBlobURL,
} from "@ffmpeg/util";

const MAX_DURATION = 15;

export default function VideoTrimEditor({
  videoUri,
  maxDuration = MAX_DURATION,
  onCancel,
  onTrimComplete,
  onError,
  showCancel = true,
}) {
  const videoRef = useRef(null);

  const ffmpegRef = useRef(null);

  const [videoDuration, setVideoDuration] =
    useState(0);

  const [startTime, setStartTime] =
    useState(0);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [ffmpegLoading, setFfmpegLoading] =
    useState(false);

  const [ffmpegReady, setFfmpegReady] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  /*
   * ============================================================
   * SAFE MAXIMUM
   * ============================================================
   */

  const allowedDuration = useMemo(() => {
    if (!videoDuration) {
      return maxDuration;
    }

    return Math.min(
      videoDuration,
      maxDuration,
    );
  }, [
    videoDuration,
    maxDuration,
  ]);

  const maxStart = useMemo(() => {
    if (!videoDuration) {
      return 0;
    }

    return Math.max(
      0,
      videoDuration - allowedDuration,
    );
  }, [
    videoDuration,
    allowedDuration,
  ]);

  /*
   * ============================================================
   * FORMAT TIME
   * ============================================================
   */

  const formatTime = useCallback(
    (seconds) => {
      if (!Number.isFinite(seconds)) {
        return "00:00";
      }

      const totalSeconds = Math.max(
        0,
        Math.floor(seconds),
      );

      const minutes = Math.floor(
        totalSeconds / 60,
      );

      const remainingSeconds =
        totalSeconds % 60;

      return `${String(minutes).padStart(
        2,
        "0",
      )}:${String(remainingSeconds).padStart(
        2,
        "0",
      )}`;
    },
    [],
  );

  /*
   * ============================================================
   * VIDEO DURATION
   * ============================================================
   */

  const handleVideoLoadedMetadata =
    useCallback(() => {
      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      const duration = Number(
        video.duration,
      );

      if (
        Number.isFinite(duration) &&
        duration > 0
      ) {
        setVideoDuration(duration);
      }
    }, []);

  /*
   * ============================================================
   * VIDEO PLAYBACK
   * ============================================================
   */

  const playSelection =
    useCallback(() => {
      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      try {
        video.currentTime = startTime;

        const promise =
          video.play();

        if (promise?.catch) {
          promise.catch((error) => {
            console.log(
              "Web video playback error:",
              error,
            );
          });
        }

        setIsPlaying(true);
      } catch (error) {
        console.log(
          "Web playback error:",
          error,
        );
      }
    }, [startTime]);

  const pauseVideo =
    useCallback(() => {
      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      video.pause();

      setIsPlaying(false);
    }, []);

  /*
   * ============================================================
   * STOP AT END OF SELECTED SECTION
   * ============================================================
   */

  const handleTimeUpdate =
    useCallback(() => {
      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      const endTime = Math.min(
        videoDuration,
        startTime + allowedDuration,
      );

      if (
        video.currentTime >=
        endTime
      ) {
        video.pause();

        video.currentTime =
          startTime;

        setIsPlaying(false);
      }
    }, [
      videoDuration,
      startTime,
      allowedDuration,
    ]);

  /*
   * ============================================================
   * CHANGE START POSITION
   * ============================================================
   */

  const changeStartPosition =
    useCallback(
      (value) => {
        const newStart =
          Math.max(
            0,
            Math.min(
              value,
              maxStart,
            ),
          );

        setStartTime(newStart);

        if (videoRef.current) {
          videoRef.current.currentTime =
            newStart;
        }
      },
      [maxStart],
    );

  /*
   * ============================================================
   * LOAD FFMPEG
   * ============================================================
   */

  const loadFFmpeg =
    useCallback(async () => {
      if (ffmpegReady) {
        return ffmpegRef.current;
      }

      if (ffmpegLoading) {
        return null;
      }

      try {
        setFfmpegLoading(true);
        setErrorMessage("");

        const ffmpeg =
          new FFmpeg();

        ffmpegRef.current =
          ffmpeg;

        const baseURL =
          "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

        await ffmpeg.load({
          coreURL:
            await toBlobURL(
              `${baseURL}/ffmpeg-core.js`,
              "text/javascript",
            ),

          wasmURL:
            await toBlobURL(
              `${baseURL}/ffmpeg-core.wasm`,
              "application/wasm",
            ),
        });

        setFfmpegReady(true);

        return ffmpeg;
      } catch (error) {
        console.log(
          "FFmpeg Web loading error:",
          error,
        );

        setErrorMessage(
          "Unable to load the video editor.",
        );

        onError?.(error);

        return null;
      } finally {
        setFfmpegLoading(false);
      }
    }, [
      ffmpegReady,
      ffmpegLoading,
      onError,
    ]);

  /*
   * ============================================================
   * LOAD FFMPEG WHEN REQUIRED
   * ============================================================
   */

  useEffect(() => {
    /*
     * We don't load FFmpeg immediately.
     *
     * This prevents the Web app from downloading
     * the FFmpeg runtime simply because the screen
     * exists.
     */
  }, []);

  /*
   * ============================================================
   * PROCESS VIDEO
   * ============================================================
   */

  const processVideo =
    useCallback(async () => {
      if (!videoUri) {
        return;
      }

      try {
        setIsProcessing(true);
        setErrorMessage("");

        /*
         * Already within 15 seconds.
         *
         * No processing required.
         */

        if (
          videoDuration <=
          maxDuration
        ) {
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
         * Load FFmpeg only when the
         * user actually needs trimming.
         */

        const ffmpeg =
          await loadFFmpeg();

        if (!ffmpeg) {
          throw new Error(
            "FFmpeg could not be loaded.",
          );
        }

        /*
         * Fetch original video.
         */

        const inputFile =
          await fetchFile(videoUri);

        const inputName =
          "paws-input.mp4";

        const outputName =
          "paws-trimmed.mp4";

        /*
         * Write source video
         * into FFmpeg filesystem.
         */

        await ffmpeg.writeFile(
          inputName,
          inputFile,
        );

        /*
         * Trim selected section.
         *
         * -ss = start time
         * -t  = selected duration
         *
         * We re-encode because browser
         * keyframe copying cannot guarantee
         * an exact trim.
         */

        await ffmpeg.exec([
          "-ss",
          String(startTime),

          "-i",
          inputName,

          "-t",
          String(allowedDuration),

          "-c:v",
          "libx264",

          "-preset",
          "veryfast",

          "-crf",
          "28",

          "-c:a",
          "aac",

          "-movflags",
          "+faststart",

          outputName,
        ]);

        /*
         * Read trimmed video.
         */

        const outputData =
          await ffmpeg.readFile(
            outputName,
          );

        /*
         * Convert FFmpeg output
         * into a browser Blob.
         */

        const blob =
          new Blob(
            [outputData.buffer],
            {
              type: "video/mp4",
            },
          );

        /*
         * Create browser URL.
         */

        const trimmedUri =
          URL.createObjectURL(
            blob,
          );

        /*
         * Return trimmed media
         * to MediaEditorScreen.
         */

        onTrimComplete?.({
          uri: trimmedUri,

          startTime,

          endTime:
            startTime +
            allowedDuration,

          duration:
            allowedDuration,

          originalUri: videoUri,

          blob,
        });

        /*
         * Cleanup FFmpeg files.
         */

        try {
          await ffmpeg.deleteFile(
            inputName,
          );

          await ffmpeg.deleteFile(
            outputName,
          );
        } catch (cleanupError) {
          console.log(
            "FFmpeg cleanup error:",
            cleanupError,
          );
        }
      } catch (error) {
        console.log(
          "Web video trimming error:",
          error,
        );

        setErrorMessage(
          "Unable to trim this video. Please try another video.",
        );

        onError?.(error);
      } finally {
        setIsProcessing(false);
      }
    }, [
      videoUri,
      videoDuration,
      maxDuration,
      startTime,
      allowedDuration,
      loadFFmpeg,
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
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text className="mt-3 text-[15px] text-text-secondary">
          Loading video...
        </Text>

        <video
          ref={videoRef}
          src={videoUri}
          onLoadedMetadata={
            handleVideoLoadedMetadata
          }
          className="hidden"
        />
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
      ? (allowedDuration /
          videoDuration) *
        timelineWidth
      : timelineWidth;

  const selectionLeft =
    videoDuration > 0
      ? (startTime /
          videoDuration) *
        timelineWidth
      : 0;

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <View className="flex-1 bg-background p-4">
      {/* WEB VIDEO */}

      <View className="relative h-[390px] w-full overflow-hidden rounded-[18px] bg-surface">
        <video
          ref={videoRef}
          src={videoUri}
          onLoadedMetadata={
            handleVideoLoadedMetadata
          }
          onTimeUpdate={
            handleTimeUpdate
          }
          onPlay={() =>
            setIsPlaying(true)
          }
          onPause={() =>
            setIsPlaying(false)
          }
          className="h-full w-full object-contain"
        />

        <Pressable
          onPress={
            isPlaying
              ? pauseVideo
              : playSelection
          }
          className="absolute left-1/2 top-1/2 h-[58px] w-[58px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/65"
        >
          <Ionicons
            name={
              isPlaying
                ? "pause"
                : "play"
            }
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
            {formatTime(
              allowedDuration,
            )}
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
              left:
                selectionLeft - 7,
            }}
            className="absolute top-[-5px] h-[56px] w-[14px] rounded-[7px] bg-primary"
          />

          <View
            style={{
              left:
                selectionLeft +
                selectionWidth -
                7,
            }}
            className="absolute top-[-5px] h-[56px] w-[14px] rounded-[7px] bg-primary"
          />
        </View>
      </View>

      {/* POSITION CONTROLS */}

      <View className="mt-4 flex-row items-center justify-center">
        <Pressable
          disabled={startTime <= 0}
          onPress={() =>
            changeStartPosition(
              Math.max(
                0,
                startTime - 1,
              ),
            )
          }
          className={`h-[44px] w-[44px] items-center justify-center rounded-full bg-surface-elevated ${
            startTime <= 0
              ? "opacity-35"
              : ""
          }`}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={colors.white}
          />
        </Pressable>

        <View className="mx-5 min-w-[190px] flex-row items-center justify-center">
          <Text className="text-[12px] text-text-secondary">
            Start
          </Text>

          <Text className="ml-2 text-[15px] font-bold text-text-primary">
            {formatTime(startTime)}
          </Text>

          <Text className="mx-3 text-text-secondary">
            →
          </Text>

          <Text className="text-[12px] text-text-secondary">
            End
          </Text>

          <Text className="ml-2 text-[15px] font-bold text-text-primary">
            {formatTime(
              Math.min(
                videoDuration,
                startTime +
                  allowedDuration,
              ),
            )}
          </Text>
        </View>

        <Pressable
          disabled={
            startTime >= maxStart
          }
          onPress={() =>
            changeStartPosition(
              Math.min(
                maxStart,
                startTime + 1,
              ),
            )
          }
          className={`h-[44px] w-[44px] items-center justify-center rounded-full bg-surface-elevated ${
            startTime >= maxStart
              ? "opacity-35"
              : ""
          }`}
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color={colors.white}
          />
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
          Original video:{" "}
          {formatTime(videoDuration)}
          {"\n"}
          Selected:{" "}
          {formatTime(allowedDuration)}
        </Text>
      </View>

      {/* ERROR */}

      {!!errorMessage && (
        <View className="mt-3 rounded-[12px] border border-primary bg-surface p-3">
          <Text className="text-[13px] text-text-secondary">
            {errorMessage}
          </Text>
        </View>
      )}

      {/* FFMPEG STATUS */}

      {ffmpegLoading && (
        <View className="mt-3 flex-row items-center rounded-[12px] bg-surface-elevated p-3">
          <ActivityIndicator
            size="small"
            color={colors.primary}
          />

          <Text className="ml-2.5 text-[13px] text-text-secondary">
            Preparing video editor...
          </Text>
        </View>
      )}

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
          disabled={
            isProcessing ||
            ffmpegLoading
          }
          className={`h-[50px] flex-[1.5] flex-row items-center justify-center rounded-[13px] bg-primary ${
            isProcessing ||
            ffmpegLoading
              ? "opacity-70"
              : ""
          }`}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator
                size="small"
                color={colors.white}
              />

              <Text className="ml-2 text-[16px] font-bold text-white">
                Trimming...
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="checkmark"
                size={22}
                color={colors.white}
              />

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