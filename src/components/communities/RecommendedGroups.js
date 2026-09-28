import React from "react";

import { Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function RecommendedGroups({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="mx-4 mb-4 flex-row items-center rounded-2xl border border-border bg-surface p-4 active:bg-surface-elevated"
    >
      <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-elevated">
        <Ionicons name="people-outline" size={23} color={colors.primary} />
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-base font-bold text-text-primary">
          Recommended Groups
        </Text>

        <Text className="mt-1 text-sm text-text-secondary">
          Discover groups based on your interests.
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={21} color={colors.iconMuted} />
    </Pressable>
  );
}
