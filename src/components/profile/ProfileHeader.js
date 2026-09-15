import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function ProfileHeader({ onSettingsPress }) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3.5">
      {/* Left */}
      <View className="flex-row items-center">
        <View className="h-9 w-9 items-center justify-center rounded-lg bg-surface">
          <Ionicons
            name="paw"
            size={19}
            color={colors.primary}
          />
        </View>

        <Text
          className="ml-3 text-[17px] font-extrabold"
          style={{ color: colors["text-primary"] }}
        >
          Profile
        </Text>
      </View>

      {/* Settings */}
      <Pressable
        onPress={onSettingsPress}
        className="h-10 w-10 items-center justify-center rounded-xl bg-surface"
      >
        <Ionicons
          name="settings-outline"
          size={21}
          color={colors["icon-muted"]}
        />
      </Pressable>
    </View>
  );
}