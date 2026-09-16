import React from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function CommunitiesHeader({
  searchText,
  onSearchChange,
  onCreatePress,
}) {
  return (
    <View className="bg-background px-4 pb-3 pt-3">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text className="text-[20px] font-extrabold tracking-[-0.3px] text-text-primary">
          Communities
        </Text>

        <Pressable
          onPress={onCreatePress}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface active:opacity-80"
        >
          <Ionicons
            name="add"
            size={23}
            color={colors.primary}
          />
        </Pressable>
      </View>

      {/* Search bar */}
      <View className="mt-3 h-[44px] flex-row items-center rounded-full bg-surface px-4">
        <Ionicons
          name="search-outline"
          size={19}
          color={colors["text-secondary"]}
        />

        <TextInput
          value={searchText}
          onChangeText={onSearchChange}
          placeholder="Find communities, breeds, or locations..."
          placeholderTextColor={colors["text-placeholder"]}
          className="ml-2 flex-1 text-[13px] text-text-primary"
          returnKeyType="search"
        />

        {searchText?.length > 0 && (
          <Pressable onPress={() => onSearchChange("")}>
            <Ionicons
              name="close-circle"
              size={18}
              color={colors["text-secondary"]}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}