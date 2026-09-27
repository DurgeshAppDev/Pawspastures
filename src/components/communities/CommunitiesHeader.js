import React from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function CommunitiesHeader({
  searchText,
  onSearchChange,
  onCreatePress,
}) {
  const { width } = useWindowDimensions();
  const compact = width < 380;

  return (
    <View className="border-b border-border bg-surface px-4 pb-4 pt-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text
            className={`font-bold text-text-primary ${
              compact ? "text-2xl" : "text-3xl"
            }`}
          >
            Communities
          </Text>

          <Text className="mt-1 text-sm text-text-secondary">
            Find your people and your pets.
          </Text>
        </View>

        <Pressable
          onPress={onCreatePress}
          className="ml-3 h-11 flex-row items-center rounded-full bg-primary px-4 active:opacity-80"
        >
          <Ionicons name="add" size={20} color={colors.white} />

          {!compact && (
            <Text className="ml-1.5 text-sm font-bold text-text-primary">
              Create
            </Text>
          )}
        </Pressable>
      </View>

      <View className="mt-4 h-12 flex-row items-center rounded-2xl border border-border bg-surface-elevated px-3">
        <Ionicons name="search-outline" size={20} color={colors.iconMuted} />

        <TextInput
          value={searchText}
          onChangeText={onSearchChange}
          placeholder="Search communities"
          placeholderTextColor={colors.textPlaceholder}
          className="ml-2 flex-1 text-base text-text-primary"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {searchText?.length > 0 && (
          <Pressable
            onPress={() => onSearchChange("")}
            className="h-8 w-8 items-center justify-center rounded-full"
          >
            <Ionicons name="close-circle" size={19} color={colors.iconMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
