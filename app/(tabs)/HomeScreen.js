import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  FlatList,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../src/theme";

/*
|--------------------------------------------------------------------------
| MOCK STORIES
|--------------------------------------------------------------------------
| These are temporary.
|
| Later:
| Fetch stories from Firebase/Firestore and replace this array.
|--------------------------------------------------------------------------
*/

const stories = [
  {
    id: "1",
    username: "Your Story",
    image:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300",
    isOwn: true,
  },
  {
    id: "2",
    username: "Luna",
    image:
      "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=300",
  },
  {
    id: "3",
    username: "Max",
    image:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300",
  },
  {
    id: "4",
    username: "Bella",
    image:
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300",
  },
  {
    id: "5",
    username: "Rocky",
    image:
      "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=300",
  },
];

/*
|--------------------------------------------------------------------------
| MOCK FEED
|--------------------------------------------------------------------------
| Posts and reels are intentionally mixed together.
|
| Later:
| Replace this data with Firebase/Firestore data.
|
| Example:
| const feed = await getFeedFromFirebase();
|--------------------------------------------------------------------------
*/

const initialFeed = [
  {
    id: "post-1",
    type: "post",

    user: {
      name: "Luna's Mom",
      username: "@lunasworld",
      avatar:
        "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=200",
    },

    media:
      "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=900",

    caption:
      "Morning walks are always better with my best friend 🐾❤️",

    likes: 124,
    comments: 18,
    shares: 6,

    liked: false,
    saved: false,
  },

  {
    id: "reel-1",
    type: "reel",

    user: {
      name: "Rocky",
      username: "@rocky_the_dog",
      avatar:
        "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=200",
    },

    media:
      "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=900",

    caption: "POV: You hear the treat packet opening 👀🐶",

    likes: 982,
    comments: 74,
    shares: 31,

    liked: false,
    saved: false,
  },

  {
    id: "post-2",
    type: "post",

    user: {
      name: "Bella",
      username: "@bellasdiary",
      avatar:
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200",
    },

    media:
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=900",

    caption:
      "Just enjoying the sunshine today ☀️🐾 What is your pet doing?",

    likes: 246,
    comments: 32,
    shares: 12,

    liked: false,
    saved: false,
  },

  {
    id: "reel-2",
    type: "reel",

    user: {
      name: "Max",
      username: "@max_adventures",
      avatar:
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200",
    },

    media:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=900",

    caption: "Weekend adventure mode activated 🐕🌳",

    likes: 641,
    comments: 49,
    shares: 22,

    liked: false,
    saved: false,
  },
];

/*
|--------------------------------------------------------------------------
| STORY ITEM
|--------------------------------------------------------------------------
*/

function StoryItem({ story }) {
  return (
    <Pressable className="items-center mr-4">
      <View
        className="rounded-full p-[2px]"
        style={{
          borderWidth: 2,
          borderColor: story.isOwn
            ? colors.border
            : colors.primary,
        }}
      >
        <Image
          source={{ uri: story.image }}
          className="w-[64px] h-[64px] rounded-full"
        />

        {story.isOwn && (
          <View
            className="absolute bottom-0 right-0 w-5 h-5 rounded-full items-center justify-center"
            style={{
              backgroundColor: colors.primary,
              borderWidth: 2,
              borderColor: colors.background,
            }}
          >
            <Ionicons
              name="add"
              size={13}
              color={colors.textPrimary}
            />
          </View>
        )}
      </View>

      <Text
        numberOfLines={1}
        className="mt-2 text-xs max-w-[68px] text-center"
        style={{
          color: colors.textSecondary,
        }}
      >
        {story.username}
      </Text>
    </Pressable>
  );
}

/*
|--------------------------------------------------------------------------
| FEED HEADER
|--------------------------------------------------------------------------
*/

function FeedUser({ item }) {
  return (
    <View className="flex-row items-center px-4 py-3">
      <Image
        source={{ uri: item.user.avatar }}
        className="w-10 h-10 rounded-full"
      />

      <View className="flex-1 ml-3">
        <Text
          className="font-semibold text-sm"
          style={{
            color: colors.textPrimary,
          }}
        >
          {item.user.name}
        </Text>

        <Text
          className="text-xs mt-0.5"
          style={{
            color: colors.textSecondary,
          }}
        >
          {item.user.username}
        </Text>
      </View>

      <Pressable className="p-2">
        <Ionicons
          name="ellipsis-horizontal"
          size={20}
          color={colors.textSecondary}
        />
      </Pressable>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| FEED MEDIA
|--------------------------------------------------------------------------
*/

function FeedMedia({ item }) {
  if (item.type === "reel") {
    return (
      <View
        className="relative w-full"
        style={{
          backgroundColor: colors.surfaceElevated,
        }}
      >
        {/*
          FUTURE FIREBASE:

          Replace this image with an Expo-compatible video component
          when reel videos are stored in Firebase Storage.

          Example future flow:

          Firebase Storage
                 ↓
          video URL
                 ↓
          ReelCard
        */}

        <Image
          source={{ uri: item.media }}
          className="w-full h-[430px]"
          resizeMode="cover"
        />

        {/* Reel indicator */}
        <View
          className="absolute top-3 left-3 flex-row items-center px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: colors.surfaceIcon,
          }}
        >
          <Ionicons
            name="play"
            size={13}
            color={colors.primary}
          />

          <Text
            className="text-xs font-semibold ml-1.5"
            style={{
              color: colors.textPrimary,
            }}
          >
            Reel
          </Text>
        </View>

        {/* Play icon */}
        <View className="absolute inset-0 items-center justify-center">
          <View
            className="w-16 h-16 rounded-full items-center justify-center"
            style={{
              backgroundColor: colors.surfaceIcon,
            }}
          >
            <Ionicons
              name="play"
              size={28}
              color={colors.textPrimary}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: item.media }}
      className="w-full h-[380px]"
      resizeMode="cover"
    />
  );
}

/*
|--------------------------------------------------------------------------
| FEED ACTIONS
|--------------------------------------------------------------------------
*/

function FeedActions({ item, onLike, onSave }) {
  return (
    <View className="px-4 pt-3">
      <View className="flex-row items-center">
        {/* Like */}
        <Pressable
          onPress={() => onLike(item.id)}
          className="mr-5"
        >
          <Ionicons
            name={item.liked ? "heart" : "heart-outline"}
            size={26}
            color={
              item.liked
                ? colors.primary
                : colors.textPrimary
            }
          />
        </Pressable>

        {/* Comment */}
        <Pressable className="mr-5">
          <Ionicons
            name="chatbubble-outline"
            size={25}
            color={colors.textPrimary}
          />
        </Pressable>

        {/* Share */}
        <Pressable className="mr-5">
          <Ionicons
            name="paper-plane-outline"
            size={25}
            color={colors.textPrimary}
          />
        </Pressable>

        <View className="flex-1" />

        {/* Save */}
        <Pressable
          onPress={() => onSave(item.id)}
        >
          <Ionicons
            name={item.saved ? "bookmark" : "bookmark-outline"}
            size={25}
            color={colors.textPrimary}
          />
        </Pressable>
      </View>

      {/* Likes */}
      <Text
        className="font-semibold text-sm mt-3"
        style={{
          color: colors.textPrimary,
        }}
      >
        {item.likes + (item.liked ? 1 : 0)} likes
      </Text>

      {/* Caption */}
      <Text
        className="text-sm mt-2 leading-5"
        style={{
          color: colors.textPrimary,
        }}
      >
        <Text className="font-semibold">
          {item.user.username}
        </Text>{" "}
        {item.caption}
      </Text>

      {/* Comments */}
      {item.comments > 0 && (
        <Pressable className="mt-2">
          <Text
            className="text-sm"
            style={{
              color: colors.textSecondary,
            }}
          >
            View all {item.comments} comments
          </Text>
        </Pressable>
      )}

      {/* Bottom spacing */}
      <View className="h-4" />
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| FEED CARD
|--------------------------------------------------------------------------
*/

function FeedCard({ item, onLike, onSave }) {
  return (
    <View
      className="mb-3"
      style={{
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
      }}
    >
      <FeedUser item={item} />

      <FeedMedia item={item} />

      <FeedActions
        item={item}
        onLike={onLike}
        onSave={onSave}
      />
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| HOME SCREEN
|--------------------------------------------------------------------------
*/

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const [feed, setFeed] = useState(initialFeed);

  /*
  |--------------------------------------------------------------------------
  | LIKE
  |--------------------------------------------------------------------------
  */

  const handleLike = (id) => {
    setFeed((currentFeed) =>
      currentFeed.map((item) =>
        item.id === id
          ? {
              ...item,
              liked: !item.liked,
            }
          : item
      )
    );

    /*
      FUTURE FIREBASE:

      Update the user's like in Firestore here.

      Example:

      await likePost(id, currentUser.uid);
    */
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE
  |--------------------------------------------------------------------------
  */

  const handleSave = (id) => {
    setFeed((currentFeed) =>
      currentFeed.map((item) =>
        item.id === id
          ? {
              ...item,
              saved: !item.saved,
            }
          : item
      )
    );

    /*
      FUTURE FIREBASE:

      Save/remove the post or reel for the current user.
    */
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: colors.background,

        /*
          Important:

          This keeps the Home header below the Android/iOS
          status bar instead of allowing text to hide underneath it.
        */
        paddingTop: insets.top,
      }}
    >
      <StatusBar
        style="light"
        backgroundColor={colors.background}
      />

      {/* ============================================================
          HEADER
      ============================================================ */}

      <View
        className="flex-row items-center px-4 py-3"
        style={{
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {/* App title */}

        <View className="flex-1">
          <Text
            className="text-2xl font-bold"
            style={{
              color: colors.textPrimary,
            }}
          >
            Paws & Pastures
          </Text>

          <Text
            className="text-xs mt-0.5"
            style={{
              color: colors.textSecondary,
            }}
          >
            Where pets bring people together
          </Text>
        </View>

        {/* Notifications */}

        <Pressable className="p-2 mr-1">
          <Ionicons
            name="notifications-outline"
            size={25}
            color={colors.textPrimary}
          />
        </Pressable>

        {/* Messages */}

        <Pressable className="p-2">
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={25}
            color={colors.textPrimary}
          />
        </Pressable>
      </View>

      {/* ============================================================
          MAIN CONTENT
      ============================================================ */}

      <FlatList
        data={feed}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}

        /*
          Header contains Stories.
        */

        ListHeaderComponent={
          <View
            style={{
              backgroundColor: colors.background,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            {/* Stories title */}

            <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
              <Text
                className="text-lg font-bold"
                style={{
                  color: colors.textPrimary,
                }}
              >
                Stories
              </Text>

              <Pressable>
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color: colors.primary,
                  }}
                >
                  See All
                </Text>
              </Pressable>
            </View>

            {/* Stories horizontal list */}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingLeft: 16,
                paddingRight: 8,
                paddingBottom: 16,
              }}
            >
              {stories.map((story) => (
                <StoryItem
                  key={story.id}
                  story={story}
                />
              ))}
            </ScrollView>

            {/* Feed heading */}

            <View className="px-4 pb-3 pt-2">
              <Text
                className="text-lg font-bold"
                style={{
                  color: colors.textPrimary,
                }}
              >
                For You
              </Text>

              <Text
                className="text-xs mt-1"
                style={{
                  color: colors.textSecondary,
                }}
              >
                Posts and reels from the pet community
              </Text>
            </View>
          </View>
        }

        /*
          Each item can be either:

          post
          OR
          reel

          They appear together in the same feed.
        */

        renderItem={({ item }) => (
          <FeedCard
            item={item}
            onLike={handleLike}
            onSave={handleSave}
          />
        )}

        contentContainerStyle={{
          paddingBottom: 30,
        }}
      />
    </View>
  );
}