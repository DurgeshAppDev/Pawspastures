import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  Image,
  Pressable,
  Modal,
  StatusBar,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { getAuth } from "firebase/auth";

import { colors } from "../../theme";
import { getUserPostsPage } from "../../services/PostServices";
import { incrementPostView } from "../../services/PostServices";
import { VideoView, useVideoPlayer } from "expo-video";

const PAGE_SIZE = 6;

function OpenPostModal({ item, onClose }) {
  const player = useVideoPlayer(
    item?.mediaType === "video" ? item.mediaUrl : null,
    (instance) => {
      instance.loop = true;
    },
  );
  React.useEffect(() => {
    if (item?.mediaType === "video") player.play();
    return () => player.pause();
  }, [item?.mediaType, player]);
  if (!item) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <StatusBar hidden />
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/90 p-4"
      >
        <Pressable
          onPress={(event) => event.stopPropagation?.()}
          className="w-full max-w-[760px] overflow-hidden rounded-2xl bg-surface"
        >
          {item.mediaType === "video" ? (
            <VideoView
              player={player}
              style={{ width: "100%", aspectRatio: 1 }}
              contentFit="contain"
              nativeControls
            />
          ) : (
            <Image
              source={{ uri: item.mediaUrl }}
              style={{ width: "100%", aspectRatio: 1 }}
              resizeMode="contain"
            />
          )}
          {item.overlayText ? (
            <Text className="px-4 pt-3 text-center font-bold text-text-primary">
              {item.overlayText}
            </Text>
          ) : null}
          {item.caption ? (
            <Text className="px-4 py-3 text-sm text-text-primary">
              {item.caption}
            </Text>
          ) : null}
          <View className="flex-row items-center px-4 pb-4">
            <Ionicons name="eye-outline" size={17} color={colors.primary} />
            <Text className="ml-2 text-sm font-semibold text-text-primary">
              {Number(item.views) || 0} views
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close post"
          className="mt-4 rounded-full bg-surface px-5 py-3"
        >
          <Text className="font-bold text-text-primary">Close</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createPage = () => ({
  items: [],
  cursor: null,
  hasMore: true,
  loading: false,
  loadingMore: false,
  loaded: false,
  error: "",
});

const ProfilePosts = forwardRef(function ProfilePosts(_props, ref) {
  const [activeTab, setActiveTab] = useState("posts");
  const [pages, setPages] = useState({
    posts: createPage(),
    reels: createPage(),
  });
  const pagesRef = useRef(pages);
  const loadingRef = useRef({ posts: false, reels: false });
  const userId = getAuth().currentUser?.uid;

  const { width } = useWindowDimensions();
  const [openedPost, setOpenedPost] = useState(null);

  const isWeb = width >= 768;
  const isDesktop = width >= 1100;

  const commitPage = useCallback((kind, updates) => {
    const next = {
      ...pagesRef.current,
      [kind]: { ...pagesRef.current[kind], ...updates },
    };
    pagesRef.current = next;
    setPages(next);
  }, []);

  const loadPage = useCallback(
    async (kind, reset = false) => {
      if (!userId || !["posts", "reels"].includes(kind)) return;
      if (loadingRef.current[kind]) return;

      const existing = pagesRef.current[kind];
      if (!reset && (!existing.loaded || !existing.hasMore)) return;

      loadingRef.current[kind] = true;
      commitPage(
        kind,
        reset
          ? { ...createPage(), loading: true }
          : { loadingMore: true, error: "" },
      );

      try {
        const result = await getUserPostsPage(userId, {
          kind: kind === "posts" ? "post" : "reel",
          cursor: reset ? null : existing.cursor,
          pageSize: PAGE_SIZE,
        });
        const current = pagesRef.current[kind];
        commitPage(kind, {
          items: reset ? result.items : [...current.items, ...result.items],
          cursor: result.cursor,
          hasMore: result.hasMore,
          loading: false,
          loadingMore: false,
          loaded: true,
          error: "",
        });
      } catch (error) {
        console.error("Profile post loading failed:", error);
        commitPage(kind, {
          loading: false,
          loadingMore: false,
          loaded: !reset && existing.loaded,
          error:
            "Unable to load this section. Check your connection and try again.",
        });
      } finally {
        loadingRef.current[kind] = false;
      }
    },
    [userId, commitPage],
  );

  useFocusEffect(
    useCallback(() => {
      if (activeTab !== "saved") {
        loadPage(activeTab, true);
      }
    }, [activeTab, loadPage]),
  );

  useImperativeHandle(
    ref,
    () => ({
      loadMore: () => loadPage(activeTab),
    }),
    [activeTab, loadPage],
  );

  const activePage = activeTab === "saved" ? createPage() : pages[activeTab];
  const data = activePage?.items || [];
  const columns = 3;

  const selectTab = (tab) => {
    setActiveTab(tab);
    if (tab !== "saved" && pagesRef.current[tab]?.loaded) {
      loadPage(tab, true);
    }
  };

  return (
    <View
      style={{
        width: "100%",
        marginTop: isWeb ? 36 : 28,
      }}
    >
      {/* TABS */}

      <View
        className="flex-row border-b"
        style={{
          borderColor: colors["border-subtle"],
        }}
      >
        <Pressable
          onPress={() => selectTab("posts")}
          className="relative flex-1 items-center py-3"
        >
          <Text
            className={`text-[13px] font-bold ${
              activeTab === "posts" ? "text-primary" : "text-text-secondary"
            }`}
          >
            Posts
          </Text>

          {activeTab === "posts" && (
            <View className="absolute bottom-0 h-[2px] w-10 bg-primary" />
          )}
        </Pressable>

        <Pressable
          onPress={() => selectTab("reels")}
          className="relative flex-1 items-center py-3"
        >
          <Text
            className={`text-[13px] font-bold ${
              activeTab === "reels" ? "text-primary" : "text-text-secondary"
            }`}
          >
            Reels
          </Text>

          {activeTab === "reels" && (
            <View className="absolute bottom-0 h-[2px] w-10 bg-primary" />
          )}
        </Pressable>

        <Pressable
          onPress={() => selectTab("saved")}
          className="relative flex-1 items-center py-3"
        >
          <View className="flex-row items-center">
            <Ionicons
              name="bookmark-outline"
              size={15}
              color={
                activeTab === "saved"
                  ? colors.primary
                  : colors["text-secondary"]
              }
            />

            <Text
              className={`ml-1 text-[13px] font-bold ${
                activeTab === "saved" ? "text-primary" : "text-text-secondary"
              }`}
            >
              Saved
            </Text>
          </View>

          {activeTab === "saved" && (
            <View className="absolute bottom-0 h-[2px] w-10 bg-primary" />
          )}
        </Pressable>
      </View>

      {/* GRID */}

      {activePage.loading && data.length === 0 ? (
        <View className="items-center py-12">
          <Text className="text-sm text-text-secondary">
            Loading your posts...
          </Text>
        </View>
      ) : data.length > 0 ? (
        <View className="flex-row flex-wrap">
          {data.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Open post, ${Number(item.views) || 0} views`}
              onPress={() => {
                const nextPost = {
                  ...item,
                  views: (Number(item.views) || 0) + 1,
                };
                setOpenedPost(nextPost);
                commitPage(activeTab, {
                  items: pagesRef.current[activeTab].items.map((post) =>
                    post.id === item.id ? nextPost : post,
                  ),
                });
                incrementPostView(
                  item.userId || userId,
                  item.postId || item.id,
                ).catch((error) => {
                  console.error("Post view count update failed:", error);
                });
              }}
              style={{
                width: `${100 / columns}%`,
                borderWidth: 1,
                borderColor: colors.background,
              }}
            >
              {item.mediaType === "video" ? (
                <View
                  className="items-center justify-center bg-surface-elevated"
                  style={{ width: "100%", aspectRatio: 1 }}
                >
                  <Ionicons
                    name="play-circle"
                    size={40}
                    color={colors.primary}
                  />
                  <Text className="mt-1 text-xs font-bold text-text-secondary">
                    REEL
                  </Text>
                </View>
              ) : (
                <Image
                  source={{ uri: item.mediaUrl }}
                  style={{ width: "100%", aspectRatio: 1 }}
                  resizeMode="cover"
                />
              )}

              {item.overlayText ? (
                <View
                  className="absolute px-1"
                  style={{
                    left: `${Math.min(88, Math.max(0, ((item.overlayTextPosition?.x ?? 40) / 320) * 100))}%`,
                    top: `${Math.min(88, Math.max(0, ((item.overlayTextPosition?.y ?? 210) / 500) * 100))}%`,
                    maxWidth: "88%",
                  }}
                >
                  <Text
                    className="text-center"
                    style={{
                      color: item.overlayTextColor || colors.white,
                      fontSize: Math.min(item.overlayTextSize || 16, 18),
                      fontWeight:
                        item.overlayTextBold === false ? "400" : "700",
                      fontStyle: item.overlayTextItalic ? "italic" : "normal",
                      textDecorationLine: item.overlayTextUnderline
                        ? "underline"
                        : "none",
                      textAlign: item.overlayTextAlign || "center",
                      textShadowColor: "rgba(0,0,0,0.8)",
                      textShadowRadius: 5,
                    }}
                  >
                    {item.overlayText}
                  </Text>
                </View>
              ) : null}

              {activeTab === "reels" && (
                <View className="absolute right-2 top-2">
                  <Ionicons name="play" size={17} color={colors.white} />
                </View>
              )}

              <View className="absolute bottom-2 left-2 flex-row items-center rounded-full bg-background/80 px-2 py-1">
                <Ionicons name="eye-outline" size={13} color={colors.white} />
                <Text className="ml-1 text-[11px] font-bold text-white">
                  {Number(item.views) > 999
                    ? `${(Number(item.views) / 1000).toFixed(1)}K`
                    : Number(item.views) || 0}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View className="items-center px-6 py-14">
          <Ionicons
            name={
              activePage.error
                ? "cloud-offline-outline"
                : activeTab === "reels"
                  ? "videocam-outline"
                  : "images-outline"
            }
            size={34}
            color={colors["icon-muted"]}
          />

          <Text
            className="mt-3 text-[15px] font-bold"
            style={{
              color: colors["text-primary"],
            }}
          >
            {activePage.error ||
              (activeTab === "reels"
                ? "No reels yet"
                : activeTab === "posts"
                  ? "No posts yet"
                  : "No saved posts yet")}
          </Text>

          <Text
            className="mt-1 text-center text-[13px]"
            style={{
              color: colors["text-secondary"],
            }}
          >
            {activePage.error
              ? "Check your connection and try again."
              : activeTab === "reels"
                ? "Your short videos will appear here."
                : activeTab === "posts"
                  ? "Photos you share will appear here."
                  : "Posts you save will appear here."}
          </Text>
        </View>
      )}
      {activePage.loadingMore ? (
        <View className="items-center py-5">
          <Text className="text-sm text-text-secondary">
            Loading six more...
          </Text>
        </View>
      ) : activePage.error && data.length > 0 ? (
        <Text className="py-4 text-center text-sm text-text-secondary">
          {activePage.error}
        </Text>
      ) : activePage.hasMore && data.length > 0 ? (
        <Pressable
          onPress={() => loadPage(activeTab)}
          className="items-center py-5"
        >
          <Text className="text-sm font-semibold text-primary">
            Load six more
          </Text>
        </Pressable>
      ) : null}
      {openedPost ? <OpenPostModal item={openedPost} onClose={() => setOpenedPost(null)} /> : null}
    </View>
  );
});

export default ProfilePosts;
