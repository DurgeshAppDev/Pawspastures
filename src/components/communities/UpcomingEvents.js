import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

const EVENTS = [
  {
    id: "1",
    month: "OCT",
    day: "24",
    title: "Sunday Morning Pack Walk",
    location: "Rose Garden, Ludhiana",
    time: "7:00 AM - 9:00 AM",
    attending: "42 attending",
    image:
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=900&q=85",
  },
];

export default function UpcomingEvents({
  onSeeSchedule,
  onRsvp,
}) {
  return (
    <View className="mt-2 px-4">
      {/* Heading */}
      <View className="mb-2.5 flex-row items-center justify-between">
        <Text className="text-[16px] font-extrabold text-text-primary">
          Upcoming Events
        </Text>

        <Pressable onPress={onSeeSchedule}>
          <Text className="text-[12px] font-bold text-primary">
            See schedule
          </Text>
        </Pressable>
      </View>

      {EVENTS.map((event) => (
        <View
          key={event.id}
          className="overflow-hidden rounded-[16px] border border-border bg-surface"
        >
          {/* Event image */}
          <View className="h-[120px] w-full bg-surface-elevated">
            <Image
              source={{ uri: event.image }}
              className="h-full w-full"
              resizeMode="cover"
            />

            {/* Date */}
            <View className="absolute left-3 top-3 w-[40px] overflow-hidden rounded-[8px] bg-surface">
              <View className="items-center bg-primary py-1">
                <Text className="text-[8px] font-extrabold text-background">
                  {event.month}
                </Text>
              </View>

              <View className="items-center py-1">
                <Text className="text-[16px] font-extrabold text-text-primary">
                  {event.day}
                </Text>
              </View>
            </View>
          </View>

          {/* Details */}
          <View className="px-3.5 pb-4 pt-3.5">
            <Text className="text-[15px] font-extrabold text-text-primary">
              {event.title}
            </Text>

            {/* Location */}
            <View className="mt-2.5 flex-row items-center">
              <Ionicons
                name="location-outline"
                size={14}
                color={colors["text-secondary"]}
              />

              <Text className="ml-1.5 text-[11px] text-text-secondary">
                {event.location}
              </Text>
            </View>

            {/* Time */}
            <View className="mt-1.5 flex-row items-center">
              <Ionicons
                name="time-outline"
                size={14}
                color={colors["text-secondary"]}
              />

              <Text className="ml-1.5 text-[11px] text-text-secondary">
                {event.time}
              </Text>
            </View>

            {/* Bottom */}
            <View className="mt-3.5 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="flex-row">
                  <View className="h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-surface-icon">
                    <Ionicons
                      name="paw"
                      size={13}
                      color={colors.primary}
                    />
                  </View>

                  <View className="-ml-2 h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-surface-elevated">
                    <Ionicons
                      name="paw"
                      size={13}
                      color={colors["text-secondary"]}
                    />
                  </View>

                  <View className="-ml-2 h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-primary">
                    <Ionicons
                      name="paw"
                      size={13}
                      color={colors.background}
                    />
                  </View>
                </View>

                <Text className="ml-2 text-[11px] font-semibold text-text-secondary">
                  {event.attending}
                </Text>
              </View>

              <Pressable
                onPress={() => onRsvp?.(event)}
                className="h-9 min-w-[62px] items-center justify-center rounded-full border border-primary px-3 active:opacity-80"
              >
                <Text className="text-[11px] font-bold text-text-primary">
                  RSVP
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}