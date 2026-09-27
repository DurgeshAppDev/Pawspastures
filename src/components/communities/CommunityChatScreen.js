import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../theme";

export default function CommunityChatScreen({ navigation, route }) {
  const community = route?.params?.community;

  const [message, setMessage] = useState("");

  if (!community) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1 bg-background"
      >
        <View className="flex-1 items-center justify-center px-6">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-surface-elevated">
            <Ionicons
              name="people-outline"
              size={40}
              color={colors.iconMuted}
            />
          </View>

          <Text className="mt-5 text-xl font-bold text-text-primary">
            Community unavailable
          </Text>

          <Text className="mt-2 text-center text-sm leading-5 text-text-secondary">
            We couldn't load this community.
          </Text>

          <Pressable
            onPress={() => navigation.goBack()}
            className="mt-6 rounded-xl bg-primary px-6 py-3"
          >
            <Text className="font-bold text-text-primary">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* HEADER */}

        <View className="h-[70px] flex-row items-center border-b border-border bg-surface px-3">
          <Pressable
            onPress={() => navigation.goBack()}
            className="mr-2 h-11 w-11 items-center justify-center rounded-full"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={23} color={colors.textPrimary} />
          </Pressable>

          <View className="h-11 w-11 items-center justify-center rounded-full bg-surface-elevated">
            <Ionicons name="people" size={21} color={colors.primary} />
          </View>

          <View className="ml-3 flex-1">
            <Text
              numberOfLines={1}
              className="text-base font-bold text-text-primary"
            >
              {community.name}
            </Text>

            <Text
              numberOfLines={1}
              className="mt-0.5 text-xs text-text-secondary"
            >
              {community.members}
            </Text>
          </View>

          <Pressable className="h-10 w-10 items-center justify-center rounded-full">
            <Ionicons
              name="search-outline"
              size={21}
              color={colors.iconMuted}
            />
          </Pressable>

          <Pressable className="h-10 w-10 items-center justify-center rounded-full">
            <Ionicons
              name="ellipsis-vertical"
              size={21}
              color={colors.iconMuted}
            />
          </Pressable>
        </View>

        {/* CHAT CONTENT */}

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 14,
            paddingVertical: 20,
            paddingBottom: 30,
          }}
        >
          {/* COMMUNITY INFO */}

          <View className="mb-5 items-center">
            <View className="rounded-full bg-surface-elevated px-4 py-2">
              <Text className="text-xs font-medium text-text-secondary">
                Community
              </Text>
            </View>
          </View>

          {/* ANNOUNCEMENT */}

          <View className="mb-6 rounded-2xl border border-border bg-surface-elevated p-4">
            <View className="flex-row items-center">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-icon">
                <Ionicons
                  name="megaphone-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>

              <Text className="ml-2 text-sm font-bold text-text-primary">
                Community announcement
              </Text>
            </View>

            <Text className="mt-3 text-sm leading-5 text-text-secondary">
              Welcome to {community.name}. Keep conversations friendly,
              respectful and focused on pets and the community.
            </Text>
          </View>

          {/* MESSAGES */}

          <Message
            name="Community Admin"
            message="Welcome everyone! Introduce yourself and your pet."
            time="10:12 AM"
            admin
          />

          <Message
            name="Mehak"
            message="Hello everyone! Milo and I are happy to be here 🐾"
            time="10:18 AM"
          />

          <Message
            name="Aarav"
            message="Anyone joining the weekend pet walk?"
            time="10:25 AM"
          />

          <Message
            name="Community Admin"
            message="Yes! Event details will be posted in the Events section."
            time="10:27 AM"
            admin
          />
        </ScrollView>

        {/* MESSAGE COMPOSER */}

        <View className="border-t border-border bg-surface px-3 py-3">
          <View className="flex-row items-end rounded-2xl border border-border bg-surface-elevated px-2 py-1.5">
            <Pressable className="h-10 w-10 items-center justify-center">
              <Ionicons
                name="happy-outline"
                size={22}
                color={colors.iconMuted}
              />
            </Pressable>

            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message"
              placeholderTextColor={colors.textPlaceholder}
              multiline
              className="max-h-24 flex-1 px-2 py-2 text-base text-text-primary"
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
              <Ionicons name="send" size={17} color={colors.white} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Message({ name, message, time, admin = false }) {
  return (
    <View className="mb-4">
      <View className="flex-row items-center">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-surface-elevated">
          <Ionicons
            name="person"
            size={15}
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

      <View className="ml-10 mt-1 rounded-2xl rounded-tl-md border border-border bg-surface p-3">
        <Text className="text-sm leading-5 text-text-primary">{message}</Text>

        <Text className="mt-2 text-[10px] text-text-secondary">{time}</Text>
      </View>
    </View>
  );
}
