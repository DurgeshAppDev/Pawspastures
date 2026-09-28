import React, {
  memo,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import CommunitiesHeader from "../../src/components/communities/CommunitiesHeader";

import CommunityChatScreen from "../../src/components/communities/CommunityChatScreen";

import {
  COMMUNITY_DATA,
  RECOMMENDED_GROUPS,
} from "../../src/data/communities";

import { colors } from "../../src/theme";

const WEB_NAV_WIDTH = 76;

const DESKTOP_BREAKPOINT = 900;

export default function CommunitiesScreen({
  navigation,
}) {
  const { width } =
    useWindowDimensions();

  const [searchText, setSearchText] =
    useState("");

  const [selectedCommunity, setSelectedCommunity] =
    useState(null);

  const isWeb =
    Platform.OS === "web";

  const isDesktopWeb =
    isWeb &&
    width >= DESKTOP_BREAKPOINT;

  /*
   * SEARCH
   */

  const filteredCommunities =
    useMemo(() => {
      const query =
        searchText
          .trim()
          .toLowerCase();

      if (!query) {
        return COMMUNITY_DATA;
      }

      return COMMUNITY_DATA.filter(
        (community) =>
          community?.name
            ?.toLowerCase()
            .includes(query),
      );
    }, [searchText]);

  /*
   * JOINED COMMUNITIES
   *
   * This remains compatible with your
   * current data model.
   *
   * Later Firebase can provide:
   *
   * community.members.includes(uid)
   *
   * or a membership collection.
   */

  const joinedCommunities =
    useMemo(() => {
      return filteredCommunities.filter(
        (community) =>
          community?.isJoined !== false,
      );
    }, [filteredCommunities]);

  /*
   * MY COMMUNITIES
   *
   * Future Firebase fields:
   *
   * createdBy
   * ownerId
   * createdByCurrentUser
   */

  const myCommunities =
    useMemo(() => {
      return filteredCommunities.filter(
        (community) =>
          community?.isOwner === true ||
          community?.createdByCurrentUser ===
            true ||
          community?.owner === true,
      );
    }, [filteredCommunities]);

  /*
   * OPEN COMMUNITY
   */

  const openCommunity = (
    community,
  ) => {
    if (isDesktopWeb) {
      setSelectedCommunity(
        community,
      );

      return;
    }

    navigation
      .getParent()
      ?.navigate(
        "CommunityChat",
        {
          community,
        },
      );
  };

  /*
   * DEDICATED SCREENS
   */

  const openRecommendedGroups =
    () => {
      navigation
        .getParent()
        ?.navigate(
          "RecommendedGroups",
        );
    };

  const openUpcomingEvents =
    () => {
      navigation
        .getParent()
        ?.navigate(
          "UpcomingEvents",
        );
    };

  /*
   * CREATE
   */

  const handleCreateCommunity =
    () => {
      Alert.alert(
        "Create Community",
        "Community creation will be available here.",
      );
    };

  /*
   * ========================================================
   * DESKTOP WEB
   * ========================================================
   */

  if (isDesktopWeb) {
    return (
      <SafeAreaView
        edges={[
          "top",
          "left",
          "right",
        ]}
        className="flex-1 bg-background"
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor={
            colors.background
          }
          translucent={false}
        />

        <View
          className="flex-1 bg-background"
          style={{
            marginLeft:
              WEB_NAV_WIDTH,
          }}
        >
          <View className="flex-1 flex-row">
            {/* =================================================
                LEFT SIDEBAR
            ================================================= */}

            <View className="w-[390px] border-r border-border bg-background">
              <CommunitiesHeader
                searchText={searchText}
                onSearchChange={
                  setSearchText
                }
                onCreatePress={
                  handleCreateCommunity
                }
              />

              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={
                  false
                }
                contentContainerStyle={{
                  paddingBottom: 40,
                }}
              >
                {/* CREATE */}

                <View className="px-4 pt-4">
                  <CreateCommunityCard
                    onPress={
                      handleCreateCommunity
                    }
                  />
                </View>

                {/* =================================================
                    JOINED FIRST
                ================================================= */}

                <CommunitySectionHeader
                  title="Joined Communities"
                  subtitle="Communities you're part of"
                  count={
                    joinedCommunities.length
                  }
                />

                <View className="mx-4 overflow-hidden rounded-2xl border border-border bg-surface">
                  {joinedCommunities.length ===
                  0 ? (
                    <EmptyCommunity
                      icon="people-outline"
                      title="No joined communities"
                      message="Join a community to see it here."
                    />
                  ) : (
                    joinedCommunities.map(
                      (
                        community,
                        index,
                      ) => (
                        <CommunityRow
                          key={
                            community.id
                          }
                          community={
                            community
                          }
                          selected={
                            selectedCommunity?.id ===
                            community.id
                          }
                          showBorder={
                            index <
                            joinedCommunities.length -
                              1
                          }
                          onPress={
                            openCommunity
                          }
                        />
                      ),
                    )
                  )}
                </View>

                {/* =================================================
                    MY COMMUNITIES SECOND
                ================================================= */}

                <CommunitySectionHeader
                  title="My Communities"
                  subtitle="Communities created by you"
                  count={
                    myCommunities.length
                  }
                />

                <View className="mx-4 overflow-hidden rounded-2xl border border-border bg-surface">
                  {myCommunities.length ===
                  0 ? (
                    <EmptyCommunity
                      icon="add-circle-outline"
                      title="No communities created"
                      message="Communities you create will appear here."
                    />
                  ) : (
                    myCommunities.map(
                      (
                        community,
                        index,
                      ) => (
                        <CommunityRow
                          key={
                            community.id
                          }
                          community={
                            community
                          }
                          selected={
                            selectedCommunity?.id ===
                            community.id
                          }
                          showBorder={
                            index <
                            myCommunities.length -
                              1
                          }
                          onPress={
                            openCommunity
                          }
                        />
                      ),
                    )
                  )}
                </View>

                {/* =================================================
                    RECOMMENDED
                ================================================= */}

                <SidebarSection
                  title="Recommended Groups"
                  onPress={
                    openRecommendedGroups
                  }
                />

                <View className="mx-4 overflow-hidden rounded-2xl border border-border bg-surface">
                  {RECOMMENDED_GROUPS
                    .slice(0, 3)
                    .map(
                      (
                        group,
                        index,
                      ) => (
                        <SimpleGroupRow
                          key={
                            group.id
                          }
                          group={group}
                          showBorder={
                            index < 2
                          }
                          onPress={
                            openRecommendedGroups
                          }
                        />
                      ),
                    )}
                </View>

                {/* =================================================
                    EVENTS
                ================================================= */}

                <SidebarSection
                  title="Upcoming Events"
                  onPress={
                    openUpcomingEvents
                  }
                />

                <View className="mx-4">
                  <EventPreview
                    onPress={
                      openUpcomingEvents
                    }
                  />
                </View>
              </ScrollView>
            </View>

            {/* =================================================
                RIGHT CHAT PANEL
            ================================================= */}

            <View className="flex-1 bg-background">
              {selectedCommunity ? (
                <CommunityChatScreen
                  embedded
                  community={
                    selectedCommunity
                  }
                />
              ) : (
                <CommunityEmptyState />
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * ========================================================
   * MOBILE
   * ========================================================
   */

  return (
    <SafeAreaView
      edges={[
        "top",
        "left",
        "right",
      ]}
      className="flex-1 bg-background"
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={
          colors.background
        }
        translucent={false}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom: 110,
        }}
      >
        {/* HEADER */}

        <CommunitiesHeader
          searchText={searchText}
          onSearchChange={
            setSearchText
          }
          onCreatePress={
            handleCreateCommunity
          }
        />

        {/* CREATE */}

        <View className="px-4 pt-3">
          <CreateCommunityCard
            onPress={
              handleCreateCommunity
            }
          />
        </View>

        {/* =====================================================
            JOINED
        ====================================================== */}

        <CommunitySectionHeader
          title="Joined Communities"
          subtitle="Communities you're part of"
          count={
            joinedCommunities.length
          }
        />

        <View className="mx-4 overflow-hidden rounded-2xl border border-border bg-surface">
          {joinedCommunities.length ===
          0 ? (
            <EmptyCommunity
              icon="people-outline"
              title="No joined communities"
              message="Join a community to see it here."
            />
          ) : (
            joinedCommunities.map(
              (
                community,
                index,
              ) => (
                <CommunityRow
                  key={community.id}
                  community={
                    community
                  }
                  showBorder={
                    index <
                    joinedCommunities.length -
                      1
                  }
                  onPress={
                    openCommunity
                  }
                />
              ),
            )
          )}
        </View>

        {/* =====================================================
            MY COMMUNITIES
        ====================================================== */}

        <CommunitySectionHeader
          title="My Communities"
          subtitle="Communities created by you"
          count={
            myCommunities.length
          }
        />

        <View className="mx-4 overflow-hidden rounded-2xl border border-border bg-surface">
          {myCommunities.length ===
          0 ? (
            <EmptyCommunity
              icon="add-circle-outline"
              title="No communities created"
              message="Communities you create will appear here."
            />
          ) : (
            myCommunities.map(
              (
                community,
                index,
              ) => (
                <CommunityRow
                  key={community.id}
                  community={
                    community
                  }
                  showBorder={
                    index <
                    myCommunities.length -
                      1
                  }
                  onPress={
                    openCommunity
                  }
                />
              ),
            )
          )}
        </View>

        {/* =====================================================
            RECOMMENDED GROUPS
        ====================================================== */}

        <SectionHeader
          title="Recommended Groups"
          action="See all"
          onPress={
            openRecommendedGroups
          }
        />

        <View className="mx-4 overflow-hidden rounded-2xl border border-border bg-surface">
          {RECOMMENDED_GROUPS.map(
            (
              group,
              index,
            ) => (
              <SimpleGroupRow
                key={group.id}
                group={group}
                showBorder={
                  index <
                  RECOMMENDED_GROUPS.length -
                    1
                }
                onPress={
                  openRecommendedGroups
                }
              />
            ),
          )}
        </View>

        {/* =====================================================
            UPCOMING EVENTS
        ====================================================== */}

        <SectionHeader
          title="Upcoming Events"
          action="See all"
          onPress={
            openUpcomingEvents
          }
        />

        <View className="mx-4">
          <EventPreview
            onPress={
              openUpcomingEvents
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   CREATE COMMUNITY
============================================================ */

const CreateCommunityCard =
  memo(function CreateCommunityCard({
    onPress,
  }) {
    return (
      <Pressable
        onPress={onPress}
        className="flex-row items-center rounded-2xl border border-border bg-surface px-4 py-4 active:bg-surface-elevated"
      >
        <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-elevated">
          <Ionicons
            name="add"
            size={25}
            color={colors.primary}
          />
        </View>

        <View className="ml-3 flex-1">
          <Text className="text-base font-bold text-text-primary">
            Create Community
          </Text>

          <Text className="mt-1 text-sm text-text-secondary">
            Create a space for pet parents
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.iconMuted}
        />
      </Pressable>
    );
  });

/* ============================================================
   SECTION HEADER
============================================================ */

function CommunitySectionHeader({
  title,
  subtitle,
  count,
}) {
  return (
    <View className="mb-3 mt-7 flex-row items-end justify-between px-4">
      <View className="flex-1 pr-4">
        <Text className="text-xl font-bold text-text-primary">
          {title}
        </Text>

        <Text className="mt-1 text-sm text-text-secondary">
          {subtitle}
        </Text>
      </View>

      <Text className="text-sm font-medium text-text-secondary">
        {count}
      </Text>
    </View>
  );
}

/* ============================================================
   COMMUNITY ROW
============================================================ */

const CommunityRow = memo(
  function CommunityRow({
    community,
    selected,
    showBorder,
    onPress,
  }) {
    return (
      <Pressable
        onPress={() =>
          onPress(community)
        }
        className="flex-row items-center px-4 py-4 active:bg-surface-elevated"
        style={{
          backgroundColor:
            selected
              ? colors.surfaceElevated
              : colors.surface,

          ...(showBorder
            ? {
                borderBottomWidth: 1,
                borderBottomColor:
                  colors.border,
              }
            : {}),
        }}
      >
        <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-elevated">
          <Ionicons
            name="people"
            size={25}
            color={colors.primary}
          />
        </View>

        <View className="ml-3 flex-1">
          <Text
            numberOfLines={1}
            className="text-base font-bold text-text-primary"
          >
            {community?.name ||
              "Community"}
          </Text>

          <Text
            numberOfLines={1}
            className="mt-1 text-sm text-text-secondary"
          >
            {community?.activity ||
              "Pet community"}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={
            selected
              ? colors.primary
              : colors.iconMuted
          }
        />
      </Pressable>
    );
  },
);

/* ============================================================
   SIMPLE GROUP
============================================================ */

const SimpleGroupRow = memo(
  function SimpleGroupRow({
    group,
    showBorder,
    onPress,
  }) {
    return (
      <Pressable
        onPress={onPress}
        className="flex-row items-center px-4 py-4 active:bg-surface-elevated"
        style={
          showBorder
            ? {
                borderBottomWidth: 1,
                borderBottomColor:
                  colors.border,
              }
            : undefined
        }
      >
        <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-elevated">
          <Ionicons
            name="people-outline"
            size={22}
            color={colors.primary}
          />
        </View>

        <View className="ml-3 flex-1">
          <Text
            numberOfLines={1}
            className="text-base font-bold text-text-primary"
          >
            {group?.name ||
              "Recommended Group"}
          </Text>

          <Text
            numberOfLines={1}
            className="mt-1 text-sm text-text-secondary"
          >
            {group?.members ||
              "Pet community"}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={19}
          color={colors.iconMuted}
        />
      </Pressable>
    );
  },
);

/* ============================================================
   SIDEBAR SECTION
============================================================ */

function SidebarSection({
  title,
  onPress,
}) {
  return (
    <View className="mb-3 mt-7 flex-row items-center justify-between px-4">
      <Text className="text-lg font-bold text-text-primary">
        {title}
      </Text>

      <Pressable onPress={onPress}>
        <Text className="text-sm font-semibold text-primary">
          See all
        </Text>
      </Pressable>
    </View>
  );
}

/* ============================================================
   MOBILE SECTION
============================================================ */

function SectionHeader({
  title,
  action,
  onPress,
}) {
  return (
    <View className="mb-3 mt-8 flex-row items-center justify-between px-4">
      <Text className="text-xl font-bold text-text-primary">
        {title}
      </Text>

      <Pressable onPress={onPress}>
        <Text className="text-sm font-semibold text-primary">
          {action}
        </Text>
      </Pressable>
    </View>
  );
}

/* ============================================================
   EVENT PREVIEW
============================================================ */

const EventPreview = memo(
  function EventPreview({
    onPress,
  }) {
    return (
      <Pressable
        onPress={onPress}
        className="rounded-2xl border border-border bg-surface p-4 active:bg-surface-elevated"
      >
        <View className="flex-row items-center">
          <View className="h-12 w-12 items-center justify-center rounded-xl bg-surface-elevated">
            <Ionicons
              name="calendar-outline"
              size={23}
              color={colors.primary}
            />
          </View>

          <View className="ml-3 flex-1">
            <Text className="text-base font-bold text-text-primary">
              Weekend Pet Walk
            </Text>

            <Text className="mt-1 text-sm text-text-secondary">
              Saturday • 7:00 AM • City Park
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color={colors.iconMuted}
          />
        </View>

        <View className="mt-4 flex-row items-center">
          <Ionicons
            name="people-outline"
            size={16}
            color={colors.iconMuted}
          />

          <Text className="ml-1 text-sm text-text-secondary">
            128 attending
          </Text>
        </View>
      </Pressable>
    );
  },
);

/* ============================================================
   EMPTY
============================================================ */

function EmptyCommunity({
  icon,
  title,
  message,
}) {
  return (
    <View className="items-center px-6 py-9">
      <Ionicons
        name={icon}
        size={36}
        color={colors.iconMuted}
      />

      <Text className="mt-3 text-base font-bold text-text-primary">
        {title}
      </Text>

      <Text className="mt-1 text-center text-sm leading-5 text-text-secondary">
        {message}
      </Text>
    </View>
  );
}

/* ============================================================
   DESKTOP EMPTY CHAT
============================================================ */

function CommunityEmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-surface-elevated">
        <Ionicons
          name="chatbubbles-outline"
          size={38}
          color={colors.primary}
        />
      </View>

      <Text className="mt-5 text-2xl font-bold text-text-primary">
        Community Chat
      </Text>

      <Text className="mt-2 max-w-[430px] text-center text-base leading-6 text-text-secondary">
        Select a community to start viewing
        its conversations.
      </Text>
    </View>
  );
}