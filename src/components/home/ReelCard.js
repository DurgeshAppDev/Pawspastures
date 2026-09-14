import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function ReelCard({ reel }) {
  const [liked, setLiked] = useState(false);

  return (
    <View
      className="border-b"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      {/* Reel Preview */}
      <View
        className="aspect-[3/4] w-full items-center justify-center"
        style={{
          backgroundColor: colors.elevated,
        }}
      >
        <View
          className="h-[72px] w-[72px] items-center justify-center rounded-full"
          style={{
            backgroundColor: colors.surfaceIcon,
          }}
        >
          <Ionicons
            name="play"
            size={34}
            color={colors.primary}
          />
        </View>

        <Text
          style={{ color: colors.white }}
          className="mt-3 text-[15px] font-bold"
        >
          Pet Reel
        </Text>
      </View>

      {/* Reel Details */}
      <View className="p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text
              style={{ color: colors.white }}
              className="text-[15px] font-extrabold"
            >
              {reel.userName}
            </Text>

            <Text
              style={{ color: colors.secondary }}
              className="mt-[3px] text-[13px]"
            >
              {reel.caption}
            </Text>
          </View>

          <Pressable onPress={() => setLiked((value) => !value)}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={27}
              color={liked ? colors.primary : colors.white}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}