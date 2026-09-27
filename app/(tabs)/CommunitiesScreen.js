import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import CommunitiesHeader from "../../src/components/communities/CommunitiesHeader";
import MyCommunities from "../../src/components/communities/MyCommunities";
import RecommendedGroups from "../../src/components/communities/RecommendedGroups";
import UpcomingEvents from "../../src/components/communities/UpcomingEvents";

import { colors } from "../../src/theme";

const COMMUNITY_DATA = [
  {
    id: "1",
    name: "Golden Retriever Lovers",
    description: "A friendly community for Golden Retriever parents.",
    members: "12.4K members",
    activity: "18 new posts today",
    image:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "2",
    name: "Pet Parents India",
    description: "Tips, discussions and experiences from pet parents.",
    members: "8.7K members",
    activity: "31 new posts today",
    image:
      "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    name: "Dog Walkers",
    description: "Find walking partners and pet-friendly places.",
    members: "5.2K members",
    activity: "12 new posts today",
    image:
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "4",
    name: "Cat Parents",
    description: "Everything for curious cats and their humans.",
    members: "6.1K members",
    activity: "22 new posts today",
    image:
      "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=800&q=80",
  },
];

export default function CommunitiesScreen({ navigation }) {
  const { width, height } = useWindowDimensions();

  const [searchText, setSearchText] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState(COMMUNITY_DATA[0]);

  const isWeb = Platform.OS === "web";
  const isDesktopWeb = isWeb && width >= 900;

  const filteredCommunities = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return COMMUNITY_DATA;
    }

    return COMMUNITY_DATA.filter((community) =>
      community.name.toLowerCase().includes(query),
    );
  }, [searchText]);

  /*
   * CommunitiesScreen is inside MainTabs.
   * Therefore CommunityChat / Groups / Events are registered
   * in the parent Stack.
   */
  const openParentRoute = (routeName, params) => {
    const parentNavigation = navigation.getParent();

    if (parentNavigation) {
      parentNavigation.navigate(routeName, params);
      return;
    }

    Alert.alert(
      "Navigation unavailable",
      "The requested screen could not be opened.",
    );
  };

  const openCommunity = (community) => {
    setSelectedCommunity(community);

    if (!isWeb) {
      openParentRoute("CommunityChat", {
        community,
      });
    }
  };

  const openRecommendedGroups = () => {
    openParentRoute("RecommendedGroups");
  };

  const openUpcomingEvents = () => {
    openParentRoute("UpcomingEvents");
  };

  const handleCreateCommunity = () => {
    Alert.alert(
      "Create Community",
      "Community creation will be available here.",
    );
  };

  /*
   * WEB DESKTOP
   */

  if (isDesktopWeb) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1 bg-background"
        style={{
          height,
          maxHeight: height,
        }}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background}
        />

        <View className="flex-1 flex-row overflow-hidden bg-background">
          {/* LEFT PANEL */}

          <View className="w-[350px] border-r border-border bg-surface">
            <CommunitiesHeader
              searchText={searchText}
              onSearchChange={setSearchText}
              onCreatePress={handleCreateCommunity}
            />

            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 32,
              }}
            >
              <MyCommunities
                communities={filteredCommunities}
                selectedId={selectedCommunity?.id}
                onCommunityPress={openCommunity}
                variant="sidebar"
              />

              <View className="px-3">
                <Pressable
                  onPress={openRecommendedGroups}
                  className="mb-2 flex-row items-center rounded-2xl p-3 active:bg-surface-elevated"
                >
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-surface-elevated">
                    <Ionicons
                      name="people-outline"
                      size={21}
                      color={colors.primary}
                    />
                  </View>

                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-bold text-text-primary">
                      Recommended Groups
                    </Text>

                    <Text className="mt-0.5 text-xs text-text-secondary">
                      Discover new groups
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.iconMuted}
                  />
                </Pressable>

                <Pressable
                  onPress={openUpcomingEvents}
                  className="mb-2 flex-row items-center rounded-2xl p-3 active:bg-surface-elevated"
                >
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-surface-elevated">
                    <Ionicons
                      name="calendar-outline"
                      size={21}
                      color={colors.primary}
                    />
                  </View>

                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-bold text-text-primary">
                      Upcoming Events
                    </Text>

                    <Text className="mt-0.5 text-xs text-text-secondary">
                      Meet the community
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.iconMuted}
                  />
                </Pressable>
              </View>
            </ScrollView>
          </View>

          {/* RIGHT COMMUNITY CHAT */}

          <View className="flex-1 overflow-hidden bg-background">
            <WebCommunityChat community={selectedCommunity} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * MOBILE + SMALL WEB
   */

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: isWeb ? 32 : 100,
        }}
      >
        <CommunitiesHeader
          searchText={searchText}
          onSearchChange={setSearchText}
          onCreatePress={handleCreateCommunity}
        />

        <CommunityAnnouncement />

        <MyCommunities
          communities={filteredCommunities}
          selectedId={selectedCommunity?.id}
          onCommunityPress={openCommunity}
          variant="mobile"
        />

        <RecommendedGroups onPress={openRecommendedGroups} />

        <UpcomingEvents onPress={openUpcomingEvents} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------------------------------
   WEB CHAT
--------------------------------------------------------- */

function WebCommunityChat({ community }) {
  const [message, setMessage] = useState("");

  if (!community) {
    return (
      <View className="flex-1 items-center justify-center">
        <Ionicons name="people-outline" size={50} color={colors.iconMuted} />

        <Text className="mt-4 text-lg font-bold text-text-primary">
          Select a community
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* CHAT HEADER */}

      <View className="h-[76px] flex-row items-center border-b border-border bg-surface px-6">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-elevated">
          <Ionicons name="people" size={23} color={colors.primary} />
        </View>

        <View className="ml-3 flex-1">
          <Text
            numberOfLines={1}
            className="text-lg font-bold text-text-primary"
          >
            {community.name}
          </Text>

          <Text className="mt-1 text-xs text-text-secondary">
            {community.members}
          </Text>
        </View>

        <Pressable className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-surface-elevated">
          <Ionicons name="search-outline" size={20} color={colors.iconMuted} />
        </Pressable>

        <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-surface-elevated">
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={colors.iconMuted}
          />
        </Pressable>
      </View>

      {/* CHAT */}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 24,
          paddingBottom: 32,
        }}
      >
        <View className="mb-6 items-center">
          <View className="rounded-full bg-surface-elevated px-4 py-2">
            <Text className="text-xs text-text-secondary">Today</Text>
          </View>
        </View>

        <View className="mx-auto mb-6 w-full max-w-[700px] rounded-2xl border border-border bg-surface-elevated p-4">
          <View className="flex-row items-center">
            <Ionicons
              name="megaphone-outline"
              size={19}
              color={colors.primary}
            />

            <Text className="ml-2 text-sm font-bold text-text-primary">
              Community announcement
            </Text>
          </View>

          <Text className="mt-2 text-sm leading-5 text-text-secondary">
            Welcome to {community.name}. Keep conversations friendly, respectful
            and focused on pets and the community.
          </Text>
        </View>

        <View className="mx-auto w-full max-w-[700px]">
          <WebMessage
            name="Community Admin"
            message="Welcome everyone! Feel free to introduce yourself and your pet."
            time="10:12 AM"
            admin
          />

          <WebMessage
            name="Mehak"
            message="Hello everyone! Milo and I are happy to be here 🐾"
            time="10:18 AM"
          />

          <WebMessage
            name="Aarav"
            message="Anyone joining the weekend pet walk?"
            time="10:25 AM"
          />

          <WebMessage
            name="Community Admin"
            message="Yes! Details will be posted in the Events section."
            time="10:27 AM"
            admin
          />
        </View>
      </ScrollView>

      {/* MESSAGE BOX */}

      <View className="border-t border-border bg-surface px-5 py-4">
        <View className="mx-auto w-full max-w-[900px] flex-row items-center rounded-2xl border border-border bg-surface-elevated px-3 py-2">
          <Pressable className="h-10 w-10 items-center justify-center">
            <Ionicons name="happy-outline" size={23} color={colors.iconMuted} />
          </Pressable>

          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message"
            placeholderTextColor={colors.textPlaceholder}
            className="flex-1 px-2 py-2 text-base text-text-primary"
          />

          <Pressable className="h-10 w-10 items-center justify-center">
            <Ionicons
              name="attach-outline"
              size={22}
              color={colors.iconMuted}
            />
          </Pressable>

          <Pressable
            onPress={() => {
              if (message.trim()) {
                setMessage("");
              }
            }}
            className="ml-1 h-10 w-10 items-center justify-center rounded-full bg-primary"
          >
            <Ionicons name="send" size={18} color={colors.white} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function WebMessage({ name, message, time, admin = false }) {
  return (
    <View className="mb-5">
      <View className="flex-row items-center">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-elevated">
          <Ionicons
            name="person"
            size={17}
            color={admin ? colors.primary : colors.iconMuted}
          />
        </View>

        <Text className="ml-2 text-sm font-bold text-text-primary">{name}</Text>

        {admin && (
          <View className="ml-2 rounded-full bg-surface-elevated px-2 py-0.5">
            <Text className="text-[9px] font-bold text-primary">ADMIN</Text>
          </View>
        )}
      </View>

      <View className="ml-11 mt-1 rounded-2xl rounded-tl-md border border-border bg-surface px-4 py-3">
        <Text className="text-sm leading-5 text-text-primary">{message}</Text>

        <Text className="mt-2 text-[10px] text-text-secondary">{time}</Text>
      </View>
    </View>
  );
}

function CommunityAnnouncement() {
  return (
    <View className="mx-4 mb-2 mt-2 rounded-2xl border border-border bg-surface-elevated p-4">
      <View className="flex-row items-start">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-surface-icon">
          <Ionicons name="megaphone-outline" size={21} color={colors.primary} />
        </View>

        <View className="ml-3 flex-1">
          <Text className="text-base font-bold text-text-primary">
            Community announcements
          </Text>

          <Text className="mt-1 text-sm leading-5 text-text-secondary">
            Important updates, community news and shared announcements will
            appear here.
          </Text>
        </View>
      </View>
    </View>
  );
}
