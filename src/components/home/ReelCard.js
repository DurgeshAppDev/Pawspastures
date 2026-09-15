import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function ReelCard({ reel, onComment }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <View className="border-b border-border bg-surface">
      {/* Reel Preview */}
      <View className="aspect-[3/4] w-full items-center justify-center bg-surface-elevated">
        <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-surface-icon">
          <Ionicons
            name="play"
            size={34}
            color={colors.primary}
          />
        </View>

        <Text className="mt-3 text-[15px] font-bold text-text-primary">
          Pet Reel
        </Text>
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
          <Pressable onPress={() => onComment?.(reel)}>
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

      {/* Reel Details */}
      <View className="px-4 pb-[17px] pt-2.5">
        {/* Likes */}
        <Text className="text-[14px] font-extrabold text-text-primary">
          {liked ? (reel.likes || 0) + 1 : reel.likes || 0} likes
        </Text>

        {/* Caption */}
        <Text className="pt-[7px] text-[14px] leading-[21px] text-text-primary">
          <Text className="font-extrabold">
            {reel.userName}
          </Text>{" "}
          {reel.caption}
        </Text>
      </View>
    </View>
  );
}