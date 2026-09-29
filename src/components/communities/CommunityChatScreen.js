import React, { memo, useCallback, useMemo, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { colors } from "../../theme";

/* =========================================================
   CONSTANTS
========================================================= */

const QUICK_EMOJIS = ["❤️", "😂", "😍", "🐾", "👍", "👏", "🔥", "🥰"];

const CURRENT_USER = {
  id: "me",
  name: "You",
};

/* =========================================================
   MAIN SCREEN
========================================================= */

export default function CommunityChatScreen({
  navigation,
  route,
  community: directCommunity,
  embedded = false,
  initialMessages = [],
}) {
  const community = directCommunity || route?.params?.community;

  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sendingImage, setSendingImage] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const listRef = useRef(null);
  const inputRef = useRef(null);

  /* =========================================================
     COMMUNITY INFO NAVIGATION
  ========================================================= */

  const openCommunityInfo = useCallback(() => {
    if (!community || !navigation) {
      return;
    }

    let currentNavigation = navigation;

    /*
     * Search the current navigator and all parent navigators.
     *
     * Web:
     * CommunityChatScreen
     *      ↓
     * WebTabs
     *      ↓
     * MainLayout Stack
     *
     * CommunityInfo belongs to MainLayout Stack.
     *
     * Mobile standalone chat can use the current navigator
     * directly if CommunityInfo is available there.
     */

    while (currentNavigation) {
      const state = currentNavigation.getState?.();

      const routeNames = state?.routeNames || [];

      if (routeNames.includes("CommunityInfo")) {
        currentNavigation.navigate("CommunityInfo", {
          community,
        });

        return;
      }

      currentNavigation = currentNavigation.getParent?.() || null;
    }

    /*
     * Final fallback.
     *
     * This keeps normal React Navigation behavior if the
     * navigator state is not available for some reason.
     */
    navigation.navigate?.("CommunityInfo", {
      community,
    });
  }, [community, navigation]);

  /* =========================================================
     SELECTED MESSAGE
  ========================================================= */

  const selectedMessage = useMemo(() => {
    if (!selectedMessageId) {
      return null;
    }

    return messages.find((item) => item.id === selectedMessageId) || null;
  }, [messages, selectedMessageId]);

  /* =========================================================
     CLOSE ACTION MODE
  ========================================================= */

  const closeMessageActions = useCallback(() => {
    setSelectedMessageId(null);
    setIsEditing(false);
    setMessage("");
    setShowEmojiPicker(false);

    Keyboard.dismiss();
  }, []);

  /* =========================================================
     REACTION
  ========================================================= */

  const toggleReaction = useCallback((messageId, emoji) => {
    setMessages((previous) =>
      previous.map((item) => {
        if (item.id !== messageId || item.deleted) {
          return item;
        }

        const reactions = {
          ...(item.reactions || {}),
        };

        const currentReaction = reactions[CURRENT_USER.id];

        if (currentReaction === emoji) {
          delete reactions[CURRENT_USER.id];
        } else {
          reactions[CURRENT_USER.id] = emoji;
        }

        return {
          ...item,
          reactions,
        };
      }),
    );
  }, []);

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  const sendTextMessage = useCallback(() => {
    const text = message.trim();

    if (!text) {
      return;
    }

    /* EDIT EXISTING MESSAGE */

    if (isEditing && selectedMessageId) {
      setMessages((previous) =>
        previous.map((item) => {
          if (item.id !== selectedMessageId) {
            return item;
          }

          if (
            item.senderId !== CURRENT_USER.id ||
            item.deleted ||
            item.type !== "text"
          ) {
            return item;
          }

          return {
            ...item,
            message: text,
            edited: true,
          };
        }),
      );

      setMessage("");
      setIsEditing(false);
      setSelectedMessageId(null);

      Keyboard.dismiss();

      return;
    }

    /* REACTION FROM KEYBOARD */

    if (selectedMessageId && !isEditing) {
      const emoji = getLastEmoji(text);

      if (emoji) {
        toggleReaction(selectedMessageId, emoji);

        setMessage("");

        return;
      }

      return;
    }

    /* NEW MESSAGE */

    const newMessage = {
      id: `local-${Date.now()}`,
      type: "text",
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.name,
      message: text,
      time: getCurrentTime(),
      admin: false,
      reactions: {},
    };

    setMessages((previous) => [...previous, newMessage]);

    setMessage("");

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd?.({
        animated: true,
      });
    });
  }, [message, isEditing, selectedMessageId, toggleReaction]);

  /* =========================================================
     QUICK EMOJI
  ========================================================= */

  const insertEmoji = useCallback(
    (emoji) => {
      if (selectedMessageId && !isEditing) {
        toggleReaction(selectedMessageId, emoji);

        return;
      }

      setMessage((previous) => `${previous}${emoji}`);
    },
    [selectedMessageId, isEditing, toggleReaction],
  );

  /* =========================================================
     SELECT MESSAGE
  ========================================================= */

  const handleLongPressMessage = useCallback((item) => {
    if (item.deleted) {
      return;
    }

    setSelectedMessageId(item.id);
    setIsEditing(false);
    setMessage("");
    setShowEmojiPicker(false);

    requestAnimationFrame(() => {
      inputRef.current?.focus?.();
    });
  }, []);

  /* =========================================================
     EDIT MESSAGE
  ========================================================= */

  const handleEditMessage = useCallback(() => {
    if (!selectedMessage) {
      return;
    }

    if (selectedMessage.senderId !== CURRENT_USER.id) {
      return;
    }

    if (selectedMessage.type !== "text" || selectedMessage.deleted) {
      return;
    }

    setMessage(selectedMessage.message || "");

    setIsEditing(true);

    requestAnimationFrame(() => {
      inputRef.current?.focus?.();
    });
  }, [selectedMessage]);

  /* =========================================================
     DELETE MESSAGE
  ========================================================= */

  const performDeleteMessage = useCallback(() => {
    if (!selectedMessage) {
      return;
    }

    setMessages((previous) =>
      previous.map((item) => {
        if (item.id !== selectedMessage.id) {
          return item;
        }

        return {
          ...item,
          deleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy: CURRENT_USER.id,
          message: "",
          imageUri: undefined,
          reactions: {},
          edited: false,
        };
      }),
    );

    setSelectedMessageId(null);
    setIsEditing(false);
    setMessage("");
    setShowEmojiPicker(false);

    Keyboard.dismiss();
  }, [selectedMessage]);

  const handleDeleteMessage = useCallback(() => {
    if (!selectedMessage) {
      return;
    }

    if (selectedMessage.senderId !== CURRENT_USER.id) {
      return;
    }

    if (Platform.OS === "web") {
      const confirmed =
        typeof window !== "undefined"
          ? window.confirm("Delete this message?")
          : true;

      if (confirmed) {
        performDeleteMessage();
      }

      return;
    }

    Alert.alert("Delete message?", "This message will be deleted.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: performDeleteMessage,
      },
    ]);
  }, [selectedMessage, performDeleteMessage]);

  /* =========================================================
     CANCEL EDIT
  ========================================================= */

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setSelectedMessageId(null);
    setMessage("");

    Keyboard.dismiss();
  }, []);

  /* =========================================================
     IMAGE
  ========================================================= */

  const selectImage = useCallback(async () => {
    try {
      setSendingImage(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      const imageUri = result.assets[0].uri;

      const imageMessage = {
        id: `image-${Date.now()}`,
        type: "image",
        senderId: CURRENT_USER.id,
        senderName: CURRENT_USER.name,
        imageUri,
        time: getCurrentTime(),
        admin: false,
        reactions: {},
      };

      setMessages((previous) => [...previous, imageMessage]);

      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd?.({
          animated: true,
        });
      });
    } catch (error) {
      console.error("Image selection failed:", error);
    } finally {
      setSendingImage(false);
    }
  }, []);

  /* =========================================================
     RENDER MESSAGE
  ========================================================= */

  const renderMessage = useCallback(
    ({ item }) => (
      <CommunityMessage
        item={item}
        selected={item.id === selectedMessageId}
        onLongPress={handleLongPressMessage}
        onReaction={toggleReaction}
      />
    ),
    [selectedMessageId, handleLongPressMessage, toggleReaction],
  );

  const keyExtractor = useCallback((item) => item.id, []);

  /* =========================================================
     NORMAL HEADER
  ========================================================= */

  const normalHeader = useMemo(() => {
    if (!community) {
      return null;
    }

    return (
      <View
        className="flex-row items-center border-b border-border bg-surface px-4 py-3"
        style={{
          paddingTop: Math.max(12, insets.top),
        }}
      >
        {/* BACK BUTTON */}

        {!embedded && (
          <Pressable
            onPress={() => navigation?.goBack?.()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-surface-elevated"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={21} color={colors.white} />
          </Pressable>
        )}

        {/* COMMUNITY IMAGE / ICON */}

        <Pressable
          onPress={openCommunityInfo}
          className="h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-surface-elevated"
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Open community information"
        >
          {community?.coverImage || community?.coverImageUri ? (
            <Image
              source={{
                uri: community.coverImage || community.coverImageUri,
              }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="people" size={22} color={colors.primary} />
          )}
        </Pressable>

        {/* COMMUNITY NAME */}

        <Pressable
          onPress={openCommunityInfo}
          className="ml-2 min-w-0 flex-1 py-1"
          hitSlop={{
            top: 8,
            bottom: 8,
          }}
          accessibilityRole="button"
          accessibilityLabel={`Open information for ${
            community?.name || "Community"
          }`}
        >
          <Text
            numberOfLines={1}
            className="text-base font-bold text-text-primary"
          >
            {community?.name || "Community"}
          </Text>

          <Text
            numberOfLines={1}
            className="mt-0.5 text-xs text-text-secondary"
          >
            {community?.memberCount || 0} members
          </Text>
        </Pressable>

        {/* INFO BUTTON */}

        <Pressable
          onPress={openCommunityInfo}
          className="ml-2 h-10 w-10 items-center justify-center rounded-full bg-surface-elevated"
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Community information"
        >
          <Ionicons
            name="information-circle-outline"
            size={21}
            color={colors.white}
          />
        </Pressable>
      </View>
    );
  }, [community, embedded, navigation, insets.top, openCommunityInfo]);

  /* =========================================================
     MESSAGE ACTION HEADER
  ========================================================= */

  const actionHeader = useMemo(() => {
    if (!selectedMessage) {
      return null;
    }

    const isOwnMessage = selectedMessage.senderId === CURRENT_USER.id;

    const canEdit =
      isOwnMessage &&
      selectedMessage.type === "text" &&
      !selectedMessage.deleted &&
      !isEditing;

    const canDelete = isOwnMessage && !selectedMessage.deleted && !isEditing;

    return (
      <View
        className="flex-row items-center border-b border-border bg-surface px-3 py-2"
        style={{
          paddingTop: Math.max(8, insets.top),
        }}
      >
        {/* CLOSE */}

        <Pressable
          onPress={isEditing ? cancelEdit : closeMessageActions}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface-elevated"
          hitSlop={8}
        >
          <Ionicons name="close" size={21} color={colors.white} />
        </Pressable>

        <View className="ml-3 flex-1">
          <Text className="text-sm font-bold text-text-primary">
            {isEditing ? "Edit message" : "Message selected"}
          </Text>

          {!isEditing && (
            <Text className="mt-0.5 text-[11px] text-text-secondary">
              Choose a reaction or action
            </Text>
          )}
        </View>

        {/* EDIT */}

        {canEdit && (
          <Pressable
            onPress={handleEditMessage}
            className="mr-1 h-10 w-10 items-center justify-center rounded-full bg-surface-elevated"
            hitSlop={8}
          >
            <Ionicons name="create-outline" size={21} color={colors.white} />
          </Pressable>
        )}

        {/* DELETE */}

        {canDelete && (
          <Pressable
            onPress={handleDeleteMessage}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface-elevated"
            hitSlop={8}
          >
            <Ionicons name="trash-outline" size={20} color={colors.white} />
          </Pressable>
        )}
      </View>
    );
  }, [
    selectedMessage,
    isEditing,
    insets.top,
    cancelEdit,
    closeMessageActions,
    handleEditMessage,
    handleDeleteMessage,
  ]);

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!community) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-surface-elevated">
          <Ionicons name="people-outline" size={36} color={colors.iconMuted} />
        </View>

        <Text className="mt-5 text-base font-semibold text-text-primary">
          Community not found.
        </Text>
      </View>
    );
  }

  /* =========================================================
     CONTENT
  ========================================================= */

  const content = (
    <View className="flex-1 bg-background">
      {selectedMessage ? actionHeader : normalHeader}

      {/* EMPTY STATE */}

      {messages.length === 0 ? (
        <EmptyMessagesState />
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={keyExtractor}
          renderItem={renderMessage}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingTop: 12,
            paddingBottom: Math.max(20, insets.bottom + 20),
          }}
          initialNumToRender={12}
          maxToRenderPerBatch={8}
          windowSize={7}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={<View className="h-2" />}
        />
      )}

      {/* EMOJI PICKER */}

      {showEmojiPicker && !selectedMessage && (
        <View className="border-t border-border bg-surface px-4 py-3">
          <View className="flex-row flex-wrap gap-2">
            {QUICK_EMOJIS.map((emoji) => (
              <Pressable
                key={emoji}
                onPress={() => insertEmoji(emoji)}
                className="h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated"
              >
                <Text className="text-xl">{emoji}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* SELECTED MESSAGE REACTIONS */}

      {selectedMessage && !isEditing && !selectedMessage.deleted && (
        <View className="border-t border-border bg-surface px-4 py-3">
          <View className="flex-row items-center justify-between rounded-2xl border border-border bg-surface-elevated px-2 py-2">
            {QUICK_EMOJIS.map((emoji) => {
              const currentReaction =
                selectedMessage.reactions?.[CURRENT_USER.id];

              const isSelected = currentReaction === emoji;

              return (
                <Pressable
                  key={emoji}
                  onPress={() => toggleReaction(selectedMessage.id, emoji)}
                  className={`h-11 w-11 items-center justify-center rounded-full ${
                    isSelected ? "bg-primary/20" : ""
                  }`}
                >
                  <Text className="text-2xl">{emoji}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="mt-2 text-center text-[11px] text-text-secondary">
            Choose a reaction or use your keyboard emoji
          </Text>
        </View>
      )}

      {/* INPUT AREA */}

      <View
        className="border-t border-border bg-surface px-3 pt-3"
        style={{
          paddingBottom: Math.max(10, insets.bottom + 6),
        }}
      >
        <View className="mx-auto w-full max-w-[1000px]">
          {/* EDITING BAR */}

          {isEditing && (
            <View className="mb-2 flex-row items-center rounded-xl bg-surface-elevated px-3 py-2">
              <Ionicons
                name="create-outline"
                size={17}
                color={colors.primary}
              />

              <View className="ml-2 flex-1">
                <Text className="text-xs font-semibold text-primary">
                  Editing message
                </Text>

                <Text
                  numberOfLines={1}
                  className="mt-0.5 text-[11px] text-text-secondary"
                >
                  Make your changes and send
                </Text>
              </View>

              <Pressable
                onPress={cancelEdit}
                className="h-8 w-8 items-center justify-center rounded-full"
                hitSlop={8}
              >
                <Ionicons name="close" size={18} color={colors.white} />
              </Pressable>
            </View>
          )}

          {/* INPUT */}

          <View className="flex-row items-end rounded-2xl border border-border bg-surface-elevated px-2 py-2">
            {/* EMOJI */}

            <Pressable
              onPress={() => {
                if (selectedMessage && !isEditing) {
                  inputRef.current?.focus?.();
                  return;
                }

                setShowEmojiPicker((previous) => !previous);
              }}
              className="h-10 w-10 items-center justify-center"
              hitSlop={6}
            >
              <Ionicons
                name="happy-outline"
                size={23}
                color={
                  selectedMessage || showEmojiPicker
                    ? colors.primary
                    : colors.white
                }
              />
            </Pressable>

            {/* TEXT INPUT */}

            <TextInput
              ref={inputRef}
              value={message}
              onChangeText={setMessage}
              placeholder={
                selectedMessage && !isEditing
                  ? "Choose an emoji from keyboard"
                  : "Type a message"
              }
              placeholderTextColor={colors.textPlaceholder}
              multiline
              onFocus={() => {
                if (selectedMessage) {
                  setShowEmojiPicker(false);
                }
              }}
              className="max-h-[100px] flex-1 px-2 py-2 text-base text-text-primary"
            />

            {/* IMAGE */}

            {!selectedMessage && !isEditing && (
              <Pressable
                onPress={selectImage}
                disabled={sendingImage}
                className="h-10 w-10 items-center justify-center"
                hitSlop={6}
              >
                {sendingImage ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons
                    name="image-outline"
                    size={22}
                    color={colors.white}
                  />
                )}
              </Pressable>
            )}

            {/* SEND */}

            <Pressable
              onPress={sendTextMessage}
              disabled={!message.trim()}
              className="ml-1 h-10 w-10 items-center justify-center rounded-full bg-primary"
              style={{
                opacity: message.trim() ? 1 : 0.45,
              }}
              hitSlop={6}
            >
              <Ionicons
                name={
                  selectedMessage && !isEditing
                    ? "heart"
                    : isEditing
                      ? "checkmark"
                      : "send"
                }
                size={18}
                color={colors.white}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );

  /* =========================================================
     EMBEDDED MODE
  ========================================================= */

  if (embedded) {
    return (
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  /* =========================================================
     NORMAL SCREEN
  ========================================================= */

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      className="flex-1 bg-background"
    >
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================================================
   MESSAGE COMPONENT
========================================================= */

const CommunityMessage = memo(function CommunityMessage({
  item,
  selected,
  onLongPress,
  onReaction,
}) {
  const [showWebReactions, setShowWebReactions] = useState(false);

  const isWeb = Platform.OS === "web";

  const reactionSummary = useMemo(() => {
    const summary = {};

    Object.values(item.reactions || {}).forEach((emoji) => {
      if (!emoji) {
        return;
      }

      summary[emoji] = (summary[emoji] || 0) + 1;
    });

    return summary;
  }, [item.reactions]);

  const hasReactions = Object.keys(reactionSummary).length > 0;

  const handleWebReactionButton = useCallback(() => {
    if (item.deleted) {
      return;
    }

    setShowWebReactions((previous) => !previous);
  }, [item.deleted]);

  const handleWebContextMenu = useCallback(
    (event) => {
      if (!isWeb || item.deleted) {
        return;
      }

      event?.preventDefault?.();

      setShowWebReactions(true);
    },
    [isWeb, item.deleted],
  );

  const handleReaction = useCallback(
    (emoji) => {
      if (item.deleted) {
        return;
      }

      onReaction(item.id, emoji);

      setShowWebReactions(false);
    },
    [item.deleted, item.id, onReaction],
  );

  return (
    <View className="mb-5">
      {/* SENDER */}

      <View className="flex-row items-center">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-elevated">
          <Ionicons
            name="person"
            size={17}
            color={item.admin ? colors.primary : colors.white}
          />
        </View>

        <Text className="ml-2 text-sm font-bold text-text-primary">
          {item.senderName}
        </Text>

        {item.admin && (
          <View className="ml-2 rounded-full bg-surface-elevated px-2 py-1">
            <Text className="text-[9px] font-bold text-primary">ADMIN</Text>
          </View>
        )}
      </View>

      {/* MESSAGE */}

      <View className="relative ml-11 mt-1 max-w-[900px]">
        <Pressable
          onLongPress={() => {
            if (!item.deleted) {
              onLongPress(item);
            }
          }}
          delayLongPress={350}
          onContextMenu={handleWebContextMenu}
          className={`rounded-2xl rounded-tl-md border px-4 py-3 ${
            selected
              ? "border-primary bg-surface-elevated"
              : "border-border bg-surface"
          }`}
        >
          {/* DELETED */}

          {item.deleted ? (
            <View className="flex-row items-center">
              <Ionicons
                name="ban-outline"
                size={17}
                color={colors.textSecondary}
              />

              <Text className="ml-2 text-sm italic text-text-secondary">
                This message was deleted
              </Text>
            </View>
          ) : item.type === "image" ? (
            /* IMAGE */

            <Image
              source={{
                uri: item.imageUri,
              }}
              className="h-[260px] w-[260px] rounded-xl"
              resizeMode="cover"
            />
          ) : (
            /* TEXT */

            <Text className="text-base leading-6 text-text-primary">
              {item.message}
            </Text>
          )}

          {/* TIME */}

          <View className="mt-2 flex-row items-center">
            <Text className="text-[10px] text-text-secondary">{item.time}</Text>

            {item.edited && !item.deleted && (
              <Text className="ml-2 text-[10px] text-text-secondary">
                edited
              </Text>
            )}
          </View>
        </Pressable>

        {/* WEB REACTION BUTTON */}

        {isWeb && !item.deleted && (
          <Pressable
            onPress={handleWebReactionButton}
            className="absolute -right-2 -top-3 h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-elevated"
            hitSlop={6}
          >
            <Ionicons
              name="happy-outline"
              size={17}
              color={showWebReactions ? colors.primary : colors.white}
            />
          </Pressable>
        )}

        {/* WEB REACTION PICKER */}

        {isWeb && showWebReactions && !item.deleted && (
          <View className="absolute right-0 top-10 z-50 flex-row items-center rounded-2xl border border-border bg-surface-elevated px-2 py-2 shadow-lg">
            {QUICK_EMOJIS.map((emoji) => {
              const currentUserReaction = item.reactions?.[CURRENT_USER.id];

              const isMine = currentUserReaction === emoji;

              return (
                <Pressable
                  key={emoji}
                  onPress={() => handleReaction(emoji)}
                  className={`mx-0.5 h-9 w-9 items-center justify-center rounded-full ${
                    isMine ? "bg-primary/20" : ""
                  }`}
                >
                  <Text className="text-xl">{emoji}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* REACTION SUMMARY */}

        {hasReactions && !item.deleted && (
          <View className="mt-1 flex-row flex-wrap">
            {Object.entries(reactionSummary).map(([emoji, count]) => {
              const currentUserReaction = item.reactions?.[CURRENT_USER.id];

              const isMine = currentUserReaction === emoji;

              return (
                <Pressable
                  key={emoji}
                  onPress={() => onReaction(item.id, emoji)}
                  className={`mr-1 mt-1 flex-row items-center rounded-full border px-2 py-1 ${
                    isMine
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface-elevated"
                  }`}
                >
                  <Text className="text-xs">{emoji}</Text>

                  <Text className="ml-1 text-[10px] text-text-secondary">
                    {count}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
});

/* =========================================================
   HELPERS
========================================================= */

function getCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getLastEmoji(value) {
  const characters = Array.from(value.trim());

  if (!characters.length) {
    return null;
  }

  const lastCharacter = characters[characters.length - 1];

  const isEmoji =
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u.test(
      lastCharacter,
    );

  return isEmoji ? lastCharacter : null;
}

/* =========================================================
   EMPTY MESSAGES
========================================================= */

function EmptyMessagesState() {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-surface-elevated">
        <Ionicons
          name="chatbubbles-outline"
          size={36}
          color={colors.iconMuted}
        />
      </View>

      <Text className="mt-5 text-xl font-bold text-text-primary">
        No messages yet
      </Text>

      <Text className="mt-2 max-w-[400px] text-center text-sm leading-5 text-text-secondary">
        Start the conversation and be the first to send a message.
      </Text>
    </View>
  );
}
