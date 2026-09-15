import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";

export default function HomeHeader({
  onNotificationsPress,
  onMessagesPress,
}) {
  return (
    <View className="flex-row items-center justify-between bg-background px-[18px] pb-2 pt-3">
      {/* Brand */}
      <View className="flex-1 pr-3">
        <Text className="text-[20px] font-extrabold tracking-[-0.5px] text-text-primary">
          Paws & Pastures
        </Text>
      </View>

      {/* Header Actions */}
      <View className="flex-row items-center gap-2.5">
        <Pressable
          onPress={onNotificationsPress}
          className="h-[42px] w-[42px] items-center justify-center rounded-full bg-surface"
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={colors.primary}
          />
        </Pressable>

        <Pressable
          onPress={onMessagesPress}
          className="h-[42px] w-[42px] items-center justify-center rounded-full bg-surface"
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