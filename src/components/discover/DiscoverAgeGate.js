import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function DiscoverAgeGate({ ageKnown = true }) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-full max-w-[500px] items-center rounded-3xl border border-border bg-surface px-7 py-10">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-surface-elevated">
          <Ionicons
            name="shield-checkmark-outline"
            size={40}
            color={colors.primary}
          />
        </View>

        <Text className="text-center text-2xl font-bold text-text-primary">
          Discover is for adults
        </Text>

        <Text className="mt-3 text-center text-base leading-6 text-text-secondary">
          {ageKnown
            ? "The Discover area is available to members aged 18 and above."
            : "Your age information is required before you can access Discover."}
        </Text>

        <View className="mt-6 w-full rounded-2xl border border-border-subtle bg-surface-elevated px-5 py-4">
          <View className="flex-row items-start">
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={colors.accent}
              style={{ marginTop: 1, marginRight: 10 }}
            />

            <Text className="flex-1 text-sm leading-5 text-text-secondary">
              {ageKnown
                ? "You can continue using the other areas of Paws & Pastures that are available to your account."
                : "Once your profile age is available, access will be applied automatically."}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
