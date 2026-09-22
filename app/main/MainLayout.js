import React from "react";
import { Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// bottom tabs screens
import HomeScreen from "../(tabs)/HomeScreen";
import DiscoverScreen from "../(tabs)/DiscoverScreen";
import CommunitiesScreen from "../(tabs)/CommunitiesScreen";
import ShopScreen from "../(tabs)/ShopScreen";
import ProfileScreen from "../(tabs)/ProfileScreen";

//home nav to other screens import
import AddStoryScreen from "./AddStoryScreen";
import StoryViewerScreen from "./StoryViewerScreen";
import MediaEditorScreen from "./MediaEditorScreen";

//Profile to other screens import
import NewPostScreen from "./NewPostScreen";

import { colors } from "../../src/theme";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarShowLabel: true,

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors["text-secondary"],

        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,

          height: 62 + insets.bottom,

          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 6),

          elevation: 10,

          shadowOpacity: 0.15,
          shadowRadius: 8,
          shadowOffset: {
            width: 0,
            height: -2,
          },
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginBottom: Platform.OS === "android" ? 2 : 0,
        },

        tabBarIcon: ({ focused, color }) => {
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
              iconName = focused ? "bag-handle" : "bag-handle-outline";
              break;

            case "Profile":
              iconName = focused ? "person-circle" : "person-circle-outline";
              break;

            default:
              iconName = "ellipse-outline";
          }

          return <Ionicons name={iconName} size={22} color={color} />;
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

export default function MainLayout() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />

      <Stack.Screen name="NewPost" component={NewPostScreen} />

      <Stack.Screen name="AddStory" component={AddStoryScreen} />
      <Stack.Screen name="MediaEditor" component={MediaEditorScreen} />
      <Stack.Screen name="StoryViewer" component={StoryViewerScreen} />
    </Stack.Navigator>
  );
}
