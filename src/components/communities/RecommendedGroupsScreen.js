import React, { memo, useCallback, useMemo, useRef, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { Ionicons } from "@expo/vector-icons";

import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../theme";

const QUICK_EMOJIS = ["❤️", "😂", "😍", "🐾", "👍", "👏", "🔥", "🥰"];

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
      "👋": 2,
      "🐾": 4,
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
      "❤️": 5,
      "🐾": 3,
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
      "👍": 4,
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

export default function CommunityChatScreen({
  navigation,
  route,
  community: directCommunity,
  embedded = false,
  initialMessages = INITIAL_MESSAGES,
}) {
  const community = directCommunity || route?.params?.community;

  const [messages, setMessages] = useState(initialMessages);

  const [message, setMessage] = useState("");

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [sendingImage, setSendingImage] = useState(false);

  const listRef = useRef(null);

  const sendTextMessage = useCallback(() => {
    const text = message.trim();

    if (!text) {
      return;
    }

    const newMessage = {
      id: `local-${Date.now()}`,
      type: "text",
      senderId: "me",
      senderName: "You",
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
  }, [message]);

  const insertEmoji = useCallback((emoji) => {
    setMessage((previous) => `${previous}${emoji}`);
  }, []);

  const toggleReaction = useCallback((messageId, emoji) => {
    setMessages((previous) =>
      previous.map((item) => {
        if (item.id !== messageId) {
          return item;
        }

        const currentCount = item.reactions?.[emoji] || 0;

        return {
          ...item,
          reactions: {
            ...(item.reactions || {}),
            [emoji]: currentCount + 1,
          },
        };
      }),
    );
  }, []);

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
        senderId: "me",
        senderName: "You",
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

  const renderMessage = useCallback(
    ({ item }) => <CommunityMessage item={item} onReaction={toggleReaction} />,
    [toggleReaction],
  );

  const keyExtractor = useCallback((item) => item.id, []);

  const header = useMemo(() => {
    if (!community) {
      return null;
    }

    return (
      <View className="flex-row items-center border-b border-border bg-surface px-4 py-3">
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
  }, [community, embedded, navigation]);

  if (!community) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-base text-text-primary">
          Community not found.
        </Text>
      </View>
    );
  }

  const content = (
    <>
      {header}

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
          paddingBottom: 20,
        }}
        initialNumToRender={12}
        maxToRenderPerBatch={8}
        windowSize={7}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={<View className="h-2" />}
      />

      {showEmojiPicker && (
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

      <View className="border-t border-border bg-surface px-3 py-3">
        <View className="mx-auto w-full max-w-[1000px] flex-row items-end rounded-2xl border border-border bg-surface-elevated px-2 py-2">
          <Pressable
            onPress={() => setShowEmojiPicker((previous) => !previous)}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons
              name="happy-outline"
              size={23}
              color={showEmojiPicker ? colors.primary : colors.iconMuted}
            />
          </Pressable>

          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message"
            placeholderTextColor={colors.textPlaceholder}
            multiline
            className="max-h-[100px] flex-1 px-2 py-2 text-base text-text-primary"
          />

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

          <Pressable
            onPress={sendTextMessage}
            disabled={!message.trim()}
            className="ml-1 h-10 w-10 items-center justify-center rounded-full bg-primary"
            style={{
              opacity: message.trim() ? 1 : 0.45,
            }}
          >
            <Ionicons name="send" size={18} color={colors.white} />
          </Pressable>
        </View>
      </View>
    </>
  );

  if (embedded) {
    return (
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
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
   MESSAGE
========================================================= */

const CommunityMessage = memo(function CommunityMessage({ item, onReaction }) {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <View className="mb-5">
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

      <View className="ml-11 mt-1 max-w-[900px]">
        <Pressable
          onLongPress={() => setShowReactions((previous) => !previous)}
          delayLongPress={250}
          className="rounded-2xl rounded-tl-md border border-border bg-surface px-4 py-3"
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

          <Text className="mt-2 text-[10px] text-text-secondary">
            {item.time}
          </Text>
        </Pressable>

        {showReactions && (
          <View className="mt-2 flex-row self-start rounded-full border border-border bg-surface px-2 py-1">
            {QUICK_EMOJIS.slice(0, 6).map((emoji) => (
              <Pressable
                key={emoji}
                onPress={() => {
                  onReaction(item.id, emoji);

                  setShowReactions(false);
                }}
                className="mx-1 h-8 w-8 items-center justify-center"
              >
                <Text className="text-lg">{emoji}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {Object.keys(item.reactions || {}).length > 0 && (
          <View className="mt-1 flex-row flex-wrap">
            {Object.entries(item.reactions).map(([emoji, count]) => (
              <Pressable
                key={emoji}
                onPress={() => onReaction(item.id, emoji)}
                className="mr-1 mt-1 flex-row items-center rounded-full border border-border bg-surface-elevated px-2 py-1"
              >
                <Text className="text-xs">{emoji}</Text>

                <Text className="ml-1 text-[10px] text-text-secondary">
                  {count}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
});

function getCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
