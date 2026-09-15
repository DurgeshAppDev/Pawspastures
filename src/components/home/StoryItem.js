import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function StoryItem({ story }) {
  return (
    <Pressable
      className="mr-4 items-center active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel={`${story.username}'s story`}
    >
      {/* Story Ring */}
      <View
        className={`h-[66px] w-[66px] items-center justify-center rounded-full border-[2.5px] ${
          story.isOwn
            ? "border-border"
            : "border-primary"
        }`}
      >
        <View className="h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-full bg-surface-elevated">
          {story.image ? (
            <Image
              source={{ uri: story.image }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons
              name="paw"
              size={25}
              color={colors.primary}
            />
          )}
        </View>

        {/* Add Story */}
        {story.isOwn && (
          <View className="absolute bottom-[-1px] right-[-2px] h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-background bg-primary">
            <Ionicons
              name="add"
              size={15}
              color={colors.background}
            />
          </View>
        )}
      </View>

      <Text
        numberOfLines={1}
        className="mt-2 max-w-[68px] text-center text-[12px] font-medium text-text-secondary"
      >
        {story.username}
      </Text>
    </Pressable>
  );
}