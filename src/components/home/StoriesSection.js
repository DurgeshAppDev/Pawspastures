import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

const stories = [
  {
    id: "1",
    name: "Your Story",
    isOwn: true,
  },
  {
    id: "2",
    name: "Max",
  },
  {
    id: "3",
    name: "Bella",
  },
  {
    id: "4",
    name: "Rocky",
  },
  {
    id: "5",
    name: "Luna",
  },
  {
    id: "6",
    name: "Coco",
  },
];

export default function StoriesSection({ onStoryPress }) {
  return (
    <View className="border-y border-border bg-surface py-[15px]">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-[18px]"
      >
        {stories.map((story) => (
          <Pressable
            key={story.id}
            onPress={() => onStoryPress?.(story)}
            className="mr-4 w-[66px] items-center"
          >
            {/* Story Circle */}
            <View className="h-[62px] w-[62px] items-center justify-center rounded-full border-2 border-primary bg-surface-elevated">
              {story.isOwn ? (
                <View className="h-[54px] w-[54px] items-center justify-center rounded-full bg-surface-icon">
                  <Ionicons
                    name="add"
                    size={28}
                    color={colors.primary}
                  />
                </View>
              ) : (
                <Ionicons
                  name="paw"
                  size={27}
                  color={colors.primary}
                />
              )}
            </View>

            <Text
              numberOfLines={1}
              className={`mt-[7px] text-[12px] font-semibold ${
                story.isOwn
                  ? "text-text-primary"
                  : "text-text-secondary"
              }`}
            >
              {story.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}