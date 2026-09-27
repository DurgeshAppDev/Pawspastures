import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function DiscoverActions({ onPass, onLike }) {
  return (
    <View className="flex-row items-center justify-center px-2 py-5">
      <Pressable
        onPress={onPass}
        accessibilityRole="button"
        accessibilityLabel="Pass"
        className="mr-4 h-14 flex-1 items-center justify-center rounded-2xl border border-border bg-surface active:opacity-80"
      >
        <View className="flex-row items-center">
          <Ionicons
            name="close-outline"
            size={25}
            color={colors.text - secondary}
          />

          <Text className="ml-2 text-base font-semibold text-text-secondary">
            Pass
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={onLike}
        accessibilityRole="button"
        accessibilityLabel="Like"
        className="h-14 flex-1 items-center justify-center rounded-2xl bg-primary active:opacity-80"
      >
        <View className="flex-row items-center">
          <Ionicons name="heart" size={22} color={colors.white} />

          <Text className="ml-2 text-base font-bold text-text-primary">
            Like
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
