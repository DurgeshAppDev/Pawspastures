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
import { useNavigation } from "@react-navigation/native";

import { colors } from "../../theme";
import useProfile from "../../hooks/useProfile";

export default function ProfileInfo() {
  const navigation = useNavigation();

  const { width } = useWindowDimensions();

  const isWeb = width >= 768;
  const isDesktop = width >= 1100;

  const { profile, pets } = useProfile();

  const profileImage = profile?.profileImageUrl || null;

  const name = profile?.name || "Your Name";

  const age =
    profile?.age !== undefined && profile?.age !== null ? profile.age : null;

  const location = profile?.location || "";

  const interests = Array.isArray(profile?.interests) ? profile.interests : [];

  const bio = profile?.bio || "";

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
            {profileImage ? (
              <Image
                source={{
                  uri: profileImage,
                }}
                className="rounded-full"
                style={{
                  width: isDesktop ? 98 : 86,
                  height: isDesktop ? 98 : 86,
                }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons
                name="person"
                size={isDesktop ? 42 : 36}
                color={colors["icon-muted"]}
              />
            )}
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
          {name}
        </Text>

        {(age !== null || location) && (
          <Text
            style={{
              marginTop: 4,
              color: colors["text-secondary"],
              fontSize: isDesktop ? 14 : 13,
            }}
          >
            {[age, location]
              .filter(
                (value) =>
                  value !== null && value !== undefined && value !== "",
              )
              .join(" • ")}
          </Text>
        )}

        {interests.length > 0 && (
          <View
            className="flex-row flex-wrap items-center justify-center"
            style={{
              marginTop: 12,
              gap: 8,
              maxWidth: isDesktop ? 700 : 500,
            }}
          >
            {interests.slice(0, 5).map((interest, index) => (
              <View
                key={`${String(interest)}-${index}`}
                className="flex-row items-center rounded-full border bg-surface px-3 py-1.5"
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
                  {String(interest)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {bio ? (
          <View
            style={{
              marginTop: 12,
              width: "100%",
              maxWidth: isDesktop ? 620 : 520,
              paddingHorizontal: isDesktop ? 20 : 8,
            }}
          >
            <Text
              numberOfLines={3}
              ellipsizeMode="tail"
              className="text-center"
              style={{
                color: colors["text-secondary"],
                fontSize: isDesktop ? 14 : 13,
                lineHeight: isDesktop ? 21 : 19,
              }}
            >
              {bio}
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => navigation.navigate("ProfileEdit")}
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

          <Pressable
            onPress={() => navigation.navigate("AddPet")}
            className="flex-row items-center"
          >
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

        {pets.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingRight: 8,
            }}
          >
            {pets.map((pet) => {
              const petId = pet.id || pet.petId;

              return (
                <View
                  key={petId}
                  className="items-center"
                  style={{
                    marginRight: isDesktop ? 30 : 24,
                  }}
                >
                  <Pressable
                    onPress={() =>
                      navigation.navigate("EditPet", {
                        petId,
                      })
                    }
                    className="relative"
                  >
                    <View
                      className="items-center justify-center rounded-full border-2 border-border bg-surface"
                      style={{
                        width: isDesktop ? 64 : 58,
                        height: isDesktop ? 64 : 58,
                      }}
                    >
                      {pet.imageUrl ? (
                        <Image
                          source={{
                            uri: pet.imageUrl,
                          }}
                          className="rounded-full"
                          style={{
                            width: isDesktop ? 58 : 52,
                            height: isDesktop ? 58 : 52,
                          }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons
                          name="paw"
                          size={24}
                          color={colors["icon-muted"]}
                        />
                      )}
                    </View>

                    <View className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary">
                      <Ionicons
                        name="pencil"
                        size={11}
                        color={colors["text-primary"]}
                      />
                    </View>
                  </Pressable>

                  <Text
                    className="mt-2 text-xs"
                    style={{
                      color: colors["text-secondary"],
                    }}
                  >
                    {pet.petName || "Pet"}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <View className="items-center rounded-2xl bg-surface px-6 py-8">
            <Ionicons
              name="paw-outline"
              size={30}
              color={colors["icon-muted"]}
            />

            <Text
              className="mt-2 font-bold"
              style={{
                color: colors["text-primary"],
                fontSize: 14,
              }}
            >
              No pets added yet
            </Text>

            <Text
              className="mt-1 text-center"
              style={{
                color: colors["text-secondary"],
                fontSize: 12,
              }}
            >
              Add your first pet to build their identity.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
