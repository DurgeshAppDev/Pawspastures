import React, { useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function PostCard({ post, onComment, onProfilePress }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <View
      className="border-b"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      {/* User Header */}
      <View className="flex-row items-center justify-between px-4 py-3.5">
        <Pressable
          onPress={() => onProfilePress?.(post)}
          className="flex-1 flex-row items-center"
        >
          {/* Avatar */}
          <View
            className="h-11 w-11 items-center justify-center rounded-full border-2"
            style={{
              backgroundColor: colors.elevated,
              borderColor: colors.primary,
            }}
          >
            <Ionicons name="paw" size={21} color={colors.primary} />
          </View>

          <View className="ml-[11px]">
            <Text
              style={{ color: colors.white }}
              className="text-[15px] font-extrabold"
            >
              {post.userName}
            </Text>

            <Text
              style={{ color: colors.secondary }}
              className="mt-[2px] text-[12px]"
            >
              {post.petName} • {post.time}
            </Text>
          </View>
        </Pressable>

        <Pressable>
          <Ionicons
            name="ellipsis-horizontal"
            size={23}
            color={colors.secondary}
          />
        </Pressable>
      </View>

      {/* Image */}
      <View
        className="aspect-square w-full"
        style={{
          backgroundColor: colors.elevated,
        }}
      >
        {post.image ? (
          <Image
            source={{ uri: post.image }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="paw" size={56} color={colors.primary} />

            <Text
              style={{ color: colors.secondary }}
              className="mt-2.5 text-[13px]"
            >
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
              color={liked ? colors.primary : colors.white}
            />
          </Pressable>

          {/* Comment */}
          <Pressable onPress={() => onComment?.(post)}>
            <Ionicons
              name="chatbubble-outline"
              size={25}
              color={colors.white}
            />
          </Pressable>
        </View>

        {/* Favorite / Save */}
        <Pressable onPress={() => setSaved((value) => !value)}>
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={25}
            color={saved ? colors.primary : colors.white}
          />
        </Pressable>
      </View>

      {/* Likes */}
      <View className="px-4 pt-2.5">
        <Text
          style={{ color: colors.white }}
          className="text-[14px] font-extrabold"
        >
          {liked ? post.likes + 1 : post.likes} likes
        </Text>
      </View>

      {/* Caption */}
      <View className="px-4 pb-[17px] pt-[7px]">
        <Text
          style={{ color: colors.white }}
          className="text-[14px] leading-[21px]"
        >
          <Text className="font-extrabold">{post.userName}</Text> {post.caption}
        </Text>

        {post.comments > 0 && (
          <Pressable onPress={() => onComment?.(post)} className="mt-2">
            <Text
              style={{ color: colors.secondary }}
              className="text-[13px] font-semibold"
            >
              View all {post.comments} comments
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
