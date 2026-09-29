import React from "react";

import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../theme";

/* =========================================================
   EVENT DATA
========================================================= */

const UPCOMING_EVENTS = [
  {
    id: "1",
    title: "Pet Walk & Meet",
    date: "12 OCT",
    time: "7:00 AM",
    location: "Rose Garden",
    attending: "84 attending",
    description:
      "A relaxed morning walk where pet parents can meet, chat and let their pets socialize.",
    image:
      "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "2",
    title: "Pet Photography Meetup",
    date: "19 OCT",
    time: "4:00 PM",
    location: "City Park",
    attending: "42 attending",
    description:
      "Bring your pet and learn simple ways to capture better photos and memorable moments.",
    image:
      "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1000&q=80",
  },
];

/* =========================================================
   EVENT CARD
========================================================= */

function EventCard({ event, isWebGrid }) {
  const dateParts = event.date.split(" ");

  return (
    <View
      className={`overflow-hidden rounded-2xl border border-border bg-surface ${
        isWebGrid ? "mb-4" : "mb-4"
      }`}
      style={
        isWebGrid
          ? {
              width: "100%",
            }
          : undefined
      }
    >
      <View
        className="w-full overflow-hidden bg-surface-elevated"
        style={{
          aspectRatio: 16 / 9,
        }}
      >
        <Image
          source={{ uri: event.image }}
          className="h-full w-full"
          resizeMode="contain"
        />
      </View>

      <View className="p-4">
        <View className="flex-row items-start">
          <View className="mr-3 min-w-[52px] items-center rounded-xl bg-surface-elevated px-2.5 py-2">
            <Text className="text-[11px] font-bold text-primary">
              {dateParts[0]}
            </Text>

            <Text className="mt-0.5 text-base font-bold text-text-primary">
              {dateParts[1]}
            </Text>
          </View>

          <View className="flex-1">
            <Text
              numberOfLines={2}
              className="text-lg font-bold leading-6 text-text-primary"
            >
              {event.title}
            </Text>

            <View className="mt-2 flex-row items-center">
              <Ionicons
                name="time-outline"
                size={15}
                color={colors.iconMuted}
              />

              <Text
                numberOfLines={1}
                className="ml-1.5 flex-1 text-sm text-text-secondary"
              >
                {event.time}
              </Text>
            </View>

            <View className="mt-1 flex-row items-center">
              <Ionicons
                name="location-outline"
                size={15}
                color={colors.iconMuted}
              />

              <Text
                numberOfLines={1}
                className="ml-1.5 flex-1 text-sm text-text-secondary"
              >
                {event.location}
              </Text>
            </View>
          </View>
        </View>

        <Text
          numberOfLines={3}
          className="mt-4 text-sm leading-5 text-text-secondary"
        >
          {event.description}
        </Text>

        <View className="mt-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons
              name="people-outline"
              size={16}
              color={colors.iconMuted}
            />

            <Text className="ml-1.5 text-sm text-text-secondary">
              {event.attending}
            </Text>
          </View>

          <Pressable
            onPress={() => {}}
            className="rounded-xl bg-primary px-5 py-2.5 active:opacity-80"
          >
            <Text className="text-sm font-bold text-white">RSVP</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* =========================================================
   EMPTY EVENTS STATE
========================================================= */

function EmptyEventsState() {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-surface-elevated">
        <Ionicons name="calendar-outline" size={38} color={colors.iconMuted} />
      </View>

      <Text className="mt-5 text-xl font-bold text-text-primary">
        No upcoming events
      </Text>

      <Text className="mt-2 max-w-[420px] text-center text-sm leading-5 text-text-secondary">
        There are no upcoming community events right now. Check back later for
        new pet meetups and activities.
      </Text>
    </View>
  );
}

/* =========================================================
   SCREEN
========================================================= */

export default function UpcomingEventsScreen({ navigation }) {
  const { width } = useWindowDimensions();

  const isWeb = Platform.OS === "web";
  const isWebGrid = isWeb && width >= 768;

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      {/* Header */}

      <View className="h-[70px] flex-row items-center border-b border-border bg-surface px-3">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-elevated"
        >
          <Ionicons name="arrow-back" size={23} color={colors.textPrimary} />
        </Pressable>

        <View className="ml-2 flex-1">
          <Text className="text-xl font-bold text-text-primary">
            Upcoming Events
          </Text>

          <Text className="mt-0.5 text-sm text-text-secondary">
            Meet the community offline
          </Text>
        </View>

        <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-elevated">
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        </View>
      </View>

      {/* Content */}

      {UPCOMING_EVENTS.length === 0 ? (
        <EmptyEventsState />
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: isWebGrid ? 18 : 16,
            paddingBottom: 100,
          }}
        >
          <Text className="mb-5 text-base leading-6 text-text-secondary">
            Discover pet meetups, activities and events happening around the
            community.
          </Text>

          {isWebGrid ? (
            <View className="flex-row flex-wrap">
              {UPCOMING_EVENTS.map((event) => (
                <View
                  key={event.id}
                  style={{
                    width: "50%",
                    paddingRight: 8,
                    paddingLeft: 8,
                  }}
                >
                  <EventCard event={event} isWebGrid />
                </View>
              ))}
            </View>
          ) : (
            <View>
              {UPCOMING_EVENTS.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
