import React from "react";

import { Pressable, Text, useWindowDimensions } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function AddPostButton({ onPress }) {
  const { width } = useWindowDimensions();

  const isDesktop = width >= 1100;
  const isWideDesktop = width >= 1400;

  return (
    <Pressable
      onPress={onPress}
      className="absolute flex-row items-center rounded-full"
      style={{
        right: isWideDesktop ? 48 : isDesktop ? 32 : 16,
        bottom: isDesktop ? 28 : 20,
        paddingHorizontal: isDesktop ? 18 : 16,
        paddingVertical: isDesktop ? 14 : 13.5,
        backgroundColor: colors.primary,
        elevation: 6,
        shadowColor: colors.background,
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      }}
    >
      <Ionicons name="add" size={21} color={colors.background} />

      <Text
        className="ml-1.5 font-extrabold"
        style={{
          color: colors.background,
          fontSize: 13,
        }}
      >
        Add Post
      </Text>
    </Pressable>
  );
}
