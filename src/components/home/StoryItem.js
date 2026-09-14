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
      className="items-center mr-4 active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel={`${story.username}'s story`}
    >
      {/* Story Ring */}
      <View
        className="w-[66px] h-[66px] rounded-full items-center justify-center"
        style={{
          borderWidth: 2.5,
          borderColor: story.isOwn
            ? colors.border
            : colors.primary,
        }}
      >
        <View
          className="w-[58px] h-[58px] rounded-full overflow-hidden items-center justify-center"
          style={{ backgroundColor: colors.surfaceElevated }}
        >
          {story.image ? (
            <Image
              source={{ uri: story.image }}
              className="w-full h-full"
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
          <View
            className="absolute right-[-2px] bottom-[-1px] w-[22px] h-[22px] rounded-full items-center justify-center"
            style={{
              backgroundColor: colors.accent,
              borderWidth: 2,
              borderColor: colors.background,
            }}
          >
            <Ionicons
              name="add"
              size={15}
              color={colors.textPrimary}
            />
          </View>
        )}
      </View>

      <Text
        numberOfLines={1}
        style={{ color: colors.textSecondary }}
        className="text-[12px] font-medium mt-2 max-w-[68px] text-center"
      >
        {story.username}
      </Text>
    </Pressable>
  );
}