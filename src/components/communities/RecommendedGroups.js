import React from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

const GROUPS = [
  {
    id: "1",
    name: "Ludhiana Pet Owners",
    description:
      "Connect with local pet parents for playdates, vet recommendations, and more.",
    image:
      "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "2",
    name: "Dog Lovers Club",
    description:
      "A friendly community for dog lovers to share stories, tips, and experiences.",
    image:
      "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "3",
    name: "Cat Parents",
    description:
      "Share cat care tips, photos, experiences, and everything feline.",
    image:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=85",
  },
];

export default function RecommendedGroups({
  onSeeAll,
  onJoinGroup,
}) {
  return (
    <View className="mt-1">
      {/* Section header */}
      <View className="flex-row items-center justify-between px-4 pb-2.5">
        <Text className="text-[16px] font-extrabold text-text-primary">
          Recommended Groups
        </Text>

        <Pressable onPress={onSeeAll}>
          <Text className="text-[12px] font-bold text-primary">
            See all
          </Text>
        </Pressable>
      </View>

      {/* Horizontal groups */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4"
      >
        {GROUPS.map((group) => (
          <View
            key={group.id}
            className="mr-3 w-[174px] overflow-hidden rounded-[17px] border border-border bg-surface-elevated"
          >
            {/* Image */}
            <View className="h-[82px] w-full bg-surface">
              <Image
                source={{ uri: group.image }}
                className="h-full w-full"
                resizeMode="cover"
              />

              {/* Member avatars */}
              <View className="absolute bottom-[-12px] left-3 flex-row items-center">
                <View className="h-8 w-8 items-center justify-center rounded-full border-2 border-surface-elevated bg-surface-icon">
                  <Ionicons
                    name="paw"
                    size={14}
                    color={colors.primary}
                  />
                </View>

                <View className="-ml-2 h-8 w-8 items-center justify-center rounded-full border-2 border-surface-elevated bg-surface">
                  <Ionicons
                    name="paw"
                    size={14}
                    color={colors["text-secondary"]}
                  />
                </View>

                <View className="-ml-2 h-8 w-8 items-center justify-center rounded-full border-2 border-surface-elevated bg-surface">
                  <Ionicons
                    name="paw"
                    size={14}
                    color={colors["text-secondary"]}
                  />
                </View>

                <View className="-ml-2 h-8 w-8 items-center justify-center rounded-full border-2 border-surface-elevated bg-primary">
                  <Text className="text-[9px] font-extrabold text-background">
                    +2k
                  </Text>
                </View>
              </View>
            </View>

            {/* Content */}
            <View className="px-3 pb-3.5 pt-5">
              <Text
                numberOfLines={1}
                className="text-[14px] font-extrabold text-text-primary"
              >
                {group.name}
              </Text>

              <Text
                numberOfLines={3}
                className="mt-1.5 min-h-[51px] text-[11px] leading-[16px] text-text-secondary"
              >
                {group.description}
              </Text>

              <Pressable
                onPress={() => onJoinGroup?.(group)}
                className="mt-3 h-9 items-center justify-center rounded-full bg-primary active:opacity-80"
              >
                <Text className="text-[12px] font-extrabold text-background">
                  Join Group
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}