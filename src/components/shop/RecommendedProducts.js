import React from "react";
import { View, Text } from "react-native";

import ProductCard from "./ProductCard";

const PRODUCTS = [
  {
    id: "1",
    brand: "Hound & Hide",
    name: "Artisanal Leather Collar",
    price: "45.00",
    badge: "TOP RATED",
    image:
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: "2",
    brand: "Wild Catch",
    name: "Alaskan Salmon Kibble - 15lb",
    price: "68.00",
    image:
      "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: "3",
    brand: "Paws & Co.",
    name: "Premium Interactive Toy",
    price: "24.00",
    badge: "POPULAR",
    image:
      "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: "4",
    brand: "Happy Tails",
    name: "Natural Dental Chews",
    price: "19.00",
    image:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: "5",
    brand: "Pawfect",
    name: "Comfort Memory Foam Bed",
    price: "72.00",
    badge: "BEST SELLER",
    image:
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: "6",
    brand: "Natural Paws",
    name: "Organic Chicken Treats",
    price: "16.00",
    image:
      "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=700&q=85",
  },
];

export default function RecommendedProducts({
  onProductPress,
  onFavoritePress,
  onCartPress,
}) {
  return (
    <View className="px-4 pb-6 pt-2">
      {/* Section label */}
      <Text className="text-[11px] font-extrabold uppercase tracking-[0.7px] text-primary">
        Tailored for you
      </Text>

      {/* Section title */}
      <Text className="mt-1 text-[17px] font-extrabold text-text-primary">
        Recommended for Barnaby
      </Text>

      {/* TWO COLUMN GRID */}
      <View className="mt-3 flex-row flex-wrap justify-between">
        {PRODUCTS.map((product) => (
          <View
            key={product.id}
            className="mb-3"
          >
            <ProductCard
              product={product}
              onProductPress={onProductPress}
              onFavoritePress={onFavoritePress}
              onCartPress={onCartPress}
            />
          </View>
        ))}
      </View>
    </View>
  );
}