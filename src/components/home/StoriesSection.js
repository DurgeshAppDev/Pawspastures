import React from "react";

import { View, Text, ScrollView, Pressable, Platform, Image } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function StoriesSection({ stories = [], ownStory, onStoryPress }) {
  const isWeb = Platform.OS === "web";

  return (
    <View
      className="border-y border-border bg-surface py-[15px]"
      style={
        isWeb
          ? {
              borderTopWidth: 0,
            }
          : undefined
      }
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-[18px]"
      >
        <Pressable onPress={() => onStoryPress?.(ownStory || { isOwn: true })} className="mr-4 w-[66px] items-center">
          <View className="h-[62px] w-[62px] items-center justify-center rounded-full border-2 border-primary bg-surface-elevated">
            {ownStory?.avatar ? <Image source={{ uri: ownStory.avatar }} className="h-[54px] w-[54px] rounded-full" /> : <View className="h-[54px] w-[54px] items-center justify-center rounded-full bg-surface-icon"><Ionicons name="paw" size={26} color={colors.primary} /></View>}
            <Pressable onPress={(event) => { event.stopPropagation?.(); onStoryPress?.({ isOwn: true, create: true }); }} className="absolute bottom-[-2px] right-[-2px] h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-primary">
              <Ionicons name="add" size={16} color={colors.white} />
            </Pressable>
          </View>
          <Text numberOfLines={1} className="mt-[7px] text-[12px] font-semibold text-text-primary">Your Story</Text>
        </Pressable>
        {stories.map((story) => (
          <Pressable
            key={story.userId}
            onPress={() => onStoryPress?.(story)}
            className="mr-4 w-[66px] items-center"
          >
            <View className="h-[62px] w-[62px] items-center justify-center rounded-full border-2 border-primary bg-surface-elevated">
              {story.avatar ? <Image source={{ uri: story.avatar }} className="h-[54px] w-[54px] rounded-full" /> : <Ionicons name="paw" size={27} color={colors.primary} />}
            </View>

            <Text
              numberOfLines={1}
              className={`mt-[7px] text-[12px] font-semibold ${
                "text-text-secondary"
              }`}
            >
              {story.stories?.[0]?.petName || story.userName || "Pet parent"}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
