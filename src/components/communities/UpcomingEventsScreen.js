import React from "react";

import { Image, Pressable, ScrollView, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../theme";

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

export default function UpcomingEventsScreen({ navigation }) {
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      <View className="h-[70px] flex-row items-center border-b border-border bg-surface px-3">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-11 w-11 items-center justify-center rounded-full"
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

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
        }}
      >
        <Text className="mb-5 text-base leading-6 text-text-secondary">
          Discover pet meetups, activities and events happening around the
          community.
        </Text>

        {UPCOMING_EVENTS.map((event) => (
          <View
            key={event.id}
            className="mb-5 overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <Image
              source={{
                uri: event.image,
              }}
              className="h-44 w-full"
              resizeMode="cover"
            />

            <View className="p-5">
              <View className="flex-row items-start">
                <View className="mr-4 items-center rounded-xl bg-surface-elevated px-3 py-2.5">
                  <Text className="text-xs font-bold text-primary">
                    {event.date.split(" ")[1]}
                  </Text>

                  <Text className="mt-0.5 text-sm font-bold text-text-primary">
                    {event.date.split(" ")[0]}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text className="text-lg font-bold text-text-primary">
                    {event.title}
                  </Text>

                  <View className="mt-2 flex-row items-center">
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={colors.iconMuted}
                    />

                    <Text className="ml-1 text-sm text-text-secondary">
                      {event.time}
                    </Text>
                  </View>

                  <View className="mt-1 flex-row items-center">
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={colors.iconMuted}
                    />

                    <Text className="ml-1 text-sm text-text-secondary">
                      {event.location}
                    </Text>
                  </View>
                </View>
              </View>

              <Text className="mt-5 text-base leading-6 text-text-secondary">
                {event.description}
              </Text>

              <View className="mt-5 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons
                    name="people-outline"
                    size={17}
                    color={colors.iconMuted}
                  />

                  <Text className="ml-1 text-sm text-text-secondary">
                    {event.attending}
                  </Text>
                </View>

                <Pressable
                  onPress={() => {}}
                  className="rounded-xl bg-primary px-5 py-3 active:opacity-80"
                >
                  <Text className="text-sm font-bold text-white">RSVP</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
