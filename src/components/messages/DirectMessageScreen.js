import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth, db } from "../../config/firebase";
import { colors } from "../../theme";

export default function DirectMessageScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const peerId = route?.params?.userId;
  const peerName = route?.params?.name || "Pet parent";
  const peerPhoto = route?.params?.photoUrl || null;
  const viewerId = auth.currentUser?.uid;
  const listRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const memberIds = useMemo(
    () => [viewerId, peerId].filter(Boolean).sort(),
    [viewerId, peerId],
  );
  const conversationId = memberIds.join("_");

  useEffect(() => {
    if (!viewerId || !peerId || viewerId === peerId) {
      setError("This conversation is not available.");
      setLoading(false);
      return undefined;
    }

    let unsubscribe;
    let active = true;
    const conversationRef = doc(db, "conversations", conversationId);
    const messagesQuery = query(
      collection(conversationRef, "messages"),
      orderBy("createdAt", "desc"),
      limit(100),
    );

    setDoc(
      conversationRef,
      { memberIds, updatedAt: serverTimestamp() },
      { merge: true },
    )
      .then(() => {
        if (!active) return;
        unsubscribe = onSnapshot(
          messagesQuery,
          (snapshot) => {
            setMessages(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })).reverse());
            setLoading(false);
            setError("");
          },
          (snapshotError) => {
            console.error("Direct message loading failed:", snapshotError);
            setError("Unable to load messages. Check your connection and retry.");
            setLoading(false);
          },
        );
      })
      .catch((conversationError) => {
        console.error("Direct conversation setup failed:", conversationError);
        setError("Unable to open this conversation.");
        setLoading(false);
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [conversationId, memberIds, peerId, viewerId]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || sending || !viewerId || !peerId) return;
    setSending(true);
    setError("");
    try {
      const conversationRef = doc(db, "conversations", conversationId);
      const messagesCollection = collection(conversationRef, "messages");
      const messageRef = doc(messagesCollection);
      const batch = writeBatch(db);
      batch.set(conversationRef, { memberIds, updatedAt: serverTimestamp() }, { merge: true });
      batch.set(messageRef, {
        senderId: viewerId,
        text,
        createdAt: serverTimestamp(),
      });
      await batch.commit();
      setDraft("");
    } catch (sendError) {
      console.error("Direct message send failed:", sendError);
      setError("Message could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="h-14 flex-row items-center border-b border-border px-3">
        <Pressable onPress={() => navigation.goBack()} className="h-10 w-10 items-center justify-center" accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={21} color={colors["text-primary"]} />
        </Pressable>
        {peerPhoto ? (
          <Image source={{ uri: peerPhoto }} className="ml-2 h-9 w-9 rounded-full" />
        ) : (
          <View className="ml-2 h-9 w-9 items-center justify-center rounded-full bg-surface">
            <Ionicons name="paw" size={18} color={colors.primary} />
          </View>
        )}
        <Text numberOfLines={1} className="ml-3 flex-1 font-bold text-text-primary">{peerName}</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: "flex-end" }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={<Text className="py-10 text-center text-sm text-text-secondary">Start the conversation with {peerName}.</Text>}
          renderItem={({ item }) => {
            const own = item.senderId === viewerId;
            return (
              <View className={`mb-2 max-w-[82%] rounded-2xl px-4 py-3 ${own ? "self-end bg-primary" : "self-start bg-surface"}`}>
                <Text className={own ? "text-background" : "text-text-primary"}>{item.text}</Text>
              </View>
            );
          }}
        />
      )}

      {error ? <Text className="px-4 pb-2 text-center text-xs text-accent">{error}</Text> : null}
      <View className="flex-row items-end border-t border-border bg-surface px-3 py-2" style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          multiline
          maxLength={4000}
          placeholder="Write a message..."
          placeholderTextColor={colors["text-placeholder"]}
          className="max-h-28 min-h-11 flex-1 rounded-2xl bg-background px-4 py-3 text-text-primary"
          onSubmitEditing={sendMessage}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send message"
          disabled={sending || !draft.trim()}
          onPress={sendMessage}
          className="ml-2 h-11 w-11 items-center justify-center rounded-full bg-primary"
          style={{ opacity: sending || !draft.trim() ? 0.55 : 1 }}
        >
          {sending ? <ActivityIndicator size="small" color={colors.background} /> : <Ionicons name="send" size={18} color={colors.background} />}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
