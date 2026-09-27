import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../theme";

const RECOMMENDED_GROUPS = [
  {
    id: "1",
    name: "Pet Photography",
    description:
      "Share your best pet moments, photography tips and creative ideas.",
    members: "4.8K members",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "2",
    name: "Pet Travel",
    description:
      "Discover pet-friendly destinations, travel tips and experiences.",
    members: "3.2K members",
    image:
      "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "3",
    name: "Healthy Pets",
    description:
      "Everyday discussions around responsible pet care and wellbeing.",
    members: "7.1K members",
    image:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "4",
    name: "Pet Parents",
    description:
      "Connect with other pet parents and share everyday experiences.",
    members: "9.3K members",
    image:
      "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80",
  },
];

export default function RecommendedGroupsScreen({ navigation }) {
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      {/* HEADER */}

      <View className="h-[70px] flex-row items-center border-b border-border bg-surface px-3">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-11 w-11 items-center justify-center rounded-full"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={23} color={colors.textPrimary} />
        </Pressable>

        <View className="ml-2 flex-1">
          <Text className="text-xl font-bold text-text-primary">
            Recommended Groups
          </Text>

          <Text className="mt-0.5 text-xs text-text-secondary">
            Communities you may enjoy
          </Text>
        </View>

        <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-elevated">
          <Ionicons name="people-outline" size={20} color={colors.primary} />
        </View>
      </View>

      {/* CONTENT */}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
        }}
      >
        <View className="mb-5">
          <Text className="text-sm leading-5 text-text-secondary">
            Explore groups based on pet interests, activities and conversations
            you may enjoy.
          </Text>
        </View>

        {RECOMMENDED_GROUPS.map((group) => (
          <View
            key={group.id}
            className="mb-4 overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <Image
              source={{ uri: group.image }}
              className="h-52 w-full"
              resizeMode="cover"
            />

            <View className="p-5">
              <Text className="text-lg font-bold text-text-primary">
                {group.name}
              </Text>

              <Text className="mt-2 text-sm leading-6 text-text-secondary">
                {group.description}
              </Text>

              <View className="mt-4 flex-row items-center">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-elevated">
                  <Ionicons
                    name="people-outline"
                    size={17}
                    color={colors.iconMuted}
                  />
                </View>

                <Text className="ml-2 text-sm text-text-secondary">
                  {group.members}
                </Text>
              </View>

              <Pressable
                onPress={() => {}}
                className="mt-5 h-11 items-center justify-center rounded-xl bg-primary active:opacity-80"
              >
                <Text className="text-sm font-bold text-text-primary">
                  Join Group
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
