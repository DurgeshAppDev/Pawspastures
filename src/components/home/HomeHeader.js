import React from "react";

import { View, Text, Pressable, Platform } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function HomeHeader({ onNotificationsPress, onMessagesPress }) {
  const isWeb = Platform.OS === "web";

  return (
    <View
      className="flex-row items-center justify-between px-[18px] pb-2 pt-3"
      style={{
        backgroundColor: colors.background,

        ...(isWeb
          ? {
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }
          : {}),
      }}
    >
      {/* BRAND */}

      <View className="flex-1 pr-3">
        <Text
          className="text-[20px] font-extrabold tracking-[-0.5px]"
          style={{
            color: colors["text-primary"],
          }}
        >
          Paws & Pastures
        </Text>
      </View>

      {/* ACTIONS */}

      <View className="flex-row items-center gap-2.5">
        <Pressable
          onPress={onNotificationsPress}
          className="h-[42px] w-[42px] items-center justify-center rounded-full"
          style={{
            backgroundColor: colors.surface,
          }}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={colors.primary}
          />
        </Pressable>

        <Pressable
          onPress={onMessagesPress}
          className="h-[42px] w-[42px] items-center justify-center rounded-full"
          style={{
            backgroundColor: colors.surface,
          }}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={21}
            color={colors.primary}
          />
        </Pressable>
      </View>
    </View>
  );
}
