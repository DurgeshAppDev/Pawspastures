import React from "react";

import { ScrollView, StatusBar, View, useWindowDimensions } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import ProfileHeader from "../../src/components/profile/ProfileHeader";
import ProfileInfo from "../../src/components/profile/ProfileInfo";
import ProfilePosts from "../../src/components/profile/ProfilePosts";
import AddPostButton from "../../src/components/profile/AddPostButton";

import { colors } from "../../src/theme";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { width } = useWindowDimensions();

  const isWeb = width >= 768;
  const isDesktop = width >= 1100;
  const isWideDesktop = width >= 1400;

  const horizontalPadding = !isWeb
    ? 0
    : isWideDesktop
      ? 48
      : isDesktop
        ? 32
        : 24;

  const contentMaxWidth = isDesktop ? 1180 : 900;

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
      }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
        translucent={false}
      />

      <View className="flex-1">
        <View
          style={{
            width: "100%",
            maxWidth: contentMaxWidth,
            alignSelf: "center",
            paddingHorizontal: horizontalPadding,
          }}
        >
          <ProfileHeader />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: isWeb ? 130 : 110,
            paddingHorizontal: horizontalPadding,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: contentMaxWidth,
              alignSelf: "center",
            }}
          >
            <ProfileInfo />
            <ProfilePosts />
          </View>
        </ScrollView>

        <AddPostButton
          onPress={() => {
            navigation.navigate("NewPost");
          }}
        />
      </View>
    </View>
  );
}
