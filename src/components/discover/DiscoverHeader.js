import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function DiscoverHeader({ onSearchPress }) {
  return (
    <View className="flex-row items-center justify-between bg-background px-4 pb-3 pt-3.5">
      <Text className="text-[20px] font-extrabold tracking-[-0.3px] text-text-primary">
        Discover
      </Text>

      <Pressable
        onPress={onSearchPress}
        className="h-10 w-10 items-center justify-center rounded-full bg-surface"
      >
        <Ionicons
          name="search-outline"
          size={21}
          color={colors.accent}
        />
      </Pressable>
    </View>
  );
}