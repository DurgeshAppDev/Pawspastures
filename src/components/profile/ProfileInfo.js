import React from "react";

import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

const PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500";

const PETS = [
  {
    id: "alice",
    name: "Alice",
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
  const { width } = useWindowDimensions();

  const isWeb = width >= 768;
  const isDesktop = width >= 1100;

  return (
    <View
      className="px-4"
      style={{
        paddingHorizontal: isWeb ? 0 : 16,
      }}
    >
      <View
        className="items-center"
        style={{
          paddingTop: isDesktop ? 28 : 16,
        }}
      >
        <View className="relative">
          <View
            className="items-center justify-center rounded-full border-2"
            style={{
              width: isDesktop ? 108 : 94,
              height: isDesktop ? 108 : 94,
              borderColor: colors.primary,
              backgroundColor: colors.surface,
            }}
          >
            <Image
              source={{ uri: PROFILE_IMAGE }}
              className="rounded-full"
              style={{
                width: isDesktop ? 98 : 86,
                height: isDesktop ? 98 : 86,
              }}
              resizeMode="cover"
            />
          </View>
        </View>

        <Text
          className="font-extrabold"
          style={{
            marginTop: isDesktop ? 15 : 12,
            color: colors["text-primary"],
            fontSize: isDesktop ? 21 : 18,
          }}
        >
          Alice
        </Text>

        <Text
          style={{
            marginTop: 4,
            color: colors["text-secondary"],
            fontSize: isDesktop ? 14 : 13,
          }}
        >
          21 • Ludhiana
        </Text>

        <View
          className="flex-row items-center"
          style={{
            marginTop: 12,
          }}
        >
          <View
            className="mr-2 flex-row items-center rounded-full border bg-surface px-3 py-1.5"
            style={{
              borderColor: colors.border,
            }}
          >
            <Ionicons name="paw" size={13} color={colors.accent} />

            <Text
              className="ml-1.5 font-semibold"
              style={{
                color: colors["text-primary"],
                fontSize: 12,
              }}
            >
              Pet Lover
            </Text>
          </View>

          <View
            className="flex-row items-center rounded-full border bg-surface px-3 py-1.5"
            style={{
              borderColor: colors.border,
            }}
          >
            <Ionicons name="camera-outline" size={13} color={colors.accent} />

            <Text
              className="ml-1.5 font-semibold"
              style={{
                color: colors["text-primary"],
                fontSize: 12,
              }}
            >
              Photography
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: 12,
            width: "100%",
            maxWidth: isDesktop ? 620 : 520,
            paddingHorizontal: isDesktop ? 20 : 8,
          }}
        >
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            className="text-center"
            style={{
              color: colors["text-secondary"],
              fontSize: isDesktop ? 14 : 13,
              lineHeight: isDesktop ? 21 : 19,
            }}
          >
            Pet lover, photographer and always looking for new adventures with
            my furry friends.
          </Text>
        </View>

        <Pressable
          className="items-center justify-center rounded-xl bg-primary"
          style={{
            marginTop: 18,
            width: isDesktop ? 190 : "100%",
            maxWidth: 420,
            paddingVertical: 13,
          }}
        >
          <Text
            className="font-extrabold"
            style={{
              color: colors.background,
              fontSize: 13,
            }}
          >
            Edit Profile
          </Text>
        </Pressable>
      </View>

      <View
        style={{
          marginTop: isDesktop ? 34 : 28,
        }}
      >
        <View className="mb-3.5 flex-row items-center justify-between">
          <Text
            className="font-extrabold"
            style={{
              color: colors["text-primary"],
              fontSize: 14,
            }}
          >
            Identities
          </Text>

          <Pressable className="flex-row items-center">
            <Ionicons name="add" size={17} color={colors.accent} />

            <Text
              className="ml-0.5 font-semibold"
              style={{
                color: colors.accent,
                fontSize: 12,
              }}
            >
              Add Pet
            </Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingRight: 8,
          }}
        >
          {PETS.map((pet) => (
            <View
              key={pet.id}
              className="items-center"
              style={{
                marginRight: isDesktop ? 30 : 24,
              }}
            >
              <View className="relative">
                <View
                  className="items-center justify-center rounded-full border-2"
                  style={{
                    width: isDesktop ? 64 : 58,
                    height: isDesktop ? 64 : 58,
                    borderColor: pet.active ? colors.primary : colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Image
                    source={{ uri: pet.image }}
                    className="rounded-full"
                    style={{
                      width: isDesktop ? 58 : 52,
                      height: isDesktop ? 58 : 52,
                    }}
                    resizeMode="cover"
                  />
                </View>

                {pet.active && (
                  <View
                    className="absolute -bottom-1 -right-1 items-center justify-center rounded-full border-2"
                    style={{
                      width: 20,
                      height: 20,
                      backgroundColor: colors.primary,
                      borderColor: colors.background,
                    }}
                  >
                    <Ionicons name="checkmark" size={11} color={colors.white} />
                  </View>
                )}
              </View>

              <Text
                className="mt-2"
                style={{
                  color: colors["text-secondary"],
                  fontSize: 11,
                }}
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
