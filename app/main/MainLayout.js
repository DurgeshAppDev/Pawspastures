import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeScreen from "../(tabs)/HomeScreen";
import DiscoverScreen from "../(tabs)/DiscoverScreen";
import CommunitiesScreen from "../(tabs)/CommunitiesScreen";
import ShopScreen from "../(tabs)/ShopScreen";
import ProfileScreen from "../(tabs)/ProfileScreen";

import { colors } from "../../src/theme";

const Tab = createBottomTabNavigator();

export default function MainLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarStyle: {
          backgroundColor: colors.surface,

          borderTopWidth: 1,
          borderTopColor: colors.border,

          height: 64 + insets.bottom,

          paddingTop: 8,
          paddingBottom: insets.bottom + 4,
        },

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },

        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;

            case "Discover":
              iconName = focused ? "compass" : "compass-outline";
              break;

            case "Communities":
              iconName = focused ? "people" : "people-outline";
              break;

            case "Shop":
              iconName = focused ? "bag" : "bag-outline";
              break;

            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;

            default:
              iconName = "ellipse-outline";
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Communities" component={CommunitiesScreen} />
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}