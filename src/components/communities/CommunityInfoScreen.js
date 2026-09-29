import React from "react";

import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { colors } from "../../theme";

function InfoRow({
  icon,
  title,
  value,
}) {
  if (!value) {
    return null;
  }

  return (
    <View className="flex-row border-b border-border px-4 py-4">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-elevated">
        <Ionicons
          name={icon}
          size={19}
          color={colors.iconMuted}
        />
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-xs text-text-secondary">
          {title}
        </Text>

        <Text className="mt-1 text-sm leading-5 text-text-primary">
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function CommunityInfoScreen({
  navigation,
  route,
}) {
  const insets = useSafeAreaInsets();

  const community = route?.params?.community;

  if (!community) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="h-[68px] flex-row items-center border-b border-border bg-surface px-3">
          <Pressable
            onPress={() => navigation.goBack()}
            className="h-11 w-11 items-center justify-center rounded-full bg-surface-elevated"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={colors.white}
            />
          </Pressable>

          <Text className="ml-3 text-lg font-bold text-text-primary">
            Community Info
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <Ionicons
            name="people-outline"
            size={50}
            color={colors.iconMuted}
          />

          <Text className="mt-4 text-lg font-bold text-text-primary">
            Community not found
          </Text>

          <Text className="mt-2 text-center text-sm text-text-secondary">
            The community information is not available.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const image =
    community.coverImage ||
    community.coverImageUri ||
    null;

  const privacy =
    community.privacy === "private"
      ? "Private"
      : "Public";

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      {/* HEADER */}

      <View className="h-[68px] flex-row items-center border-b border-border bg-surface px-3">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-11 w-11 items-center justify-center rounded-full bg-surface-elevated"
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.white}
          />
        </Pressable>

        <View className="ml-3 flex-1">
          <Text
            numberOfLines={1}
            className="text-lg font-bold text-text-primary"
          >
            Community Info
          </Text>

          <Text
            numberOfLines={1}
            className="mt-0.5 text-xs text-text-secondary"
          >
            {community.name || "Community"}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: Math.max(
            32,
            insets.bottom + 24
          ),
        }}
      >
        <View className="w-full max-w-[900px] self-center">
          {/* COVER */}

          <View
            className="w-full overflow-hidden rounded-3xl border border-border bg-surface"
            style={{
              aspectRatio: 2.2,
            }}
          >
            {image ? (
              <Image
                source={{ uri: image }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-full w-full items-center justify-center bg-surface-elevated">
                <View className="h-20 w-20 items-center justify-center rounded-full bg-surface">
                  <Ionicons
                    name="people-outline"
                    size={36}
                    color={colors.primary}
                  />
                </View>
              </View>
            )}
          </View>

          {/* NAME */}

          <View className="mt-5">
            <Text className="text-2xl font-bold text-text-primary">
              {community.name || "Community"}
            </Text>

            <Text className="mt-2 text-sm leading-6 text-text-secondary">
              {community.description ||
                "No description available."}
            </Text>
          </View>

          {/* STATS */}

          <View className="mt-5 flex-row gap-3">
            <View className="flex-1 rounded-2xl border border-border bg-surface p-4">
              <Ionicons
                name="people-outline"
                size={21}
                color={colors.primary}
              />

              <Text className="mt-2 text-lg font-bold text-text-primary">
                {community.memberCount || 0}
              </Text>

              <Text className="mt-1 text-xs text-text-secondary">
                Members
              </Text>
            </View>

            <View className="flex-1 rounded-2xl border border-border bg-surface p-4">
              <Ionicons
                name="pricetag-outline"
                size={21}
                color={colors.primary}
              />

              <Text
                numberOfLines={1}
                className="mt-2 text-sm font-bold text-text-primary"
              >
                {community.category || "Other"}
              </Text>

              <Text className="mt-1 text-xs text-text-secondary">
                Category
              </Text>
            </View>
          </View>

          {/* DETAILS */}

          <View className="mt-5 overflow-hidden rounded-2xl border border-border bg-surface">
            <InfoRow
              icon={
                community.privacy === "private"
                  ? "lock-closed-outline"
                  : "globe-outline"
              }
              title="Privacy"
              value={privacy}
            />

            <InfoRow
              icon="location-outline"
              title="Location"
              value={community.location}
            />

            <InfoRow
              icon="pricetag-outline"
              title="Category"
              value={community.category}
            />

            <InfoRow
              icon="person-outline"
              title="Community Owner"
              value={community.creatorId}
            />
          </View>

          {/* RULES */}

          {community.rules ? (
            <View className="mt-5 overflow-hidden rounded-2xl border border-border bg-surface">
              <View className="flex-row items-center border-b border-border px-4 py-4">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={21}
                  color={colors.primary}
                />

                <Text className="ml-3 text-base font-bold text-text-primary">
                  Community Rules
                </Text>
              </View>

              <Text className="px-4 py-4 text-sm leading-6 text-text-secondary">
                {community.rules}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}