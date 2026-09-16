import React, { useState } from "react";
import { View, Text, Pressable, Image, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function ProductCard({
  product,
  onProductPress,
  onFavoritePress,
  onCartPress,
}) {
  const [favorite, setFavorite] = useState(false);

  const { width } = useWindowDimensions();

  // Maximum content width is based on your mobile-style web layout.
  const contentWidth = Math.min(width, 430);

  // Two equal cards with a 12px gap.
  const cardWidth = (contentWidth - 32 - 12) / 2;

  const handleFavorite = () => {
    setFavorite((value) => !value);
    onFavoritePress?.(product);
  };

  return (
    <Pressable
      onPress={() => onProductPress?.(product)}
      style={{ width: cardWidth }}
      className="overflow-hidden rounded-[16px] border border-border bg-surface active:opacity-90"
    >
      {/* FIXED IMAGE AREA */}
      <View className="h-[150px] w-full overflow-hidden bg-surface-elevated">
        <Image
          source={{ uri: product.image }}
          className="h-full w-full"
          resizeMode="cover"
        />

        {/* Favorite */}
        <Pressable
          onPress={handleFavorite}
          className="absolute right-2.5 top-2.5 h-8 w-8 items-center justify-center rounded-full border border-border bg-background"
        >
          <Ionicons
            name={favorite ? "heart" : "heart-outline"}
            size={17}
            color={
              favorite
                ? colors.primary
                : colors["text-primary"]
            }
          />
        </Pressable>

        {/* Badge */}
        {product.badge && (
          <View className="absolute bottom-2.5 left-2.5 rounded-full bg-primary px-2.5 py-1">
            <Text className="text-[8px] font-extrabold text-background">
              {product.badge}
            </Text>
          </View>
        )}
      </View>

      {/* FIXED CONTENT AREA */}
      <View className="h-[112px] px-3 pb-3 pt-2.5">
        {/* Brand */}
        <Text
          numberOfLines={1}
          className="text-[11px] font-medium text-text-secondary"
        >
          {product.brand}
        </Text>

        {/* Product name */}
        <View className="mt-1 h-[38px]">
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            className="text-[14px] font-bold leading-[18px] text-text-primary"
          >
            {product.name}
          </Text>
        </View>

        {/* Price + cart */}
        <View className="mt-2 flex-1 flex-row items-end justify-between">
          <Text className="text-[17px] font-extrabold text-primary">
            ${product.price}
          </Text>

          <Pressable
            onPress={() => onCartPress?.(product)}
            className="h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-elevated active:opacity-80"
          >
            <Ionicons
              name="cart-outline"
              size={16}
              color={colors["text-primary"]}
            />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}