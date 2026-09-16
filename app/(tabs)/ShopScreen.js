import React, { useState } from "react";
import {
  View,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import ShopHeader from "../../src/components/shop/ShopHeader";
import ShopCategories from "../../src/components/shop/ShopCategories";
import RecommendedProducts from "../../src/components/shop/RecommendedProducts";

import { colors } from "../../src/theme";

export default function ShopScreen() {
  const insets = useSafeAreaInsets();

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("food");

  const handleSearch = () => {
    if (!searchText.trim()) {
      return;
    }

    Alert.alert(
      "Search",
      `Searching for "${searchText.trim()}"`
    );
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
  };

  const handleCartPress = () => {
    Alert.alert(
      "Your Cart",
      "Your shopping cart will open here."
    );
  };

  const handleProductPress = (product) => {
    Alert.alert(
      product.name,
      "Product details will open here."
    );
  };

  const handleFavoritePress = (product) => {
    console.log("Favorite:", product.name);
  };

  const handleProductCartPress = (product) => {
    Alert.alert(
      "Added to Cart",
      `${product.name} has been added to your cart.`
    );
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
        translucent={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="pb-5"
      >
        <ShopHeader
          searchText={searchText}
          onSearchChange={setSearchText}
          onSearchPress={handleSearch}
          onCartPress={handleCartPress}
        />

        <ShopCategories
          selectedCategory={selectedCategory}
          onCategoryPress={handleCategoryPress}
        />

        <RecommendedProducts
          onProductPress={handleProductPress}
          onFavoritePress={handleFavoritePress}
          onCartPress={handleProductCartPress}
        />
      </ScrollView>
    </View>
  );
}