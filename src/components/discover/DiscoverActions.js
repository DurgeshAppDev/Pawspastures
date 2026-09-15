import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function DiscoverActions({
  onPass,
  onLike,
}) {
  return (
    <View className="flex-row items-center justify-center gap-5 py-4">
      {/* Pass */}
      <Pressable
        onPress={onPass}
        className="h-[52px] w-[52px] items-center justify-center rounded-full border border-border bg-surface"
      >
        <Ionicons
          name="close"
          size={27}
          color={colors["text-secondary"]}
        />
      </Pressable>

      {/* Like */}
      <Pressable
        onPress={onLike}
        className="h-[64px] w-[64px] items-center justify-center rounded-full bg-primary"
        style={{
          elevation: 6,
          shadowColor: colors.background,
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: 0.25,
          shadowRadius: 6,
        }}
      >
        <Ionicons
          name="heart"
          size={30}
          color={colors.background}
        />
      </Pressable>
    </View>
  );
}