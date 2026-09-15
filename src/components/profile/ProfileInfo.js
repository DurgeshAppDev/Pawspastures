import React from "react";
import { View, Text, Image, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

const PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500";

const PETS = [
  {
    id: "adyota",
    name: "Adyota",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
    active: true,
  },
  {
    id: "bruno",
    name: "Bruno",
    image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=300",
    active: false,
  },
  {
    id: "luna",
    name: "Luna",
    image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=300",
    active: false,
  },
];

export default function ProfileInfo() {
  return (
    <View className="px-4">
      {/* ================= PROFILE ================= */}

      <View className="items-center pt-4">
        {/* Profile Image */}
        <View className="relative">
          <View
            className="h-[94px] w-[94px] items-center justify-center rounded-full border-2"
            style={{
              borderColor: colors.primary,
              backgroundColor: colors.surface,
            }}
          >
            <Image
              source={{ uri: PROFILE_IMAGE }}
              className="h-[86px] w-[86px] rounded-full"
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Name */}
        <Text
          className="mt-3 text-[18px] font-extrabold"
          style={{ color: colors["text-primary"] }}
        >
          Alice
        </Text>

        {/* Age / Location */}
        <Text
          className="mt-1 text-[13px]"
          style={{ color: colors["text-secondary"] }}
        >
          21 • Ludhiana
        </Text>

        {/* Interests */}
        <View className="mt-3 flex-row items-center">
          {/* Pet Lover */}
          <View
            className="mr-2 flex-row items-center rounded-full border bg-surface px-3 py-1.5"
            style={{ borderColor: colors.border }}
          >
            <Ionicons name="paw" size={13} color={colors.accent} />

            <Text
              className="ml-1.5 text-[12px] font-semibold"
              style={{ color: colors["text-primary"] }}
            >
              Pet Lover
            </Text>
          </View>

          {/* Photography */}
          <View
            className="flex-row items-center rounded-full border bg-surface px-3 py-1.5"
            style={{ borderColor: colors.border }}
          >
            <Ionicons name="camera-outline" size={13} color={colors.accent} />

            <Text
              className="ml-1.5 text-[12px] font-semibold"
              style={{ color: colors["text-primary"] }}
            >
              Photography
            </Text>
          </View>
        </View>

        {/* Bio */}
        <View className="mt-3 w-full px-2">
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            className="text-center text-[13px] leading-[19px]"
            style={{ color: colors["text-secondary"] }}
          >
            Pet lover, photographer and always looking for new adventures with
            my furry friends.
          </Text>
        </View>
        {/* Profile Actions */}
        <View className="mt-4 w-full flex-row items-center">
          <Pressable className="mt-4 w-full items-center justify-center rounded-xl bg-primary py-3.5">
            <Text
              className="text-[13px] font-extrabold"
              style={{ color: colors.background }}
            >
              Edit Profile
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ================= IDENTITIES ================= */}

      <View className="mt-7">
        {/* Section Header */}
        <View className="mb-3.5 flex-row items-center justify-between">
          <Text
            className="text-[14px] font-extrabold"
            style={{ color: colors["text-primary"] }}
          >
            Identities
          </Text>

          <Pressable className="flex-row items-center">
            <Ionicons name="add" size={17} color={colors.accent} />

            <Text
              className="ml-0.5 text-[12px] font-semibold"
              style={{ color: colors.accent }}
            >
              Add Pet
            </Text>
          </Pressable>
        </View>

        {/* Pets */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="pr-2"
        >
          {PETS.map((pet) => (
            <View key={pet.id} className="mr-6 items-center">
              <View className="relative">
                <View
                  className="h-[58px] w-[58px] items-center justify-center rounded-full border-2"
                  style={{
                    borderColor: pet.active ? colors.primary : colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Image
                    source={{ uri: pet.image }}
                    className="h-[52px] w-[52px] rounded-full"
                    resizeMode="cover"
                  />
                </View>

                {pet.active && (
                  <View
                    className="absolute -bottom-1 -right-1 h-5 w-5 items-center justify-center rounded-full border-2"
                    style={{
                      backgroundColor: colors.primary,
                      borderColor: colors.background,
                    }}
                  >
                    <Ionicons name="checkmark" size={11} color={colors.white} />
                  </View>
                )}
              </View>

              <Text
                className="mt-2 text-[11px]"
                style={{ color: colors["text-secondary"] }}
              >
                {pet.name}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
