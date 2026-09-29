import React from "react";

import { Pressable, Text, TextInput, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function CommunitiesHeader({ searchText, onSearchChange }) {
  return (
    <View className="border-b border-border bg-surface px-3 pb-3 pt-3">
      <View>
        <Text className="text-2xl font-bold text-text-primary">
          Communities
        </Text>

        <Text className="mt-0.5 text-xs text-text-secondary">
          Find your people and your pets.
        </Text>
      </View>

      <View className="mt-3 h-10 flex-row items-center rounded-xl border border-border bg-surface-elevated px-3">
        <Ionicons name="search-outline" size={17} color={colors.iconMuted} />

        <TextInput
          value={searchText}
          onChangeText={onSearchChange}
          placeholder="Search communities"
          placeholderTextColor={colors.textPlaceholder}
          className="ml-2 flex-1 text-sm text-text-primary"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {searchText.length > 0 && (
          <Pressable
            onPress={() => onSearchChange("")}
            className="h-7 w-7 items-center justify-center"
          >
            <Ionicons name="close-circle" size={17} color={colors.iconMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
