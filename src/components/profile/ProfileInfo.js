import React, { useCallback, useState } from "react";

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
import { useFocusEffect } from "@react-navigation/native";

import { colors } from "../../theme";
import useProfile from "../../hooks/useProfile";
import { getFollowStats, setFollowingUser } from "../../services/SocialServices";

export default function ProfileInfo({ profileUserId, isOwnProfile }) {
  const navigation = useNavigation();

  const { width } = useWindowDimensions();

  const isWeb = width >= 768;
  const isDesktop = width >= 1100;

  const { profile, pets, refreshing } = useProfile(profileUserId, {
    publicProfile: !isOwnProfile,
  });
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0,
    isFollowing: false,
  });
  const [followBusy, setFollowBusy] = useState(false);
  const [followError, setFollowError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getFollowStats(profileUserId)
        .then((stats) => {
          if (active) setFollowStats(stats);
        })
        .catch((error) => console.error("Profile follow counts failed:", error));
      return () => {
        active = false;
      };
    }, [profileUserId]),
  );

  const toggleFollow = async () => {
    if (followBusy) return;
    setFollowBusy(true);
    setFollowError("");
    try {
      const result = await setFollowingUser(profileUserId, !followStats.isFollowing);
      setFollowStats((current) => ({
        ...current,
        isFollowing: result.isFollowing,
        followers: Math.max(
          0,
          current.followers + (result.changed ? (result.isFollowing ? 1 : -1) : 0),
        ),
      }));
    } catch (error) {
      console.error("Follow update failed:", error);
      setFollowError("Could not update your follow. Please try again.");
    } finally {
      setFollowBusy(false);
    }
  };

  const profileImage = profile?.profileImageUrl || null;

  const name = profile?.name || (isOwnProfile ? "Your Name" : "Profile unavailable");

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

        <View className="mt-4 w-full max-w-[520px] flex-row items-center justify-center gap-8">
          <View className="items-center">
            <Text className="text-base font-extrabold text-text-primary">
              {followStats.followers.toLocaleString()}
            </Text>
            <Text className="text-xs text-text-secondary">Followers</Text>
          </View>
          <View className="items-center">
            <Text className="text-base font-extrabold text-text-primary">
              {followStats.following.toLocaleString()}
            </Text>
            <Text className="text-xs text-text-secondary">Following</Text>
          </View>
        </View>

        {isOwnProfile ? (
          <Pressable
            onPress={() => navigation.navigate("ProfileEdit")}
            className="mt-4 items-center justify-center rounded-xl bg-primary"
            style={{ width: isDesktop ? 190 : "100%", maxWidth: 420, paddingVertical: 13 }}
          >
            <Text className="font-extrabold text-background">Edit Profile</Text>
          </Pressable>
        ) : (
          <View className="mt-4 w-full max-w-[520px] flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              onPress={toggleFollow}
              disabled={followBusy || !profile}
              className={`h-11 flex-1 items-center justify-center rounded-xl ${followStats.isFollowing ? "bg-surface" : "bg-primary"}`}
            >
              <Text className={`font-extrabold ${followStats.isFollowing ? "text-text-primary" : "text-background"}`}>
                {followBusy ? "Please wait..." : followStats.isFollowing ? "Following" : "Follow"}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate("DirectMessage", {
                userId: profileUserId,
                name: profile?.name || "Pet parent",
                photoUrl: profile?.profileImageUrl || null,
              })}
              className="h-11 flex-1 flex-row items-center justify-center rounded-xl border border-border bg-surface"
            >
              <Ionicons name="chatbubble-outline" size={17} color={colors["text-primary"]} />
              <Text className="ml-2 font-bold text-text-primary">Message</Text>
            </Pressable>
          </View>
        )}
        {followError ? <Text className="mt-2 text-xs text-accent">{followError}</Text> : null}
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

          {isOwnProfile ? <Pressable
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
          </Pressable> : null}
        </View>

        {refreshing && !profile ? (
          <Text className="py-6 text-center text-sm text-text-secondary">Loading profile...</Text>
        ) : pets.length > 0 ? (
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
                    onPress={isOwnProfile ? () => navigation.navigate("EditPet", { petId }) : undefined}
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

                    {isOwnProfile ? <View className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary">
                      <Ionicons
                        name="pencil"
                        size={11}
                        color={colors["text-primary"]}
                      />
                    </View> : null}
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
