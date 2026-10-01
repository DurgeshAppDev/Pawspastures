import React, { useEffect, useRef, useState } from "react";

import {
  Animated,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../theme";

const DESKTOP_BREAKPOINT = 900;

const WEB_SIDEBAR_WIDTH = 76;
const WEB_SIDEBAR_EXPANDED_WIDTH = 230;

const MOBILE_WEB_NAV_HEIGHT = 58;
const WEB_DRAWER_WIDTH = 270;

const NAV_ITEMS = [
  {
    name: "Home",
    icon: "home",
    outlineIcon: "home-outline",
  },
  {
    name: "Discover",
    icon: "compass",
    outlineIcon: "compass-outline",
  },
  {
    name: "Communities",
    icon: "people",
    outlineIcon: "people-outline",
  },
  {
    name: "Shop",
    icon: "bag-handle",
    outlineIcon: "bag-handle-outline",
  },
  {
    name: "Profile",
    icon: "person-circle",
    outlineIcon: "person-circle-outline",
  },
];

export default function WebSidebar({ state, navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const [desktopHovered, setDesktopHovered] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sidebarWidth = useRef(new Animated.Value(WEB_SIDEBAR_WIDTH)).current;

  const currentRoute = state.routes[state.index];

  /*
   * =========================================================
   * DESKTOP SIDEBAR ANIMATION
   * =========================================================
   */

  useEffect(() => {
    if (!isDesktop) {
      sidebarWidth.setValue(WEB_SIDEBAR_WIDTH);
      setDesktopHovered(false);
      return;
    }

    Animated.timing(sidebarWidth, {
      toValue: desktopHovered ? WEB_SIDEBAR_EXPANDED_WIDTH : WEB_SIDEBAR_WIDTH,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [desktopHovered, isDesktop, sidebarWidth]);

  /*
   * =========================================================
   * CLOSE MOBILE DRAWER WHEN SWITCHING TO DESKTOP
   * =========================================================
   */

  useEffect(() => {
    if (isDesktop) {
      setDrawerOpen(false);
    }
  }, [isDesktop]);

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const navigateToTab = (routeName) => {
    const route = state.routes.find((item) => item.name === routeName);

    if (!route) {
      return;
    }

    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(routeName, route.params);
    }

    setDrawerOpen(false);
  };

  /*
   * =========================================================
   * DESKTOP WEB
   * =========================================================
   */

  if (isDesktop) {
    return (
      <Animated.View
        className="absolute left-0 top-0 z-[1000] h-full"
        onMouseEnter={() => setDesktopHovered(true)}
        onMouseLeave={() => setDesktopHovered(false)}
        style={{
          width: sidebarWidth,

          backgroundColor: colors.surface,

          borderRightWidth: 1,
          borderRightColor: colors.border,

          overflow: "hidden",

          paddingTop: 18,

          shadowColor: "#000",
          shadowOpacity: desktopHovered ? 0.22 : 0,

          shadowRadius: 12,

          shadowOffset: {
            width: 4,
            height: 0,
          },

          elevation: desktopHovered ? 12 : 0,
        }}
      >
        {/* =================================================
            DESKTOP LOGO
            ================================================= */}

        <View
          className="flex-row items-center"
          style={{
            height: 50,
            paddingHorizontal: 16,
            marginBottom: 18,
          }}
        >
          <View
            className="items-center justify-center"
            style={{
              width: 44,
              height: 44,
              flexShrink: 0,
            }}
          >
            <Ionicons name="paw" size={27} color={colors.primary} />
          </View>

          {desktopHovered && (
            <Text
              numberOfLines={1}
              className="font-bold"
              style={{
                marginLeft: 14,

                color: colors["text-primary"],

                fontSize: 17,

                flexShrink: 1,
              }}
            >
              Paws & Pastures
            </Text>
          )}
        </View>

        {/* =================================================
            DESKTOP NAVIGATION
            ================================================= */}

        <View
          className="w-full"
          style={{
            paddingHorizontal: 11,
          }}
        >
          {NAV_ITEMS.map((item) => {
            const focused = currentRoute.name === item.name;

            return (
              <Pressable
                key={item.name}
                onPress={() => navigateToTab(item.name)}
                accessibilityRole="button"
                accessibilityLabel={item.name}
                className="flex-row items-center rounded-[14px]"
                style={{
                  width: "100%",
                  height: 54,

                  paddingHorizontal: 8,

                  marginBottom: 10,

                  backgroundColor: focused ? colors.elevated : "transparent",
                }}
              >
                {/* Icon */}

                <View
                  className="items-center justify-center"
                  style={{
                    width: 54,
                    flexShrink: 0,
                  }}
                >
                  <Ionicons
                    name={focused ? item.icon : item.outlineIcon}
                    size={24}
                    color={focused ? colors.primary : colors["text-secondary"]}
                  />
                </View>

                {/* Navigation Name */}

                {desktopHovered && (
                  <Text
                    numberOfLines={1}
                    className={focused ? "font-bold" : "font-medium"}
                    style={{
                      marginLeft: 10,

                      color: focused ? colors.primary : colors["text-primary"],

                      fontSize: 15,

                      flexShrink: 1,
                    }}
                  >
                    {item.name}
                  </Text>
                )}

                {/* Selected Indicator */}

                {desktopHovered && focused && (
                  <View
                    className="ml-auto rounded-full"
                    style={{
                      width: 6,
                      height: 6,

                      backgroundColor: colors.primary,
                    }}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    );
  }

  /*
   * =========================================================
   * MOBILE WEB
   * =========================================================
   *
   * Only the hamburger button is shown here.
   *
   * Screen titles such as:
   * Home
   * Discover
   * Communities
   * Shop
   * Profile
   *
   * are rendered by their individual screens.
   *
   * This prevents duplicate headers.
   * =========================================================
   */

  return (
    <>
      {/* =====================================================
          MOBILE WEB NAVIGATION BAR
          ===================================================== */}

      <View
        className="w-full flex-row items-center"
        style={{
          height: MOBILE_WEB_NAV_HEIGHT + Math.max(insets.top, 0),

          paddingTop: Math.max(insets.top, 0),

          paddingHorizontal: 12,

          backgroundColor: colors.background,

          borderBottomWidth: 1,

          borderBottomColor: colors.border,

          flexShrink: 0,
        }}
      >
        {/* Menu Button */}

        <Pressable
          onPress={() => setDrawerOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Open navigation"
          className="items-center justify-center rounded-[14px]"
          style={{
            width: 44,
            height: 44,

            backgroundColor: colors.surface,

            borderWidth: 1,

            borderColor: colors.border,
          }}
        >
          <Ionicons name="menu" size={25} color={colors.primary} />
        </Pressable>
      </View>

      {/* =====================================================
          MOBILE WEB DRAWER
          ===================================================== */}

      {drawerOpen && (
        <View pointerEvents="box-none" className="absolute inset-0 z-[2000]">
          {/* Overlay */}

          <Pressable
            onPress={() => setDrawerOpen(false)}
            className="absolute inset-0"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.55)",
            }}
          />

          {/* Drawer */}

          <View
            className="h-full"
            style={{
              width: WEB_DRAWER_WIDTH,

              maxWidth: "82%",

              backgroundColor: colors.surface,

              borderRightWidth: 1,

              borderRightColor: colors.border,

              paddingTop: Math.max(insets.top, 18),

              paddingBottom: Math.max(insets.bottom, 18),

              shadowColor: "#000",

              shadowOpacity: 0.35,

              shadowRadius: 18,

              shadowOffset: {
                width: 4,
                height: 0,
              },

              elevation: 20,
            }}
          >
            {/* =================================================
                DRAWER HEADER
                ================================================= */}

            <View
              className="flex-row items-center justify-between"
              style={{
                minHeight: 70,

                paddingHorizontal: 20,

                borderBottomWidth: 1,

                borderBottomColor: colors.border,
              }}
            >
              <View
                className="flex-row items-center"
                style={{
                  flexShrink: 1,
                  minWidth: 0,
                }}
              >
                <View
                  className="items-center justify-center rounded-full"
                  style={{
                    width: 42,
                    height: 42,

                    backgroundColor: colors.elevated,
                  }}
                >
                  <Ionicons name="paw" size={24} color={colors.primary} />
                </View>

                <Text
                  numberOfLines={1}
                  className="font-bold"
                  style={{
                    marginLeft: 12,

                    color: colors["text-primary"],

                    fontSize: 18,

                    flexShrink: 1,
                  }}
                >
                  Paws & Pastures
                </Text>
              </View>

              {/* Close Button */}

              <Pressable
                onPress={() => setDrawerOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Close navigation"
                className="items-center justify-center rounded-xl"
                style={{
                  width: 38,
                  height: 38,

                  marginLeft: 10,

                  backgroundColor: colors.elevated,
                }}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={colors["text-secondary"]}
                />
              </Pressable>
            </View>

            {/* =================================================
                DRAWER NAVIGATION
                ================================================= */}

            <View
              className="pt-[18px]"
              style={{
                paddingHorizontal: 14,
              }}
            >
              {NAV_ITEMS.map((item) => {
                const focused = currentRoute.name === item.name;

                return (
                  <Pressable
                    key={item.name}
                    onPress={() => navigateToTab(item.name)}
                    accessibilityRole="button"
                    accessibilityLabel={item.name}
                    className="flex-row items-center rounded-[14px]"
                    style={{
                      width: "100%",

                      height: 56,

                      paddingHorizontal: 16,

                      marginBottom: 8,

                      backgroundColor: focused
                        ? colors.elevated
                        : "transparent",
                    }}
                  >
                    {/* Icon */}

                    <View
                      className="items-center justify-center"
                      style={{
                        width: 34,
                      }}
                    >
                      <Ionicons
                        name={focused ? item.icon : item.outlineIcon}
                        size={23}
                        color={
                          focused ? colors.primary : colors["text-secondary"]
                        }
                      />
                    </View>

                    {/* Navigation Name */}

                    <Text
                      className={focused ? "font-bold" : "font-medium"}
                      style={{
                        marginLeft: 12,

                        color: focused
                          ? colors.primary
                          : colors["text-primary"],

                        fontSize: 15,
                      }}
                    >
                      {item.name}
                    </Text>

                    {/* Selected Indicator */}

                    {focused && (
                      <View
                        className="ml-auto rounded-full"
                        style={{
                          width: 6,
                          height: 6,

                          backgroundColor: colors.primary,
                        }}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </>
  );
}
