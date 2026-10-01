import React from "react";

import { Pressable, Text, View, useWindowDimensions } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { colors } from "../../theme";

export default function ProfileHeader() {
  const navigation = useNavigation();

  const { width } = useWindowDimensions();

  const isDesktop = width >= 1100;

  return (
    <View
      className="flex-row items-center justify-between"
      style={{
        width: "100%",
        paddingHorizontal: isDesktop ? 0 : 0,
        paddingVertical: isDesktop ? 18 : 14,
      }}
    >
      <View className="flex-row items-center">
        <Text
          className="ml-3 font-extrabold"
          style={{
            color: colors["text-primary"],
            fontSize: isDesktop ? 19 : 17,
          }}
        >
          Profile
        </Text>
      </View>

      <Pressable
        onPress={() => navigation.navigate("Settings")}
        className="items-center justify-center rounded-xl bg-surface"
        style={{
          width: isDesktop ? 42 : 40,
          height: isDesktop ? 42 : 40,
        }}
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
