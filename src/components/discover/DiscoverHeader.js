import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function DiscoverHeader() {
  return (
    <View className="px-4 pb-4 pt-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-3xl font-bold text-text-primary">Discover</Text>

          <Text className="mt-1 text-sm leading-5 text-text-secondary">
            Meet people and pets with shared interests.
          </Text>
        </View>

        <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-elevated">
          <Ionicons name="options-outline" size={23} color={colors.primary} />
        </View>
      </View>
    </View>
  );
}
