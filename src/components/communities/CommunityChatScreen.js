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

/*
  Each user can have ONLY ONE reaction
  on a particular message.

  Example:

  reactions: {
    me: "❤️",
    mehak: "😂",
    aarav: "👍"
  }
*/

const INITIAL_MESSAGES = [
  {
    id: "m1",
    type: "text",
    senderId: "admin",
    senderName: "Community Admin",
    message: "Welcome everyone! Feel free to introduce yourself and your pet.",
    time: "10:12 AM",
    admin: true,

    reactions: {
      me: "👋",
      mehak: "🐾",
      aarav: "🐾",
      riya: "🐾",
      arjun: "🐾",
      simran: "👋",
    },
  },

  {
    id: "m2",
    type: "text",
    senderId: "mehak",
    senderName: "Mehak",
    message: "Hello everyone! Milo and I are happy to be here 🐾",
    time: "10:18 AM",

    reactions: {
      mehak: "❤️",
      aarav: "❤️",
      riya: "❤️",
      arjun: "❤️",
      simran: "❤️",
      admin: "🐾",
      rohan: "🐾",
      neha: "🐾",
    },
  },

  {
    id: "m3",
    type: "text",
    senderId: "aarav",
    senderName: "Aarav",
    message: "Anyone joining the weekend pet walk?",
    time: "10:25 AM",

    reactions: {
      me: "👍",
      mehak: "👍",
      riya: "👍",
      arjun: "👍",
    },
  },

  {
    id: "m4",
    type: "text",
    senderId: "admin",
    senderName: "Community Admin",
    message: "Yes! Details will be posted in the Events section.",
    time: "10:27 AM",
    admin: true,

    reactions: {},
  },
];

/* =========================================================
   MAIN SCREEN
========================================================= */

export default function CommunityChatScreen({
  navigation,
  route,
  community: directCommunity,
  embedded = false,
  initialMessages = INITIAL_MESSAGES,
}) {
  const community = directCommunity || route?.params?.community;

  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState(initialMessages);

  const [message, setMessage] = useState("");

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [sendingImage, setSendingImage] = useState(false);

  /*
    ID of the message currently selected
    for reaction / edit / delete.
  */
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  /*
    If true, the selected message is being edited.
  */
  const [isEditing, setIsEditing] = useState(false);

  const listRef = useRef(null);

  const inputRef = useRef(null);

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
     CLOSE MESSAGE ACTION MODE
  ========================================================= */

  const closeMessageActions = useCallback(() => {
    setSelectedMessageId(null);
    setIsEditing(false);
    setMessage("");

    Keyboard.dismiss();
  }, []);

  /* =========================================================
     SEND TEXT MESSAGE
  ========================================================= */

  const sendTextMessage = useCallback(() => {
    const text = message.trim();

    if (!text) {
      return;
    }

    /* -------------------------------------------------------
       EDIT EXISTING MESSAGE
    ------------------------------------------------------- */

    if (isEditing && selectedMessageId) {
      setMessages((previous) =>
        previous.map((item) => {
          if (item.id !== selectedMessageId) {
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

    /* -------------------------------------------------------
       REACTION FROM NATIVE KEYBOARD

       When a message is selected, the input becomes a
       reaction composer.

       User can switch their device keyboard to emoji,
       choose an emoji and press send.
    ------------------------------------------------------- */

    if (selectedMessageId && !isEditing) {
      const emoji = getLastEmoji(text);

      if (emoji) {
        toggleReaction(selectedMessageId, emoji);

        setMessage("");

        return;
      }

      /*
        If selected-message mode is active but the
        user entered normal text, don't accidentally
        send it as a chat message.
      */

      return;
    }

    /* -------------------------------------------------------
       NORMAL NEW MESSAGE
    ------------------------------------------------------- */

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
  }, [message, isEditing, selectedMessageId]);

  /* =========================================================
     INSERT QUICK EMOJI
  ========================================================= */

  const insertEmoji = useCallback(
    (emoji) => {
      /*
        If a message is selected, this emoji is a
        reaction to that message.
      */

      if (selectedMessageId && !isEditing) {
        toggleReaction(selectedMessageId, emoji);

        return;
      }

      /*
        Otherwise it behaves as a normal emoji
        inserted into the chat input.
      */

      setMessage((previous) => `${previous}${emoji}`);
    },
    [selectedMessageId, isEditing],
  );

  /* =========================================================
     TOGGLE REACTION
     
     ONE USER = ONE REACTION PER MESSAGE
     
     Same emoji:
       remove reaction

     Different emoji:
       replace previous reaction
  ========================================================= */

  const toggleReaction = useCallback((messageId, emoji) => {
    setMessages((previous) =>
      previous.map((item) => {
        if (item.id !== messageId) {
          return item;
        }

        const reactions = {
          ...(item.reactions || {}),
        };

        const currentReaction = reactions[CURRENT_USER.id];

        /*
            Same reaction = remove it.
          */

        if (currentReaction === emoji) {
          delete reactions[CURRENT_USER.id];

          return {
            ...item,
            reactions,
          };
        }

        /*
            New reaction OR changing existing
            reaction.
          */

        reactions[CURRENT_USER.id] = emoji;

        return {
          ...item,
          reactions,
        };
      }),
    );
  }, []);

  /* =========================================================
     LONG PRESS MESSAGE
  ========================================================= */

  const handleLongPressMessage = useCallback((item) => {
    setSelectedMessageId(item.id);
    setIsEditing(false);
    setMessage("");

    /*
          Open the native keyboard.

          The user can switch to their device's
          emoji keyboard from here.
        */

    requestAnimationFrame(() => {
      inputRef.current?.focus?.();
    });
  }, []);

  /* =========================================================
     EDIT MESSAGE
     
     Only own messages can be edited.
  ========================================================= */

  const handleEditMessage = useCallback(() => {
    if (!selectedMessage) {
      return;
    }

    if (selectedMessage.senderId !== CURRENT_USER.id) {
      return;
    }

    if (selectedMessage.type !== "text") {
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
     
     Only own messages can be deleted.
  ========================================================= */

  const handleDeleteMessage = useCallback(() => {
    if (!selectedMessage) {
      return;
    }

    if (selectedMessage.senderId !== CURRENT_USER.id) {
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

        onPress: () => {
          setMessages((previous) =>
            previous.filter((item) => item.id !== selectedMessage.id),
          );

          setSelectedMessageId(null);
          setIsEditing(false);
          setMessage("");

          Keyboard.dismiss();
        },
      },
    ]);
  }, [selectedMessage]);

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
        {!embedded && (
          <Pressable
            onPress={() => navigation?.goBack?.()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-surface-elevated"
          >
            <Ionicons name="arrow-back" size={21} color={colors.iconMuted} />
          </Pressable>
        )}

        <View className="h-11 w-11 items-center justify-center rounded-full bg-surface-elevated">
          <Ionicons name="people" size={22} color={colors.primary} />
        </View>

        <View className="ml-3 flex-1">
          <Text
            numberOfLines={1}
            className="text-base font-bold text-text-primary"
          >
            {community.name}
          </Text>

          <Text className="mt-0.5 text-xs text-text-secondary">
            {community.members || "Community chat"}
          </Text>
        </View>

        <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-surface-elevated">
          <Ionicons name="search-outline" size={20} color={colors.iconMuted} />
        </Pressable>

        <Pressable className="ml-2 h-10 w-10 items-center justify-center rounded-full bg-surface-elevated">
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={colors.iconMuted}
          />
        </Pressable>
      </View>
    );
  }, [community, embedded, navigation, insets.top]);

  /* =========================================================
     MESSAGE ACTION HEADER
     
     Appears after long press.
     
     Own message:
       Edit + Delete

     Other user's message:
       No Edit/Delete
  ========================================================= */

  const actionHeader = useMemo(() => {
    if (!selectedMessage) {
      return null;
    }

    const isOwnMessage = selectedMessage.senderId === CURRENT_USER.id;

    return (
      <View
        className="flex-row items-center border-b border-border bg-surface px-3 py-2"
        style={{
          paddingTop: Math.max(8, insets.top),
        }}
      >
        <Pressable
          onPress={isEditing ? cancelEdit : closeMessageActions}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface-elevated"
        >
          <Ionicons name="close" size={21} color={colors.iconMuted} />
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

        {isOwnMessage && selectedMessage.type === "text" && !isEditing && (
          <Pressable
            onPress={handleEditMessage}
            className="mr-1 h-10 w-10 items-center justify-center rounded-full bg-surface-elevated"
          >
            <Ionicons
              name="create-outline"
              size={21}
              color={colors.iconMuted}
            />
          </Pressable>
        )}

        {isOwnMessage && !isEditing && (
          <Pressable
            onPress={handleDeleteMessage}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface-elevated"
          >
            <Ionicons name="trash-outline" size={20} color={colors.iconMuted} />
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
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-base text-text-primary">
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
      {/* -----------------------------------------------------
          HEADER
      ----------------------------------------------------- */}

      {selectedMessage ? actionHeader : normalHeader}

      {/* -----------------------------------------------------
          MESSAGES
      ----------------------------------------------------- */}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={keyExtractor}
        renderItem={renderMessage}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 18,

          /*
            Extra space so the final message doesn't
            sit directly behind the input.
          */
          paddingBottom: Math.max(20, insets.bottom + 20),
        }}
        initialNumToRender={12}
        maxToRenderPerBatch={8}
        windowSize={7}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={<View className="h-2" />}
      />

      {/* -----------------------------------------------------
          QUICK EMOJI PANEL
      ----------------------------------------------------- */}

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

      {/* -----------------------------------------------------
          REACTION QUICK BAR

          Appears specifically after long press.
      ----------------------------------------------------- */}

      {selectedMessage && !isEditing && (
        <View className="border-t border-border bg-surface px-4 py-3">
          <View className="flex-row items-center justify-between rounded-2xl border border-border bg-surface-elevated px-2 py-2">
            {QUICK_EMOJIS.slice(0, 6).map((emoji) => {
              const currentReaction =
                selectedMessage.reactions?.[CURRENT_USER.id];

              const selected = currentReaction === emoji;

              return (
                <Pressable
                  key={emoji}
                  onPress={() => toggleReaction(selectedMessage.id, emoji)}
                  className={`h-11 w-11 items-center justify-center rounded-full ${
                    selected ? "bg-primary/20" : ""
                  }`}
                >
                  <Text className="text-2xl">{emoji}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="mt-2 text-center text-[11px] text-text-secondary">
            Choose a reaction or switch to your keyboard emoji panel
          </Text>
        </View>
      )}

      {/* -----------------------------------------------------
          INPUT
      ----------------------------------------------------- */}

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
              >
                <Ionicons name="close" size={18} color={colors.iconMuted} />
              </Pressable>
            </View>
          )}

          <View className="flex-row items-end rounded-2xl border border-border bg-surface-elevated px-2 py-2">
            {/* ---------------------------------------------
                EMOJI BUTTON

                Normal mode:
                  opens our quick emoji panel.

                Selected message:
                  focuses native keyboard.
            --------------------------------------------- */}

            <Pressable
              onPress={() => {
                if (selectedMessage && !isEditing) {
                  inputRef.current?.focus?.();

                  return;
                }

                setShowEmojiPicker((previous) => !previous);
              }}
              className="h-10 w-10 items-center justify-center"
            >
              <Ionicons
                name="happy-outline"
                size={23}
                color={
                  selectedMessage
                    ? colors.primary
                    : showEmojiPicker
                      ? colors.primary
                      : colors.iconMuted
                }
              />
            </Pressable>

            {/* ---------------------------------------------
                INPUT
            --------------------------------------------- */}

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
                /*
                  If message selection is active,
                  hide the normal quick emoji
                  panel because native keyboard
                  is now active.
                */

                if (selectedMessage) {
                  setShowEmojiPicker(false);
                }
              }}
              className="max-h-[100px] flex-1 px-2 py-2 text-base text-text-primary"
            />

            {/* ---------------------------------------------
                IMAGE

                Hidden during edit/reaction mode.
            --------------------------------------------- */}

            {!selectedMessage && !isEditing && (
              <Pressable
                onPress={selectImage}
                disabled={sendingImage}
                className="h-10 w-10 items-center justify-center"
              >
                {sendingImage ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons
                    name="image-outline"
                    size={22}
                    color={colors.iconMuted}
                  />
                )}
              </Pressable>
            )}

            {/* ---------------------------------------------
                SEND / REACT
            --------------------------------------------- */}

            <Pressable
              onPress={sendTextMessage}
              disabled={!message.trim()}
              className="ml-1 h-10 w-10 items-center justify-center rounded-full bg-primary"
              style={{
                opacity: message.trim() ? 1 : 0.45,
              }}
            >
              <Ionicons
                name={
                  selectedMessage && !isEditing
                    ? "heart"
                    : isEditing
                      ? "checkmark"
                      : "send"
                }
                size={selectedMessage && !isEditing ? 18 : 18}
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
     
     Important:
     We still apply bottom inset here because embedded
     screens can also be covered by the phone gesture area.
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
  /*
      Convert:

      {
        me: "❤️",
        mehak: "❤️",
        aarav: "🐾"
      }

      into:

      {
        "❤️": 2,
        "🐾": 1
      }
    */

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

  return (
    <View className="mb-5">
      {/* =================================================
            USER
        ================================================= */}

      <View className="flex-row items-center">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-elevated">
          <Ionicons
            name="person"
            size={17}
            color={item.admin ? colors.primary : colors.iconMuted}
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

      {/* =================================================
            MESSAGE
        ================================================= */}

      <View className="ml-11 mt-1 max-w-[900px]">
        <Pressable
          onLongPress={() => onLongPress(item)}
          delayLongPress={350}
          className={`rounded-2xl rounded-tl-md border px-4 py-3 ${
            selected
              ? "border-primary bg-surface-elevated"
              : "border-border bg-surface"
          }`}
        >
          {item.type === "image" ? (
            <Image
              source={{
                uri: item.imageUri,
              }}
              className="h-[260px] w-[260px] rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-base leading-6 text-text-primary">
              {item.message}
            </Text>
          )}

          {/* ---------------------------------------------
                TIME + EDITED
            --------------------------------------------- */}

          <View className="mt-2 flex-row items-center">
            <Text className="text-[10px] text-text-secondary">{item.time}</Text>

            {item.edited && (
              <Text className="ml-2 text-[10px] text-text-secondary">
                edited
              </Text>
            )}
          </View>
        </Pressable>

        {/* =================================================
              REACTION SUMMARY
          ================================================= */}

        {hasReactions && (
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
   GET CURRENT TIME
========================================================= */

function getCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/* =========================================================
   GET LAST EMOJI
     
   This intentionally keeps the implementation simple
   and works with normal Unicode emoji input.

   Later, if we need complete grapheme-cluster handling
   for every complex emoji sequence, this can be moved
   into a small utility service.
========================================================= */

function getLastEmoji(value) {
  const characters = Array.from(value.trim());

  if (!characters.length) {
    return null;
  }a

  const lastCharacter = characters[characters.length - 1];

  /*
    Emoji Unicode ranges.

    This catches common emoji entered from
    the native emoji keyboard.
  */

  const isEmoji =
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u.test(
      lastCharacter,
    );

  return isEmoji ? lastCharacter : null;
}
