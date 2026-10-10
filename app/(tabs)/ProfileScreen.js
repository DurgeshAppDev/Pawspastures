import React, { useRef } from "react";

import { ScrollView, StatusBar, View, useWindowDimensions } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../src/config/firebase";

import ProfileHeader from "../../src/components/profile/ProfileHeader";
import ProfileInfo from "../../src/components/profile/ProfileInfo";
import ProfilePosts from "../../src/components/profile/ProfilePosts";
import AddPostButton from "../../src/components/profile/AddPostButton";

import { colors } from "../../src/theme";

export default function ProfileScreen({ route }) {
  const navigation = useNavigation();
  const profilePostsRef = useRef(null);
  const loadMoreArmedRef = useRef(false);
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
  const profileUserId = route?.params?.userId || auth.currentUser?.uid;
  const isOwnProfile = profileUserId === auth.currentUser?.uid;

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
          <ProfileHeader isOwnProfile={isOwnProfile} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={200}
          onScroll={(event) => {
            const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
            const distanceFromBottom =
              contentSize.height - (contentOffset.y + layoutMeasurement.height);

            if (contentOffset.y <= 0 || distanceFromBottom > 450) {
              loadMoreArmedRef.current = false;
            } else if (distanceFromBottom < 260 && !loadMoreArmedRef.current) {
              loadMoreArmedRef.current = true;
              profilePostsRef.current?.loadMore?.();
            }
          }}
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
            <ProfileInfo profileUserId={profileUserId} isOwnProfile={isOwnProfile} />
            <ProfilePosts
              ref={profilePostsRef}
              profileUserId={profileUserId}
              isOwnProfile={isOwnProfile}
            />
          </View>
        </ScrollView>

        {isOwnProfile ? <AddPostButton
          onPress={() => {
            navigation.navigate("NewPost");
          }}
        /> : null}
      </View>
    </View>
  );
}
