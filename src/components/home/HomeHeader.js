import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function HomeHeader({
  onNotificationsPress,
  onMessagesPress,
}) {
  return (
    <View className="flex-row items-center justify-between px-[18px] pb-4 pt-3">
      {/* Brand */}
      <View className="flex-1 pr-3">
        <Text
          style={{ color: colors.white }}
          className="text-[24px] font-extrabold tracking-[-0.5px]"
        >
          Paws & Pastures
        </Text>

        <Text
          style={{ color: colors.secondary }}
          className="mt-[3px] text-[13px] font-medium"
        >
          Where pets bring people together
        </Text>
      </View>

      {/* Header Actions */}
      <View className="flex-row items-center gap-2.5">
        <Pressable
          onPress={onNotificationsPress}
          className="h-[42px] w-[42px] items-center justify-center rounded-full"
          style={{ backgroundColor: colors.surface }}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={colors.primary}
          />
        </Pressable>

        <Pressable
          onPress={onMessagesPress}
          className="h-[42px] w-[42px] items-center justify-center rounded-full"
          style={{ backgroundColor: colors.surface }}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={21}
            color={colors.primary}
          />
        </Pressable>
      </View>
    </View>
  );
}