import React from "react";
import {
  View,
  ScrollView,
  StatusBar,
} from "react-native";
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
        <ProfileHeader />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-24"
        >
          <ProfileInfo />

          <ProfilePosts />
        </ScrollView>

        <AddPostButton
          onPress={() => {
            navigation.navigate("NewPost")
          }}
        />
      </View>
    </View>
  );
}