import React, { memo } from "react";

import { Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export const MY_COMMUNITIES = [
  {
    id: "1",
    name: "Golden Retriever Lovers",
    description: "A friendly community for Golden Retriever parents.",
    members: "12.4K members",
    activity: "18 new posts today",
  },
  {
    id: "2",
    name: "Pet Parents India",
    description: "Tips, discussions and experiences from pet parents.",
    members: "8.7K members",
    activity: "31 new posts today",
  },
  {
    id: "3",
    name: "Dog Walkers",
    description: "Find walking partners and pet-friendly places.",
    members: "5.2K members",
    activity: "12 new posts today",
  },
  {
    id: "4",
    name: "Cat Parents",
    description: "Everything for curious cats and their humans.",
    members: "6.1K members",
    activity: "22 new posts today",
  },
];

const CommunityItem = memo(function CommunityItem({
  community,
  selected,
  onPress,
  isLast,
}) {
  return (
    <Pressable
      onPress={() => onPress?.(community)}
      className={`flex-row items-center px-4 py-4 active:bg-surface-elevated ${
        !isLast ? "border-b border-border-subtle" : ""
      }`}
      style={{
        backgroundColor: selected ? colors.surfaceElevated : colors.surface,
      }}
    >
      <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-elevated">
        <Ionicons name="people" size={25} color={colors.primary} />
      </View>

      <View className="ml-3 flex-1">
        <Text
          numberOfLines={1}
          className="text-base font-bold text-text-primary"
        >
          {community.name}
        </Text>

        <Text numberOfLines={1} className="mt-1 text-sm text-text-secondary">
          {community.activity}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={selected ? colors.primary : colors.iconMuted}
      />
    </Pressable>
  );
});

export default function MyCommunities({
  communities = MY_COMMUNITIES,
  selectedId,
  onCommunityPress,
  variant = "mobile",
}) {
  const isSidebar = variant === "sidebar";

  return (
    <View className={isSidebar ? "px-3 py-4" : "px-4 py-5"}>
      <View className="mb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-bold text-text-primary">
            My Communities
          </Text>

          <Text className="mt-1 text-sm text-text-secondary">
            Communities created by you
          </Text>
        </View>

        <Text className="text-sm font-medium text-text-secondary">
          {communities.length}
        </Text>
      </View>

      <View className="overflow-hidden rounded-2xl border border-border bg-surface">
        {communities.length === 0 ? (
          <View className="items-center px-5 py-10">
            <Ionicons
              name="people-outline"
              size={36}
              color={colors.iconMuted}
            />

            <Text className="mt-3 text-base font-semibold text-text-primary">
              No communities created
            </Text>

            <Text className="mt-1 text-center text-sm text-text-secondary">
              Communities you create will appear here.
            </Text>
          </View>
        ) : (
          communities.map((community, index) => (
            <CommunityItem
              key={community.id}
              community={community}
              selected={selectedId === community.id}
              onPress={onCommunityPress}
              isLast={index === communities.length - 1}
            />
          ))
        )}
      </View>
    </View>
  );
}
