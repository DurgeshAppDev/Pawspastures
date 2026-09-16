import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

const MY_COMMUNITIES = [
  {
    id: "1",
    name: "Feline Fanatics",
    activity: "3 new posts today",
    image:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "2",
    name: "Raw Diet Discussions",
    activity: "12 unread messages",
    image:
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=300&q=80",
  },
];

export default function MyCommunities({
  onCommunityPress,
}) {
  return (
    <View className="mt-5 px-4">
      {/* Heading */}
      <View className="mb-2.5 flex-row items-center justify-between">
        <Text className="text-[16px] font-extrabold text-text-primary">
          My Communities
        </Text>

        <View className="rounded-full bg-surface px-3 py-1.5">
          <Text className="text-[11px] font-semibold text-text-secondary">
            4 Joined
          </Text>
        </View>
      </View>

      {/* Community list */}
      {MY_COMMUNITIES.map((community) => (
        <Pressable
          key={community.id}
          onPress={() => onCommunityPress?.(community)}
          className="mb-2.5 h-[62px] flex-row items-center rounded-[11px] border border-border bg-surface px-2.5 active:opacity-80"
        >
          {/* Image */}
          <View className="h-[44px] w-[44px] overflow-hidden rounded-lg bg-surface-elevated">
            <Image
              source={{ uri: community.image }}
              className="h-full w-full"
              resizeMode="cover"
            />
          </View>

          {/* Information */}
          <View className="ml-3 flex-1">
            <Text
              numberOfLines={1}
              className="text-[13px] font-bold text-text-primary"
            >
              {community.name}
            </Text>

            <Text
              numberOfLines={1}
              className="mt-1 text-[11px] text-text-secondary"
            >
              {community.activity}
            </Text>
          </View>

          {/* Arrow */}
          <View className="h-8 w-8 items-center justify-center rounded-full bg-surface-elevated">
            <Ionicons
              name="chevron-forward"
              size={15}
              color={colors["icon-muted"]}
            />
          </View>
        </Pressable>
      ))}
    </View>
  );
}