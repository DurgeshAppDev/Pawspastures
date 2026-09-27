import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export const MY_COMMUNITIES = [
  {
    id: "1",
    name: "Golden Retriever Lovers",
    description: "A friendly community for Golden Retriever parents.",
    members: "12.4K members",
    activity: "18 new posts today",
    image:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "2",
    name: "Pet Parents India",
    description: "Tips, discussions and experiences from pet parents.",
    members: "8.7K members",
    activity: "31 new posts today",
    image:
      "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    name: "Dog Walkers",
    description: "Find walking partners and pet-friendly places.",
    members: "5.2K members",
    activity: "12 new posts today",
    image:
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "4",
    name: "Cat Parents",
    description: "Everything for curious cats and their humans.",
    members: "6.1K members",
    activity: "22 new posts today",
    image:
      "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=800&q=80",
  },
];

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
        <Text className="text-xl font-bold text-text-primary">
          My Communities
        </Text>

        <Text className="text-sm font-medium text-text-secondary">
          {communities.length} Joined
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
              No communities found
            </Text>

            <Text className="mt-1 text-center text-sm text-text-secondary">
              Try another search.
            </Text>
          </View>
        ) : (
          communities.map((community, index) => {
            const selected = selectedId === community.id;

            return (
              <Pressable
                key={community.id}
                onPress={() => onCommunityPress?.(community)}
                className={`flex-row items-center px-4 py-4 active:opacity-80 ${
                  index !== communities.length - 1
                    ? "border-b border-border-subtle"
                    : ""
                } ${
                  selected && isSidebar ? "bg-surface-elevated" : "bg-surface"
                }`}
              >
                <Image
                  source={{ uri: community.image }}
                  className={
                    isSidebar
                      ? "h-12 w-12 rounded-2xl"
                      : "h-14 w-14 rounded-2xl"
                  }
                  resizeMode="cover"
                />

                <View className="ml-3 flex-1">
                  <Text
                    numberOfLines={1}
                    className="text-base font-bold text-text-primary"
                  >
                    {community.name}
                  </Text>

                  <Text
                    numberOfLines={1}
                    className="mt-1 text-sm text-text-secondary"
                  >
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
          })
        )}
      </View>
    </View>
  );
}
