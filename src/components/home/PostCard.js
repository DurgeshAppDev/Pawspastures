import React, { useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function PostCard({ post, onComment, onProfilePress }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <View className="border-b border-border bg-surface">
      {/* User Header */}
      <View className="flex-row items-center justify-between px-4 py-3.5">
        <Pressable
          onPress={() => onProfilePress?.(post)}
          className="flex-1 flex-row items-center"
        >
          {/* Avatar */}
          <View className="h-11 w-11 items-center justify-center rounded-full border-2 border-primary bg-surface-elevated">
            <Ionicons
              name="paw"
              size={21}
              color={colors.primary}
            />
          </View>

          <View className="ml-[11px]">
            <Text className="text-[15px] font-extrabold text-text-primary">
              {post.userName}
            </Text>

            <Text className="mt-[2px] text-[12px] text-text-secondary">
              {post.petName} • {post.time}
            </Text>
          </View>
        </Pressable>

        <Pressable>
          <Ionicons
            name="ellipsis-horizontal"
            size={23}
            color={colors["text-secondary"]}
          />
        </Pressable>
      </View>

      {/* Image */}
      <View className="aspect-square w-full bg-surface-elevated">
        {post.image ? (
          <Image
            source={{ uri: post.image }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons
              name="paw"
              size={56}
              color={colors.primary}
            />

            <Text className="mt-2.5 text-[13px] text-text-secondary">
              Pet photo
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View className="flex-row items-center justify-between px-4 pt-3.5">
        <View className="flex-row items-center gap-[18px]">
          {/* Like */}
          <Pressable onPress={() => setLiked((value) => !value)}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={27}
              color={
                liked
                  ? colors.primary
                  : colors["text-primary"]
              }
            />
          </Pressable>

          {/* Comment */}
          <Pressable onPress={() => onComment?.(post)}>
            <Ionicons
              name="chatbubble-outline"
              size={25}
              color={colors["text-primary"]}
            />
          </Pressable>
        </View>

        {/* Favorite / Save */}
        <Pressable onPress={() => setSaved((value) => !value)}>
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={25}
            color={
              saved
                ? colors.primary
                : colors["text-primary"]
            }
          />
        </Pressable>
      </View>

      {/* Likes */}
      <View className="px-4 pt-2.5">
        <Text className="text-[14px] font-extrabold text-text-primary">
          {liked ? post.likes + 1 : post.likes} likes
        </Text>
      </View>

      {/* Caption */}
      <View className="px-4 pb-[17px] pt-[7px]">
        <Text className="text-[14px] leading-[21px] text-text-primary">
          <Text className="font-extrabold">
            {post.userName}
          </Text>{" "}
          {post.caption}
        </Text>
      </View>
    </View>
  );
}