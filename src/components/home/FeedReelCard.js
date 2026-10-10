import React, { useEffect, useRef, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";

/** A single feed cell only starts its video when FlatList says it is visible. */
export default function FeedReelCard({ reel, isActive, onComment, onProfilePress }) {
  const player = useVideoPlayer(null, (instance) => {
    instance.loop = true;
    instance.muted = true;
  });
  const loadedSource = useRef(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pausedByUser, setPausedByUser] = useState(false);

  useEffect(() => {
    if (!reel.mediaUrl || !isActive) {
      player.pause();
      return;
    }
    if (!loadedSource.current) {
      player.replace(reel.mediaUrl);
      loadedSource.current = true;
    }
    if (pausedByUser) player.pause();
    else player.play();
  }, [isActive, pausedByUser, player, reel.mediaUrl]);

  return (
    <View className="mb-5 overflow-hidden rounded-2xl border border-border bg-surface">
      <View className="aspect-[3/4] w-full overflow-hidden bg-surface-elevated" style={{ aspectRatio: 3 / 4 }}>
        {reel.mediaUrl ? (
          <>
            <VideoView player={player} style={{ width: "100%", height: "100%" }} contentFit="cover" nativeControls={false} />
            {!isActive || pausedByUser ? (
              <Pressable onPress={() => setPausedByUser(false)} className="absolute inset-0 items-center justify-center bg-black/15">
                <Ionicons name="play-circle" size={56} color={colors.white} />
              </Pressable>
            ) : null}
            <Pressable onPress={() => setPausedByUser((value) => !value)} className="absolute right-3 top-3 h-10 w-10 items-center justify-center rounded-full bg-black/45">
              <Ionicons name={pausedByUser ? "play" : "pause"} size={18} color={colors.white} />
            </Pressable>
          </>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="videocam-outline" size={44} color={colors.primary} />
            <Text className="mt-3 text-sm text-text-secondary">Reel media unavailable</Text>
          </View>
        )}
        <View className="absolute bottom-0 left-0 right-0 bg-black/55 px-4 py-3">
            <Pressable
              onPress={() => onProfilePress?.(reel)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${reel.authorName || "Pet parent"}'s profile`}
              className="mb-2 flex-row items-center"
            >
            {reel.authorPhotoUrl ? (
              <Image source={{ uri: reel.authorPhotoUrl }} className="h-9 w-9 rounded-full" />
            ) : (
              <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-elevated">
                <Ionicons name="paw" size={18} color={colors.primary} />
              </View>
            )}
            <View className="ml-2.5 flex-1">
              <Text numberOfLines={1} className="font-bold text-white">{reel.authorName || "Pet parent"}</Text>
              {reel.petName ? <Text numberOfLines={1} className="text-xs text-white/75">with {reel.petName}</Text> : null}
            </View>
          </Pressable>
          {reel.caption ? <Text numberOfLines={3} className="text-sm leading-5 text-white">{reel.caption}</Text> : null}
        </View>
      </View>

      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center gap-5">
          <Pressable onPress={() => setLiked((value) => !value)} accessibilityRole="button" accessibilityLabel={liked ? "Unlike reel" : "Like reel"}>
            <Ionicons name={liked ? "heart" : "heart-outline"} size={25} color={liked ? colors.primary : colors["text-primary"]} />
          </Pressable>
          <Pressable onPress={() => onComment?.(reel)} accessibilityRole="button" accessibilityLabel="Comment on reel">
            <Ionicons name="chatbubble-outline" size={23} color={colors["text-primary"]} />
          </Pressable>
        </View>
        <Pressable onPress={() => setSaved((value) => !value)} accessibilityRole="button" accessibilityLabel={saved ? "Unsave reel" : "Save reel"}>
          <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={23} color={saved ? colors.primary : colors["text-primary"]} />
        </Pressable>
      </View>
      <Text className="px-4 pb-3 text-xs text-text-secondary">
        {liked ? (Number(reel.likes) || 0) + 1 : Number(reel.likes) || 0} likes
        {Number.isFinite(Number(reel.views)) ? `  ·  ${Number(reel.views)} views` : ""}
      </Text>
    </View>
  );
}
