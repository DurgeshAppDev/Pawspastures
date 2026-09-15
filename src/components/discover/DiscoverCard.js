import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function DiscoverCard({
  profile,
  onProfilePress,
}) {
  return (
    <Pressable
      onPress={() => onProfilePress?.(profile)}
      className="mx-4 overflow-hidden rounded-[28px] border border-border bg-surface-elevated"
    >
      {/* Profile Image */}
      <View className="aspect-[0.78] w-full">
        <Image
          source={{ uri: profile.image }}
          className="h-full w-full"
          resizeMode="cover"
        />

        {/* Image Overlay */}
        <View className="absolute inset-0 bg-black/10" />

        {/* Compatibility */}
        <View className="absolute left-3.5 top-3.5 flex-row items-center rounded-full bg-primary px-3 py-2">
          <Ionicons
            name="sparkles"
            size={13}
            color={colors.background}
          />

          <Text className="ml-1 text-[12px] font-extrabold text-background">
            {profile.compatibility}% Compatible
          </Text>
        </View>

        {/* Bottom Information */}
        <View className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-16">
          {/* Name */}
          <View className="flex-row items-center">
            <Text className="text-[16px] font-extrabold text-white">
              {profile.name}, {profile.age}
            </Text>

            {profile.verified && (
              <View className="ml-2 h-[19px] w-[19px] items-center justify-center rounded-full bg-primary">
                <Ionicons
                  name="checkmark"
                  size={12}
                  color={colors.background}
                />
              </View>
            )}
          </View>

          {/* Pet */}
          <View className="mt-1.5 flex-row items-center">
            <Ionicons
              name="paw"
              size={15}
              color={colors["text-primary"]}
            />

            <Text className="ml-1.5 text-[13px] font-medium text-text-primary">
              {profile.petName} • {profile.petBreed}
            </Text>
          </View>

          {/* Distance + Interest */}
          <View className="mt-2.5 flex-row items-center">
            <View className="flex-row items-center">
              <Ionicons
                name="location-outline"
                size={14}
                color={colors["text-primary"]}
              />

              <Text className="ml-1 text-[12px] text-text-primary">
                {profile.distance} away
              </Text>
            </View>

            <View className="mx-2 h-1 w-1 rounded-full bg-text-secondary" />

            <View className="flex-row items-center">
              <Ionicons
                name="people-outline"
                size={14}
                color={colors["text-primary"]}
              />

              <Text className="ml-1 text-[12px] text-text-primary">
                Similar interests
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}