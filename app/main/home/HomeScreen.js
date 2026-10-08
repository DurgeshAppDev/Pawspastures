import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { auth } from "../../../src/config/firebase";
import { colors } from "../../../src/theme/colors";
import HomeHeader from "../../../src/components/home/HomeHeader";
import StoriesSection from "../../../src/components/home/StoriesSection";
import FeedReelCard from "../../../src/components/home/FeedReelCard";
import { getStoriesGroupedByUser } from "../../../src/services/StoryServices";
import { getPublicReelsPage } from "../../../src/services/FeedServices";

const PAGE_SIZE = 6;

function ReelSkeleton() {
  return (
    <View className="mb-5 overflow-hidden rounded-2xl border border-border bg-surface">
      <View
        className="w-full bg-surface-elevated"
        style={{ aspectRatio: 3 / 4 }}
      />
      <View className="flex-row items-center px-4 py-4">
        <View className="h-9 w-9 rounded-full bg-surface-elevated" />
        <View className="ml-3 flex-1">
          <View className="h-3 w-32 rounded bg-surface-elevated" />
          <View className="mt-2 h-3 w-48 rounded bg-surface-elevated" />
        </View>
      </View>
    </View>
  );
}

export default function FirebaseHomeScreen() {
  const navigation = useNavigation();
  const [storyGroups, setStoryGroups] = useState([]);
  const [reels, setReels] = useState([]);
  const [activeReelId, setActiveReelId] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const cursorRef = useRef(null);
  const canLoadNextPageRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const hasMoreRef = useRef(true);
  const requestInFlightRef = useRef(false);

  // Keep this as cursor-paginated reads: each request costs at most six reel reads.
  const loadReels = useCallback(
    async ({ reset = false, refresh = false } = {}) => {
      if (requestInFlightRef.current || (!reset && !hasMoreRef.current)) return;
      requestInFlightRef.current = true;
      setErrorMessage("");
      if (refresh) setRefreshing(true);
      else if (reset) setInitialLoading(true);
      else setLoadingMore(true);

      try {
        const page = await getPublicReelsPage({
          cursor: reset ? null : cursorRef.current,
          pageSize: PAGE_SIZE,
          // User interest keywords can be passed here when the preference UI is added.
        });
        setReels((current) =>
          reset ? page.items : [...current, ...page.items],
        );
        cursorRef.current = page.cursor;
        hasMoreRef.current = page.hasMore;
        setHasMore(page.hasMore);
        hasLoadedRef.current = true;
      } catch (error) {
        console.error("Reel feed loading failed:", error);
        setErrorMessage(
          "We couldn't load reels. Check your connection and try again.",
        );
      } finally {
        requestInFlightRef.current = false;
        setInitialLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  // Do not reread the first page on every focus; users can pull to refresh explicitly.
  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedRef.current) loadReels({ reset: true });
      return undefined;
    }, [loadReels]),
  );

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getStoriesGroupedByUser()
        .then((groups) => {
          if (mounted) setStoryGroups(groups);
        })
        .catch((error) => console.error("Stories loading failed:", error));
      return () => {
        mounted = false;
      };
    }, []),
  );

  // FlatList reports visible rows so only the foreground reel plays video.
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const item = viewableItems.find((entry) => entry.isViewable)?.item;
    setActiveReelId(item ? `${item.userId || "user"}_${item.id}` : null);
  }).current;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 70 }).current;

  const ownStory = storyGroups.find(
    (group) => group.userId === auth.currentUser?.uid,
  );
  const otherStories = storyGroups.filter(
    (group) => group.userId !== auth.currentUser?.uid,
  );
  const header = (
    <View>
      <HomeHeader onNotificationsPress={() => {}} onMessagesPress={() => {}} />
      <StoriesSection
        ownStory={ownStory}
        stories={otherStories}
        onStoryPress={(story) => {
          if (story.isOwn && (story.create || !story.stories?.length)) {
            navigation.navigate("AddStory");
            return;
          }
          navigation.navigate("StoryViewer", {
            stories: story.stories,
            initialIndex: 0,
          });
        }}
      />
      <View className="px-[18px] pb-3 pt-5">
        <Text className="text-[18px] font-extrabold text-white">
          Reels for you
        </Text>
        <Text className="mt-[3px] text-[13px] text-text-secondary">
          New moments from the pet community
        </Text>
      </View>
    </View>
  );

  const emptyState = initialLoading ? (
    <View className="px-3 pt-2">
      <ReelSkeleton />
      <ReelSkeleton />
      <ReelSkeleton />
    </View>
  ) : errorMessage ? (
    <View className="items-center px-6 py-16">
      <Text className="text-center text-sm text-text-secondary">
        {errorMessage}
      </Text>
      <Pressable
        onPress={() => loadReels({ reset: true })}
        className="mt-4 rounded-full bg-primary px-5 py-3"
      >
        <Text className="font-bold text-background">Try again</Text>
      </Pressable>
    </View>
  ) : (
    <View className="items-center px-6 py-16">
      <Text className="text-base font-bold text-text-primary">
        No reels yet
      </Text>
      <Text className="mt-2 text-center text-sm text-text-secondary">
        Reels shared by the community will appear here.
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
        translucent={false}
      />
      <FlatList
        data={reels}
        keyExtractor={(item) => `${item.userId || "user"}_${item.id}`}
        renderItem={({ item }) => (
          <FeedReelCard
            reel={item}
            isActive={activeReelId === `${item.userId || "user"}_${item.id}`}
          />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={emptyState}
        ListFooterComponent={
          loadingMore ? (
            <View className="items-center py-6">
              <ActivityIndicator color={colors.primary} />
              <Text className="mt-2 text-sm text-text-secondary">
                Loading more reels...
              </Text>
            </View>
          ) : errorMessage && reels.length ? (
            <Pressable
              onPress={() => loadReels()}
              className="items-center py-5"
            >
              <Text className="font-semibold text-primary">
                Couldn't load more. Tap to retry.
              </Text>
            </Pressable>
          ) : hasMore && reels.length ? (
            <View className="h-8" />
          ) : null
        }
        contentContainerStyle={{
          width: "100%",
          maxWidth: Platform.OS === "web" ? 720 : undefined,
          alignSelf: "center",
          paddingHorizontal: Platform.OS === "web" ? 12 : 0,
          paddingBottom: 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadReels({ reset: true, refresh: true })}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onScroll={(event) => {
          if (event.nativeEvent.contentOffset.y > 80)
            canLoadNextPageRef.current = true;
        }}
        scrollEventThrottle={200}
        onEndReached={() => {
          if (canLoadNextPageRef.current) {
            canLoadNextPageRef.current = false;
            loadReels();
          }
        }}
        onEndReachedThreshold={0.65}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        extraData={activeReelId}
        initialNumToRender={1}
        maxToRenderPerBatch={3}
        windowSize={5}
        updateCellsBatchingPeriod={80}
        removeClippedSubviews={Platform.OS === "android"}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
