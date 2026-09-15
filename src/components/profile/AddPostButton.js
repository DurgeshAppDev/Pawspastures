import React from "react";
import { Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function AddPostButton({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-5 right-4 flex-row items-center rounded-full px-4 py-3.5"
      style={{
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
      <Ionicons
        name="add"
        size={21}
        color={colors.background}
      />

      <Text
        className="ml-1.5 text-[13px] font-extrabold"
        style={{ color: colors.background }}
      >
        Add Post
      </Text>
    </Pressable>
  );
}