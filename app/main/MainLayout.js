import React from "react";

import { Platform, useWindowDimensions } from "react-native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { Ionicons } from "@expo/vector-icons";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeScreen from "../(tabs)/FirebaseHomeScreen";
import DiscoverScreen from "../(tabs)/DiscoverScreen";
import CommunitiesScreen from "../(tabs)/CommunitiesScreen";
import ShopScreen from "../(tabs)/ShopScreen";
import ProfileScreen from "../(tabs)/ProfileScreen";

import AddStoryScreen from "./AddStoryScreen";
import StoryViewerScreen from "./StoryViewerScreen";
import MediaEditorScreen from "./MediaEditorScreen";
import NewPostScreen from "./CreatePostScreen";
import SettingsScreen from "./SettingsScreen";

import EditProfileScreen from "../profile/EditProfileScreen";
import AddPetScreen from "../profile/AddPetScreen";
import EditPetScreen from "../profile/EditPetScreen";

import CommunityChatScreen from "../../src/components/communities/CommunityChatScreen";
import RecommendedGroupsScreen from "../../src/components/communities/RecommendedGroupsScreen";
import UpcomingEventsScreen from "../../src/components/communities/UpcomingEventsScreen";
import CreateCommunityScreen from "../../src/components/communities/CreateCommunityScreen";
import CommunityInfoScreen from "../../src/components/communities/CommunityInfoScreen";

import WebSidebar from "../../src/components/navigation/WebSidebar";

import { colors } from "../../src/theme";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const WEB_SIDEBAR_WIDTH = 76;

/**
 * =========================================================
 * MOBILE TABS
 * =========================================================
 *
 * Android + iOS remain unchanged.
 */
function MobileTabs() {
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

/**
 * =========================================================
 * WEB TABS
 * =========================================================
 */
function WebTabs() {
  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <WebSidebar {...props} />}
      screenOptions={{
        headerShown: false,

        /**
         * Desktop:
         * left sidebar.
         *
         * Phone Web:
         * top navigation bar.
         *
         * The top position is intentional:
         * it makes the mobile Web navigation part of
         * the layout instead of floating over screen
         * headers.
         */
        tabBarPosition: isDesktop ? "left" : "top",

        ...(isDesktop
          ? {
              tabBarStyle: {
                width: WEB_SIDEBAR_WIDTH,

                backgroundColor: colors.surface,

                borderRightColor: colors.border,

                borderRightWidth: 1,

                overflow: "visible",
              },
            }
          : {
              tabBarStyle: {
                backgroundColor: colors.background,

                borderBottomWidth: 0,
              },
            }),
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />

      <Tab.Screen name="Discover" component={DiscoverScreen} />

      <Tab.Screen name="Communities" component={CommunitiesScreen} />

      <Tab.Screen name="Shop" component={ShopScreen} />

      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

/**
 * =========================================================
 * MAIN TABS
 * =========================================================
 */
function MainTabs() {
  if (Platform.OS === "web") {
    return <WebTabs />;
  }

  return <MobileTabs />;
}

/**
 * =========================================================
 * MAIN STACK
 * =========================================================
 */
export default function MainLayout() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main application */}

      <Stack.Screen name="MainTabs" component={MainTabs} />

      {/* Existing screens */}

      <Stack.Screen name="NewPost" component={NewPostScreen} />

      <Stack.Screen name="AddStory" component={AddStoryScreen} />

      <Stack.Screen name="MediaEditor" component={MediaEditorScreen} />

      <Stack.Screen name="StoryViewer" component={StoryViewerScreen} />

      <Stack.Screen name="Settings" component={SettingsScreen} />

      {/* Community screens */}

      <Stack.Screen name="CommunityChat" component={CommunityChatScreen} />

      <Stack.Screen
        name="RecommendedGroups"
        component={RecommendedGroupsScreen}
      />

      <Stack.Screen name="UpcomingEvents" component={UpcomingEventsScreen} />

      <Stack.Screen name="CreateCommunity" component={CreateCommunityScreen} />

      <Stack.Screen name="CommunityInfo" component={CommunityInfoScreen} />

      <Stack.Screen name="ProfileEdit" component={EditProfileScreen} />

      <Stack.Screen name="AddPet" component={AddPetScreen} />

      <Stack.Screen name="EditPet" component={EditPetScreen} />
    </Stack.Navigator>
  );
}
