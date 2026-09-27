import React from "react";
import { Image, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function DiscoverCard({ profile }) {
  const { width } = useWindowDimensions();

  const isWeb = width >= 900;

  return (
    <View className="overflow-hidden rounded-3xl border border-border bg-surface">
      <View
        className="relative w-full overflow-hidden"
        style={{
          height: isWeb ? 430 : 400,
        }}
      >
        <Image
          source={{ uri: profile.image }}
          className="h-full w-full"
          resizeMode="cover"
        />

        <View className="absolute inset-0 bg-background/10" />

        <View className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <View className="rounded-2xl border border-border bg-surface/95 p-4">
            <View className="flex-row items-end justify-between">
              <View className="flex-1 pr-3">
                <View className="flex-row items-center">
                  <Text className="text-2xl font-bold text-text-primary">
                    {profile.name}
                  </Text>

                  <Text className="ml-2 text-xl text-text-primary">
                    {profile.age}
                  </Text>
                </View>

                <View className="mt-1 flex-row items-center">
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={colors.textSecondary}
                  />

                  <Text className="ml-1 text-sm text-text-secondary">
                    {profile.location} · {profile.distance}
                  </Text>
                </View>
              </View>

              <View className="items-center rounded-2xl bg-primary px-3 py-2">
                <Text className="text-lg font-bold text-text-primary">
                  {profile.compatibility}%
                </Text>

                <Text className="text-[10px] font-semibold text-text-primary">
                  MATCH
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="p-5">
        <View className="flex-row items-center">
          <Image
            source={{ uri: profile.petImage }}
            className="h-14 w-14 rounded-2xl"
            resizeMode="cover"
          />

          <View className="ml-3 flex-1">
            <Text className="text-base font-bold text-text-primary">
              {profile.petName}
            </Text>

            <Text className="mt-1 text-sm text-text-secondary">
              {profile.petType}
            </Text>
          </View>

          <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-elevated">
            <Ionicons name="paw-outline" size={20} color={colors.primary} />
          </View>
        </View>

        <Text className="mt-5 text-sm leading-6 text-text-secondary">
          {profile.bio}
        </Text>

        <View className="mt-4 flex-row flex-wrap">
          {profile.interests?.map((interest) => (
            <View
              key={interest}
              className="mb-2 mr-2 rounded-full border border-border-subtle bg-surface-elevated px-3 py-1.5"
            >
              <Text className="text-xs font-medium text-text-secondary">
                {interest}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
