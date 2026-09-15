import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

const FILTERS = [
  {
    id: "dating",
    label: "Dating",
  },
  {
    id: "friendship",
    label: "Friendship",
  },
  {
    id: "playmates",
    label: "Playmates",
  },
];

export default function DiscoverFilters({
  activeFilter,
  onFilterChange,
  onAdvancedFilterPress,
}) {
  return (
    <View className="px-4 pb-3 pt-1">
      <View className="flex-row items-center rounded-full border border-border bg-surface p-1">
        {/* Main Filters */}
        <View className="flex-1 flex-row items-center">
          {FILTERS.map((filter) => {
            const active = activeFilter === filter.id;

            return (
              <Pressable
                key={filter.id}
                onPress={() => onFilterChange?.(filter.id)}
                className={`flex-1 items-center rounded-full px-2 py-2.5 ${
                  active ? "bg-primary" : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-[12px] font-semibold ${
                    active
                      ? "text-background"
                      : "text-text-secondary"
                  }`}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Advanced Filters */}
        <Pressable
          onPress={onAdvancedFilterPress}
          className="ml-1 h-10 w-10 items-center justify-center rounded-full bg-surface-elevated"
        >
          <Ionicons
            name="options-outline"
            size={19}
            color={colors["icon-muted"]}
          />
        </Pressable>
      </View>
    </View>
  );
}