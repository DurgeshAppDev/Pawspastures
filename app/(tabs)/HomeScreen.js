import React from "react";

import { View, Text, ScrollView, StatusBar, Platform } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useNavigation } from "@react-navigation/native";

import { colors } from "../../src/theme/colors";

import HomeHeader from "../../src/components/home/HomeHeader";
import StoriesSection from "../../src/components/home/StoriesSection";
import PostCard from "../../src/components/home/PostCard";
import ReelCard from "../../src/components/home/ReelCard";

const FEED = [
  {
    id: "post-1",
    type: "post",
    userName: "Rocky & Sam",
    petName: "Rocky",
    time: "2h ago",
    likes: 248,
    comments: 18,
    caption:
      "Morning walks are always better when you have your best friend beside you 🐾",
    image: null,
  },

  {
    id: "reel-1",
    type: "reel",
    userName: "Bella's World",
    caption: "Someone discovered a new favorite toy 🐶",
  },

  {
    id: "post-2",
    type: "post",
    userName: "Luna's Family",
    petName: "Luna",
    time: "5h ago",
    likes: 391,
    comments: 27,
    caption: "Just enjoying a peaceful afternoon in the garden.",
    image: null,
  },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  const isWeb = Platform.OS === "web";

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1"
      style={{
        backgroundColor: colors.background,
      }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
        translucent={false}
      />

      <View
        className="flex-1"
        style={{
          alignItems: isWeb ? "center" : "stretch",
        }}
      >
        <View
          className="flex-1 w-full"
          style={{
            maxWidth: isWeb ? 720 : undefined,
          }}
        >
          {/* HEADER */}

          <HomeHeader
            onNotificationsPress={() => {}}
            onMessagesPress={() => {}}
          />

          {/* FEED */}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 110,
            }}
          >
            {/* STORIES */}

            <StoriesSection
              onStoryPress={(story) => {
                if (story.isOwn) {
                  navigation.navigate("AddStory");
                } else {
                  navigation.navigate("StoryViewer", {
                    storyId: story.id,
                  });
                }
              }}
            />

            {/* FEED HEADING */}

            <View
              className="px-[18px] pb-3 pt-5"
              style={{
                backgroundColor: colors.background,
              }}
            >
              <Text
                className="text-[18px] font-extrabold"
                style={{
                  color: colors.white,
                }}
              >
                For you
              </Text>

              <Text
                className="mt-[3px] text-[13px]"
                style={{
                  color: colors["text-secondary"],
                }}
              >
                Discover moments from the pet community
              </Text>
            </View>

            {/* MIXED FEED */}

            {FEED.map((item) => {
              if (item.type === "reel") {
                return <ReelCard key={item.id} reel={item} />;
              }

              return (
                <PostCard
                  key={item.id}
                  post={item}
                  onComment={() => {}}
                  onProfilePress={() => {}}
                />
              );
            })}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
