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
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { VideoView, useVideoPlayer } from "expo-video";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

const MAX_DURATION = 15;

/**
 * Reusable video trimming component.
 *
 * Props:
 *
 * videoUri
 *   Original video URI.
 *
 * maxDuration
 *   Maximum allowed selected duration.
 *   Default = 15 seconds.
 *
 * onCancel
 *   Called when user cancels.
 *
 * onTrimComplete
 *   Called after the video has been trimmed.
 *
 * onError
 *   Called if trimming fails.
 *
 * showCancel
 *   Show/hide cancel button.
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

  /**
   * -------------------------------------------------------
   * VIDEO PLAYER
   * -------------------------------------------------------
   */
  const player = useVideoPlayer(videoUri, (videoPlayer) => {
    playerRef.current = videoPlayer;

    videoPlayer.muted = false;
    videoPlayer.loop = false;
  });

  /**
   * -------------------------------------------------------
   * GET VIDEO DURATION
   * -------------------------------------------------------
   */
  useEffect(() => {
    if (!player) {
      return;
    }

    try {
      const duration = player.duration;

      if (duration && duration > 0) {
        setVideoDuration(duration);
      }
    } catch (error) {
      console.log("Video duration error:", error);
    }
  }, [player]);

  /**
   * -------------------------------------------------------
   * SAFE MAXIMUM
   * -------------------------------------------------------
   */
  const allowedDuration = useMemo(() => {
    if (!videoDuration) {
      return maxDuration;
    }

    return Math.min(videoDuration, maxDuration);
  }, [videoDuration, maxDuration]);

  /**
   * Maximum possible starting position.
   *
   * Example:
   *
   * Video = 45 sec
   * Selection = 15 sec
   *
   * Start can be:
   * 0 → 30 sec
   */
  const maxStart = useMemo(() => {
    if (!videoDuration) {
      return 0;
    }

    return Math.max(0, videoDuration - allowedDuration);
  }, [videoDuration, allowedDuration]);

  /**
   * -------------------------------------------------------
   * FORMAT TIME
   * -------------------------------------------------------
   */
  const formatTime = useCallback((seconds) => {
    if (!Number.isFinite(seconds)) {
      return "00:00";
    }

    const totalSeconds = Math.max(0, Math.floor(seconds));

    const minutes = Math.floor(totalSeconds / 60);

    const remainingSeconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }, []);

  /**
   * -------------------------------------------------------
   * SET START POSITION
   * -------------------------------------------------------
   */
  const changeStartPosition = useCallback(
    (value) => {
      const newStart = Math.max(
        0,
        Math.min(value, maxStart)
      );

      setStartTime(newStart);

      try {
        playerRef.current?.seekBy?.(
          newStart - (playerRef.current?.currentTime || 0)
        );
      } catch (error) {
        console.log("Video seek error:", error);
      }
    },
    [maxStart]
  );

  /**
   * -------------------------------------------------------
   * PLAY SELECTED SECTION
   * -------------------------------------------------------
   */
  const playSelection = useCallback(() => {
    const currentPlayer = playerRef.current;

    if (!currentPlayer) {
      return;
    }

    try {
      currentPlayer.currentTime = startTime;
      currentPlayer.play();

      setIsPlaying(true);

      /**
       * Stop playback after selected duration.
       */
      const timeout = setTimeout(() => {
        try {
          currentPlayer.pause();
          currentPlayer.currentTime = startTime;
        } catch (error) {
          console.log("Playback stop error:", error);
        }

        setIsPlaying(false);
      }, allowedDuration * 1000);

      return () => clearTimeout(timeout);
    } catch (error) {
      console.log("Selection playback error:", error);
    }
  }, [startTime, allowedDuration]);

  /**
   * -------------------------------------------------------
   * PAUSE
   * -------------------------------------------------------
   */
  const pauseVideo = useCallback(() => {
    try {
      playerRef.current?.pause();
      setIsPlaying(false);
    } catch (error) {
      console.log("Pause error:", error);
    }
  }, []);

  /**
   * -------------------------------------------------------
   * PROCESS VIDEO
   *
   * IMPORTANT:
   *
   * This function is intentionally separated from the UI.
   *
   * Replace the processing implementation with the native
   * video trimming library used by the project.
   * -------------------------------------------------------
   */
  const processVideo = useCallback(async () => {
    if (!videoUri) {
      return;
    }

    try {
      setIsProcessing(true);

      /**
       * If original video is already within the limit,
       * there is no need to physically trim it.
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

      /**
       * ---------------------------------------------------
       * VIDEO TRIMMING PLACEHOLDER
       * ---------------------------------------------------
       *
       * The native trimming operation should create a new
       * video file here.
       *
       * For example:
       *
       * const trimmedUri = await trimVideo(
       *   videoUri,
       *   startTime,
       *   allowedDuration
       * );
       *
       * Then:
       *
       * onTrimComplete({
       *   uri: trimmedUri,
       *   startTime,
       *   endTime: startTime + allowedDuration,
       *   duration: allowedDuration,
       *   originalUri: videoUri,
       * });
       */

      Alert.alert(
        "Video trimmer",
        "The trimming UI is ready. Connect the native video processing module here to create the trimmed video file."
      );
    } catch (error) {
      console.log("Video trimming error:", error);

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
    onTrimComplete,
    onError,
  ]);

  /**
   * -------------------------------------------------------
   * VIDEO DURATION NOT READY
   * -------------------------------------------------------
   */
  if (!videoDuration) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading video...
        </Text>
      </View>
    );
  }

  /**
   * -------------------------------------------------------
   * TIMELINE
   *
   * This is a simple reusable timeline.
   *
   * Later this can be replaced with thumbnail frames
   * without changing the parent API.
   * -------------------------------------------------------
   */
  const timelineWidth = 320;

  const selectionWidth =
    videoDuration > 0
      ? (allowedDuration / videoDuration) * timelineWidth
      : timelineWidth;

  const selectionLeft =
    videoDuration > 0
      ? (startTime / videoDuration) * timelineWidth
      : 0;

  return (
    <View style={styles.container}>
      {/* ------------------------------------------------ */}
      {/* VIDEO PREVIEW */}
      {/* ------------------------------------------------ */}

      <View style={styles.videoContainer}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="contain"
          nativeControls={false}
        />

        <Pressable
          onPress={isPlaying ? pauseVideo : playSelection}
          style={styles.playButton}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={30}
            color={colors.white}
          />
        </Pressable>
      </View>

      {/* ------------------------------------------------ */}
      {/* TITLE */}
      {/* ------------------------------------------------ */}

      <View style={styles.titleRow}>
        <View>
          <Text style={styles.title}>
            Trim your video
          </Text>

          <Text style={styles.subtitle}>
            Select up to {maxDuration} seconds
          </Text>
        </View>

        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>
            {formatTime(allowedDuration)}
          </Text>
        </View>
      </View>

      {/* ------------------------------------------------ */}
      {/* TIMELINE */}
      {/* ------------------------------------------------ */}

      <View style={styles.timelineWrapper}>
        <View
          style={[
            styles.timeline,
            {
              width: timelineWidth,
            },
          ]}
        >
          {/* Background */}
          <View style={styles.timelineBackground} />

          {/* Selected region */}
          <View
            style={[
              styles.selectedRegion,
              {
                left: selectionLeft,
                width: selectionWidth,
              },
            ]}
          />

          {/* Start handle */}
          <View
            style={[
              styles.handle,
              {
                left: selectionLeft - 7,
              },
            ]}
          />

          {/* End handle */}
          <View
            style={[
              styles.handle,
              {
                left:
                  selectionLeft +
                  selectionWidth -
                  7,
              },
            ]}
          />
        </View>
      </View>

      {/* ------------------------------------------------ */}
      {/* START POSITION CONTROLS */}
      {/* ------------------------------------------------ */}

      <View style={styles.controlRow}>
        <Pressable
          disabled={startTime <= 0}
          onPress={() =>
            changeStartPosition(
              Math.max(0, startTime - 1)
            )
          }
          style={[
            styles.controlButton,
            startTime <= 0 && styles.disabledButton,
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={colors.white}
          />
        </Pressable>

        <View style={styles.timeInfo}>
          <Text style={styles.timeLabel}>
            Start
          </Text>

          <Text style={styles.timeValue}>
            {formatTime(startTime)}
          </Text>

          <Text style={styles.timeSeparator}>
            →
          </Text>

          <Text style={styles.timeLabel}>
            End
          </Text>

          <Text style={styles.timeValue}>
            {formatTime(
              Math.min(
                videoDuration,
                startTime + allowedDuration
              )
            )}
          </Text>
        </View>

        <Pressable
          disabled={startTime >= maxStart}
          onPress={() =>
            changeStartPosition(
              Math.min(
                maxStart,
                startTime + 1
              )
            )
          }
          style={[
            styles.controlButton,
            startTime >= maxStart &&
              styles.disabledButton,
          ]}
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color={colors.white}
          />
        </Pressable>
      </View>

      {/* ------------------------------------------------ */}
      {/* ORIGINAL VIDEO INFO */}
      {/* ------------------------------------------------ */}

      <View style={styles.infoBox}>
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={colors.accent}
        />

        <Text style={styles.infoText}>
          Original video: {formatTime(videoDuration)}
          {"\n"}
          Selected: {formatTime(allowedDuration)}
        </Text>
      </View>

      {/* ------------------------------------------------ */}
      {/* ACTIONS */}
      {/* ------------------------------------------------ */}

      <View style={styles.actionRow}>
        {showCancel && (
          <Pressable
            onPress={onCancel}
            disabled={isProcessing}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>
              Cancel
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={processVideo}
          disabled={isProcessing}
          style={[
            styles.useButton,
            isProcessing && styles.processingButton,
          ]}
        >
          {isProcessing ? (
            <ActivityIndicator
              size="small"
              color={colors.white}
            />
          ) : (
            <>
              <Ionicons
                name="checkmark"
                size={22}
                color={colors.white}
              />

              <Text style={styles.useText}>
                Use Video
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  loadingText: {
    marginTop: 12,
    color: colors["text-secondary"],
    fontSize: 15,
  },

  videoContainer: {
    width: "100%",
    height: 390,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: colors.surface,
    position: "relative",
  },

  video: {
    width: "100%",
    height: "100%",
  },

  playButton: {
    position: "absolute",
    alignSelf: "center",
    top: "45%",
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
  },

  titleRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    color: colors["text-primary"],
    fontSize: 20,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 5,
    color: colors["text-secondary"],
    fontSize: 14,
  },

  durationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: colors["surface-elevated"],
  },

  durationText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },

  timelineWrapper: {
    marginTop: 28,
    alignItems: "center",
  },

  timeline: {
    height: 54,
    position: "relative",
    justifyContent: "center",
  },

  timelineBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 42,
    borderRadius: 10,
    backgroundColor: colors["surface-elevated"],
  },

  selectedRegion: {
    position: "absolute",
    height: 46,
    top: -2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: "rgba(254,91,0,0.15)",
  },

  handle: {
    position: "absolute",
    top: -5,
    width: 14,
    height: 56,
    borderRadius: 7,
    backgroundColor: colors.primary,
  },

  controlRow: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors["surface-elevated"],
  },

  disabledButton: {
    opacity: 0.35,
  },

  timeInfo: {
    minWidth: 190,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  timeLabel: {
    color: colors["text-secondary"],
    fontSize: 12,
  },

  timeValue: {
    color: colors["text-primary"],
    fontSize: 15,
    fontWeight: "700",
  },

  timeSeparator: {
    color: colors["text-secondary"],
    marginHorizontal: 4,
  },

  infoBox: {
    marginTop: 20,
    padding: 13,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors["surface-elevated"],
  },

  infoText: {
    marginLeft: 10,
    color: colors["text-secondary"],
    fontSize: 13,
    lineHeight: 19,
  },

  actionRow: {
    marginTop: 22,
    flexDirection: "row",
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    color: colors["text-primary"],
    fontSize: 16,
    fontWeight: "600",
  },

  useButton: {
    flex: 1.5,
    height: 50,
    borderRadius: 13,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  processingButton: {
    opacity: 0.7,
  },

  useText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});