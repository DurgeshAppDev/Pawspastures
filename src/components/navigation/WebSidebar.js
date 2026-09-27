import React, { useState } from "react";

import { Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

const NAV_ITEMS = [
  {
    name: "Home",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    name: "Discover",
    icon: "compass-outline",
    activeIcon: "compass",
  },
  {
    name: "Communities",
    icon: "people-outline",
    activeIcon: "people",
  },
  {
    name: "Shop",
    icon: "bag-handle-outline",
    activeIcon: "bag-handle",
  },
  {
    name: "Profile",
    icon: "person-circle-outline",
    activeIcon: "person-circle",
  },
];

export default function WebSidebar({ state, navigation }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      className="absolute bottom-0 left-0 top-0 z-50"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        width: expanded ? 230 : 76,
        backgroundColor: colors.surface,
        borderRightWidth: 1,
        borderRightColor: colors.border,
        transitionProperty: "width",
        transitionDuration: "180ms",
        transitionTimingFunction: "ease",
      }}
    >
      {/* BRAND */}

      <View
        className="h-[82px] justify-center px-4"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {expanded ? (
          <Text
            className="text-[19px] font-extrabold"
            numberOfLines={1}
            style={{
              color: colors["text-primary"],
            }}
          >
            Paws & Pastures
          </Text>
        ) : (
          <View className="items-center">
            <Ionicons name="paw" size={28} color={colors.primary} />
          </View>
        )}
      </View>

      {/* NAVIGATION */}

      <View className="mt-5 px-3">
        {NAV_ITEMS.map((item, index) => {
          const focused = state.index === index;

          return (
            <Pressable
              key={item.name}
              onPress={() => {
                navigation.navigate(item.name);
              }}
              className="mb-2 h-[52px] flex-row items-center rounded-xl"
              style={{
                backgroundColor: focused
                  ? colors["surface-elevated"]
                  : "transparent",
              }}
            >
              <View className="h-[52px] w-[50px] items-center justify-center">
                <Ionicons
                  name={focused ? item.activeIcon : item.icon}
                  size={24}
                  color={focused ? colors.primary : colors["text-secondary"]}
                />
              </View>

              {expanded && (
                <Text
                  className="ml-2 text-[14px] font-semibold"
                  style={{
                    color: focused ? colors.primary : colors["text-secondary"],
                  }}
                >
                  {item.name}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
