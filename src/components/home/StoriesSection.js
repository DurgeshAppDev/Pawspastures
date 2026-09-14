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
    <View
      className="border-y py-[15px]"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-between px-[18px]">
        <Text
          style={{ color: colors.white }}
          className="text-[17px] font-extrabold"
        >
          Stories
        </Text>

        <Pressable>
          <Text
            style={{ color: colors.primary }}
            className="text-[13px] font-bold"
          >
            See all
          </Text>
        </Pressable>
      </View>

      {/* Stories List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 18,
        }}
      >
        {stories.map((story) => (
          <Pressable
            key={story.id}
            onPress={() => onStoryPress?.(story)}
            className="mr-4 w-[66px] items-center"
          >
            {/* Story Circle */}
            <View
              className="h-[62px] w-[62px] items-center justify-center rounded-full border-2"
              style={{
                backgroundColor: colors.elevated,
                borderColor: colors.primary,
              }}
            >
              {story.isOwn ? (
                <View
                  className="h-[54px] w-[54px] items-center justify-center rounded-full"
                  style={{
                    backgroundColor: colors.surfaceIcon,
                  }}
                >
                  <Ionicons name="add" size={28} color={colors.primary} />
                </View>
              ) : (
                <Ionicons name="paw" size={27} color={colors.primary} />
              )}
            </View>

            <Text
              numberOfLines={1}
              style={{
                color: story.isOwn ? colors.white : colors.secondary,
              }}
              className="mt-[7px] text-[12px] font-semibold"
            >
              {story.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
