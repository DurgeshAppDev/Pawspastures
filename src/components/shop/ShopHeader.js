import React from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function ShopHeader({
  searchText,
  onSearchChange,
  onSearchPress,
  onCartPress,
}) {
  return (
    <View className="border-b border-border bg-background px-4 pb-5 pt-3">
      {/* Top header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="ml-3">
            <Text className="text-[20px] font-extrabold tracking-[-0.3px] text-text-primary">
              Shop
            </Text>

            <Text className="mt-[1px] text-[11px] text-text-secondary">
              For your companions
            </Text>
          </View>
        </View>

        {/* Cart */}
        <Pressable
          onPress={onCartPress}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface active:opacity-80"
        >
          <Ionicons
            name="cart-outline"
            size={25}
            color={colors.primary}
          />

          <View className="absolute right-[7px] top-[6px] h-[7px] w-[7px] rounded-full bg-primary" />
        </Pressable>
      </View>

      {/* Intro */}
      <View className="mt-5">
        <Text className="text-[19px] font-extrabold text-text-primary">
          Curated for your companions.
        </Text>

        <Text className="mt-1.5 max-w-[310px] text-[13px] leading-[19px] text-text-muted">
          Discover premium food, engaging toys, and stylish accessories
          selected by our community.
        </Text>
      </View>

      {/* Search */}
      <View className="mt-4 h-[44px] flex-row items-center rounded-full border border-border bg-surface px-3">
       
        <TextInput
          value={searchText}
          onChangeText={onSearchChange}
          placeholder="Search brands, products..."
          placeholderTextColor={colors["text-placeholder"]}
          className="ml-2 flex-1 text-[13px] text-text-primary"
          returnKeyType="search"
          onSubmitEditing={onSearchPress}
        />

        <Pressable
          onPress={onSearchPress}
          className="h-7 w-7 items-center justify-center rounded-full  active:opacity-80"
        >
         <Ionicons
          name="search-outline"
          size={19}
          color={colors["text-secondary"]}
        />

        </Pressable>
      </View>
    </View>
  );
}