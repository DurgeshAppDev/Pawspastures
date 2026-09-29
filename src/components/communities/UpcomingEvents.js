import React from "react";

import { Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function UpcomingEvents({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="mx-4 mb-5 flex-row items-center rounded-2xl border border-border bg-surface p-4 active:bg-surface-elevated"
    >
      <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-elevated">
        <Ionicons name="calendar-outline" size={23} color={colors.primary} />
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-base font-bold text-text-primary">
          Upcoming Events
        </Text>

        <Text className="mt-1 text-sm leading-5 text-text-secondary">
          Find pet meetups and community activities.
        </Text>
      </View>

      <View className="ml-2 h-9 w-9 items-center justify-center rounded-full">
        <Ionicons name="chevron-forward" size={21} color={colors.iconMuted} />
      </View>
    </Pressable>
  );
}
