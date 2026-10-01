import React, { useState } from "react";

import {
  View,
  Text,
  Image,
  Pressable,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

const POSTS = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=700",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=700",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=700",
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1476234251651-f353703a034d?w=700",
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=700",
  },
];

const REELS = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=700",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=700",
  },
];

export default function ProfilePosts() {
  const [activeTab, setActiveTab] = useState("posts");

  const { width } = useWindowDimensions();

  const isWeb = width >= 768;
  const isDesktop = width >= 1100;

  const data =
    activeTab === "posts" ? POSTS : activeTab === "reels" ? REELS : [];

  const columns = isDesktop ? 4 : 3;

  return (
    <View
      style={{
        width: "100%",
        marginTop: isWeb ? 36 : 28,
      }}
    >
      {/* TABS */}

      <View
        className="flex-row border-b"
        style={{
          borderColor: colors["border-subtle"],
        }}
      >
        <Pressable
          onPress={() => setActiveTab("posts")}
          className="relative flex-1 items-center py-3"
        >
          <Text
            className={`text-[13px] font-bold ${
              activeTab === "posts" ? "text-primary" : "text-text-secondary"
            }`}
          >
            Posts
          </Text>

          {activeTab === "posts" && (
            <View className="absolute bottom-0 h-[2px] w-10 bg-primary" />
          )}
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("reels")}
          className="relative flex-1 items-center py-3"
        >
          <Text
            className={`text-[13px] font-bold ${
              activeTab === "reels" ? "text-primary" : "text-text-secondary"
            }`}
          >
            Reels
          </Text>

          {activeTab === "reels" && (
            <View className="absolute bottom-0 h-[2px] w-10 bg-primary" />
          )}
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("saved")}
          className="relative flex-1 items-center py-3"
        >
          <View className="flex-row items-center">
            <Ionicons
              name="bookmark-outline"
              size={15}
              color={
                activeTab === "saved"
                  ? colors.primary
                  : colors["text-secondary"]
              }
            />

            <Text
              className={`ml-1 text-[13px] font-bold ${
                activeTab === "saved" ? "text-primary" : "text-text-secondary"
              }`}
            >
              Saved
            </Text>
          </View>

          {activeTab === "saved" && (
            <View className="absolute bottom-0 h-[2px] w-10 bg-primary" />
          )}
        </Pressable>
      </View>

      {/* GRID */}

      {data.length > 0 ? (
        <View className="flex-row flex-wrap">
          {data.map((item) => (
            <Pressable
              key={item.id}
              style={{
                width: `${100 / columns}%`,
                borderWidth: 1,
                borderColor: colors.background,
              }}
            >
              <Image
                source={{
                  uri: item.image,
                }}
                style={{
                  width: "100%",
                  aspectRatio: 1,
                }}
                resizeMode="cover"
              />

              {activeTab === "reels" && (
                <View className="absolute right-2 top-2">
                  <Ionicons name="play" size={17} color={colors.white} />
                </View>
              )}
            </Pressable>
          ))}
        </View>
      ) : (
        <View className="items-center px-6 py-14">
          <Ionicons
            name="bookmark-outline"
            size={34}
            color={colors["icon-muted"]}
          />

          <Text
            className="mt-3 text-[15px] font-bold"
            style={{
              color: colors["text-primary"],
            }}
          >
            No saved posts yet
          </Text>

          <Text
            className="mt-1 text-center text-[13px]"
            style={{
              color: colors["text-secondary"],
            }}
          >
            Posts you save will appear here.
          </Text>
        </View>
      )}
    </View>
  );
}
