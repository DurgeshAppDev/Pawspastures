import React, { memo, useMemo, useState } from "react";

import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import CommunitiesHeader from "../../src/components/communities/CommunitiesHeader";

import CommunityChatScreen from "../../src/components/communities/CommunityChatScreen";

import { COMMUNITY_DATA, RECOMMENDED_GROUPS } from "../../src/data/communities";

import { colors } from "../../src/theme";

/* =========================================================
   CONSTANTS
========================================================= */

const WEB_NAV_WIDTH = 76;
const DESKTOP_BREAKPOINT = 900;

/* =========================================================
   SCREEN
========================================================= */

export default function CommunitiesScreen({ navigation }) {
  const { width } = useWindowDimensions();

  const [searchText, setSearchText] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const isDesktopWeb = Platform.OS === "web" && width >= DESKTOP_BREAKPOINT;

  const sidebarWidth = Math.min(340, Math.max(280, width * 0.27));

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredCommunities = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return COMMUNITY_DATA;
    }

    return COMMUNITY_DATA.filter((community) =>
      community?.name?.toLowerCase().includes(query),
    );
  }, [searchText]);

  /* =========================================================
     COMMUNITY GROUPS
  ========================================================= */

  const joinedCommunities = useMemo(
    () =>
      filteredCommunities.filter((community) => community?.isJoined !== false),
    [filteredCommunities],
  );

  const myCommunities = useMemo(
    () =>
      filteredCommunities.filter(
        (community) =>
          community?.isOwner === true ||
          community?.createdByCurrentUser === true ||
          community?.owner === true,
      ),
    [filteredCommunities],
  );

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const openCommunity = (community) => {
    if (isDesktopWeb) {
      setSelectedCommunity(community);
      return;
    }

    navigation.getParent()?.navigate("CommunityChat", {
      community,
    });
  };

  const openRecommendedGroups = () => {
    navigation.getParent()?.navigate("RecommendedGroups");
  };

  const openUpcomingEvents = () => {
    navigation.getParent()?.navigate("UpcomingEvents");
  };

  const handleCreateCommunity = () => {
    navigation.getParent()?.navigate("CreateCommunity");
  };

  /* =========================================================
     DESKTOP WEB
  ========================================================= */

  if (isDesktopWeb) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1 bg-background"
      >
        <View
          className="flex-1 flex-row bg-background"
          style={{
            marginLeft: WEB_NAV_WIDTH,
          }}
        >
          {/* SIDEBAR */}

          <View
            className="border-r border-border bg-background"
            style={{
              width: sidebarWidth,
            }}
          >
            <CommunitiesHeader
              searchText={searchText}
              onSearchChange={setSearchText}
            />

            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 24,
              }}
            >
              {/* CREATE */}

              <View className="px-3 pt-3">
                <CreateCommunityCard onPress={handleCreateCommunity} />
              </View>

              {/* JOINED */}

              <SectionHeader
                title="Joined Communities"
                subtitle="Communities you're part of"
                count={joinedCommunities.length}
              />

              <View className="mx-3 overflow-hidden rounded-xl border border-border bg-surface">
                {joinedCommunities.length === 0 ? (
                  <EmptyCommunity
                    icon="people-outline"
                    title="No joined communities"
                    message="Join a community to see it here."
                  />
                ) : (
                  joinedCommunities.map((community, index) => (
                    <CommunityRow
                      key={community.id}
                      community={community}
                      selected={selectedCommunity?.id === community.id}
                      showBorder={index < joinedCommunities.length - 1}
                      onPress={openCommunity}
                    />
                  ))
                )}
              </View>

              {/* MY COMMUNITIES */}

              <SectionHeader
                title="My Communities"
                subtitle="Communities created by you"
                count={myCommunities.length}
              />

              <View className="mx-3 overflow-hidden rounded-xl border border-border bg-surface">
                {myCommunities.length === 0 ? (
                  <EmptyCommunity
                    icon="add-circle-outline"
                    title="No communities created"
                    message="Communities you create will appear here."
                  />
                ) : (
                  myCommunities.map((community, index) => (
                    <CommunityRow
                      key={community.id}
                      community={community}
                      selected={selectedCommunity?.id === community.id}
                      showBorder={index < myCommunities.length - 1}
                      onPress={openCommunity}
                    />
                  ))
                )}
              </View>

              {/* RECOMMENDED */}

              <SectionHeader
                title="Recommended Groups"
                action="See all"
                onPress={openRecommendedGroups}
              />

              <View className="mx-3 overflow-hidden rounded-xl border border-border bg-surface">
                {RECOMMENDED_GROUPS.length === 0 ? (
                  <EmptyCommunity
                    icon="people-outline"
                    title="No recommended communities"
                    message="There are no community recommendations yet."
                  />
                ) : (
                  RECOMMENDED_GROUPS.slice(0, 3).map((group, index) => (
                    <SimpleGroupRow
                      key={group.id}
                      group={group}
                      showBorder={
                        index < Math.min(RECOMMENDED_GROUPS.length, 3) - 1
                      }
                      onPress={openRecommendedGroups}
                    />
                  ))
                )}
              </View>

              {/* EVENTS */}

              <SectionHeader
                title="Upcoming Events"
                action="See all"
                onPress={openUpcomingEvents}
              />

              <View className="mx-3">
                <EventPreview onPress={openUpcomingEvents} />
              </View>
            </ScrollView>
          </View>

          {/* CHAT */}

          <View className="flex-1 bg-background">
            {selectedCommunity ? (
              <CommunityChatScreen embedded community={selectedCommunity} />
            ) : (
              <CommunityEmptyState />
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /* =========================================================
     MOBILE
  ========================================================= */

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 110,
        }}
      >
        <CommunitiesHeader
          searchText={searchText}
          onSearchChange={setSearchText}
          onCreatePress={handleCreateCommunity}
        />

        <View className="px-4 pt-3">
          <CreateCommunityCard onPress={handleCreateCommunity} />
        </View>

        {/* JOINED */}

        <SectionHeader
          title="Joined Communities"
          subtitle="Communities you're part of"
          count={joinedCommunities.length}
        />

        <View className="mx-4 overflow-hidden rounded-2xl border border-border bg-surface">
          {joinedCommunities.length === 0 ? (
            <EmptyCommunity
              icon="people-outline"
              title="No joined communities"
              message="Join a community to see it here."
            />
          ) : (
            joinedCommunities.map((community, index) => (
              <CommunityRow
                key={community.id}
                community={community}
                showBorder={index < joinedCommunities.length - 1}
                onPress={openCommunity}
              />
            ))
          )}
        </View>

        {/* MY COMMUNITIES */}

        <SectionHeader
          title="My Communities"
          subtitle="Communities created by you"
          count={myCommunities.length}
        />

        <View className="mx-4 overflow-hidden rounded-2xl border border-border bg-surface">
          {myCommunities.length === 0 ? (
            <EmptyCommunity
              icon="add-circle-outline"
              title="No communities created"
              message="Communities you create will appear here."
            />
          ) : (
            myCommunities.map((community, index) => (
              <CommunityRow
                key={community.id}
                community={community}
                showBorder={index < myCommunities.length - 1}
                onPress={openCommunity}
              />
            ))
          )}
        </View>

        {/* RECOMMENDED */}

        <SectionHeader
          title="Recommended Groups"
          action="See all"
          onPress={openRecommendedGroups}
        />

        <View className="mx-4 overflow-hidden rounded-2xl border border-border bg-surface">
          {RECOMMENDED_GROUPS.map((group, index) => (
            <SimpleGroupRow
              key={group.id}
              group={group}
              showBorder={index < RECOMMENDED_GROUPS.length - 1}
              onPress={openRecommendedGroups}
            />
          ))}
        </View>

        {/* EVENTS */}

        <SectionHeader
          title="Upcoming Events"
          action="See all"
          onPress={openUpcomingEvents}
        />

        <View className="mx-4">
          <EventPreview onPress={openUpcomingEvents} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   CREATE COMMUNITY
========================================================= */

const CreateCommunityCard = memo(function CreateCommunityCard({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-xl border border-border bg-surface px-3 py-3 active:bg-surface-elevated"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-elevated">
        <Ionicons name="add" size={21} color={colors.primary} />
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-sm font-bold text-text-primary">
          Create Community
        </Text>

        <Text className="mt-0.5 text-xs text-text-secondary">
          Create a space for pet parents
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />
    </Pressable>
  );
});

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({ title, subtitle, count, action, onPress }) {
  return (
    <View className="mb-2 mt-5 flex-row items-end justify-between px-3">
      <View className="flex-1 pr-3">
        <Text className="text-sm font-bold text-text-primary">{title}</Text>

        {subtitle && (
          <Text
            numberOfLines={1}
            className="mt-0.5 text-[10px] text-text-secondary"
          >
            {subtitle}
          </Text>
        )}
      </View>

      {action ? (
        <Pressable onPress={onPress}>
          <Text className="text-[11px] font-semibold text-primary">
            {action}
          </Text>
        </Pressable>
      ) : (
        <Text className="text-[11px] font-medium text-text-secondary">
          {count}
        </Text>
      )}
    </View>
  );
}

/* =========================================================
   COMMUNITY ROW
========================================================= */

const CommunityRow = memo(function CommunityRow({
  community,
  selected,
  showBorder,
  onPress,
}) {
  return (
    <Pressable
      onPress={() => onPress(community)}
      className={`flex-row items-center px-3 py-3 active:bg-surface-elevated ${
        showBorder ? "border-b border-border-subtle" : ""
      }`}
      style={{
        backgroundColor: selected ? colors.surfaceElevated : colors.surface,
      }}
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-elevated">
        <Ionicons name="people" size={18} color={colors.primary} />
      </View>

      <View className="ml-2.5 flex-1">
        <Text numberOfLines={1} className="text-xs font-bold text-text-primary">
          {community?.name || "Community"}
        </Text>

        <Text
          numberOfLines={1}
          className="mt-0.5 text-[10px] text-text-secondary"
        >
          {community?.activity || "Pet community"}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={16}
        color={selected ? colors.primary : colors.iconMuted}
      />
    </Pressable>
  );
});

/* =========================================================
   GROUP ROW
========================================================= */

const SimpleGroupRow = memo(function SimpleGroupRow({
  group,
  showBorder,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-3 py-3 active:bg-surface-elevated ${
        showBorder ? "border-b border-border-subtle" : ""
      }`}
    >
      <View className="h-8 w-8 items-center justify-center rounded-full bg-surface-elevated">
        <Ionicons name="people-outline" size={16} color={colors.primary} />
      </View>

      <View className="ml-2.5 flex-1">
        <Text numberOfLines={1} className="text-xs font-bold text-text-primary">
          {group?.name || "Recommended Group"}
        </Text>

        <Text
          numberOfLines={1}
          className="mt-0.5 text-[10px] text-text-secondary"
        >
          {group?.members || "Pet community"}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.iconMuted} />
    </Pressable>
  );
});

/* =========================================================
   EVENT PREVIEW
========================================================= */

const EventPreview = memo(function EventPreview({ event, onPress }) {
  if (!event) {
    return (
      <View className="items-center rounded-xl border border-border bg-surface px-4 py-7">
        <Ionicons name="calendar-outline" size={28} color={colors.iconMuted} />

        <Text className="mt-2 text-sm font-bold text-text-primary">
          No upcoming events
        </Text>

        <Text className="mt-1 text-center text-xs leading-4 text-text-secondary">
          There are no upcoming community events right now.
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className="rounded-xl border border-border bg-surface p-3 active:bg-surface-elevated"
    >
      <View className="flex-row items-center">
        <View className="h-9 w-9 items-center justify-center rounded-lg bg-surface-elevated">
          <Ionicons name="calendar-outline" size={17} color={colors.primary} />
        </View>

        <View className="ml-2.5 flex-1">
          <Text
            numberOfLines={1}
            className="text-xs font-bold text-text-primary"
          >
            {event.title}
          </Text>

          <Text
            numberOfLines={1}
            className="mt-0.5 text-[10px] text-text-secondary"
          >
            {event.date} • {event.time} • {event.location}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={16} color={colors.iconMuted} />
      </View>

      <View className="mt-2.5 flex-row items-center">
        <Ionicons name="people-outline" size={13} color={colors.iconMuted} />

        <Text className="ml-1 text-[10px] text-text-secondary">
          {event.attending}
        </Text>
      </View>
    </Pressable>
  );
});

/* =========================================================
   EMPTY COMMUNITY
========================================================= */

function EmptyCommunity({ icon, title, message }) {
  return (
    <View className="items-center px-4 py-7">
      <Ionicons name={icon} size={28} color={colors.iconMuted} />

      <Text className="mt-2 text-sm font-bold text-text-primary">{title}</Text>

      <Text className="mt-1 text-center text-xs leading-4 text-text-secondary">
        {message}
      </Text>
    </View>
  );
}

/* =========================================================
   EMPTY CHAT
========================================================= */

function CommunityEmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-surface-elevated">
        <Ionicons name="chatbubbles-outline" size={38} color={colors.primary} />
      </View>

      <Text className="mt-5 text-2xl font-bold text-text-primary">
        Community Chat
      </Text>

      <Text className="mt-2 max-w-[430px] text-center text-base leading-6 text-text-secondary">
        Select a community to start viewing its conversations.
      </Text>
    </View>
  );
}
