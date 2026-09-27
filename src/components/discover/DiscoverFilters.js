import React from "react";
import { ScrollView, Pressable, Text } from "react-native";

export default function DiscoverFilters({
  filters = [],
  activeFilter,
  onFilterChange,
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 16,
      }}
    >
      {filters.map((filter) => {
        const active = activeFilter === filter.id;

        return (
          <Pressable
            key={filter.id}
            onPress={() => onFilterChange?.(filter.id)}
            className={`mr-2 rounded-full border px-5 py-2.5 ${
              active ? "border-primary bg-primary" : "border-border bg-surface"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                active ? "text-text-primary" : "text-text-secondary"
              }`}
            >
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
