import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

const CATEGORIES = [
  {
    id: "food",
    name: "Food",
    icon: "restaurant-outline",
  },
  {
    id: "toys",
    name: "Toys",
    icon: "tennisball-outline",
  },
  {
    id: "accessories",
    name: "Accessories",
    icon: "diamond-outline",
  },
  {
    id: "grooming",
    name: "Grooming",
    icon: "cut-outline",
  },
  {
    id: "health",
    name: "Health",
    icon: "medkit-outline",
  },
  {
    id: "beds",
    name: "Beds",
    icon: "bed-outline",
  },
];

export default function ShopCategories({
  selectedCategory,
  onCategoryPress,
}) {
  return (
    <View className="bg-background py-4">
      <Text className="px-4 text-[16px] font-extrabold text-text-primary">
        Categories
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4 pt-3"
      >
        {CATEGORIES.map((category) => {
          const active = selectedCategory === category.id;

          return (
            <Pressable
              key={category.id}
              onPress={() => onCategoryPress?.(category.id)}
              className="mr-4 w-[54px] items-center active:opacity-80"
            >
              <View
                className={`h-[50px] w-[50px] items-center justify-center rounded-full border ${
                  active
                    ? "border-primary bg-surface-icon"
                    : "border-border bg-surface"
                }`}
              >
                <Ionicons
                  name={category.icon}
                  size={23}
                  color={
                    active
                      ? colors.primary
                      : colors["icon-muted"]
                  }
                />
              </View>

              <Text
                numberOfLines={1}
                className={`mt-1.5 text-[10px] font-medium ${
                  active
                    ? "text-primary"
                    : "text-text-secondary"
                }`}
              >
                {category.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}