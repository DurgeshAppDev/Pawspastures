import React, { useState } from "react";
import { Modal, Pressable, Text, View, FlatList } from "react-native";

import { colors } from "../theme";

export default function SelectDropdown({
  label,
  value,
  placeholder,
  options,
  onSelect,
}) {
  const [visible, setVisible] = useState(false);

  const selectedLabel = options.find((item) => item.value === value)?.label;

  return (
    <View className="mb-4">
      <Text
        className="mb-2 text-sm font-medium"
        style={{ color: colors["text-secondary"] }}
      >
        {label}
      </Text>

      <Pressable
        onPress={() => setVisible(true)}
        className="h-[52px] flex-row items-center justify-between rounded-xl px-4"
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          className="text-base"
          style={{
            color: selectedLabel
              ? colors["text-primary"]
              : colors["text-placeholder"],
          }}
        >
          {selectedLabel || placeholder}
        </Text>

        <Text className="text-lg" style={{ color: colors["icon-muted"] }}>
          ▼
        </Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          className="flex-1 justify-center px-6"
          style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
          onPress={() => setVisible(false)}
        >
          <Pressable
            className="max-h-[70%] rounded-2xl p-4"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={(event) => event.stopPropagation()}
          >
            <Text
              className="mb-4 text-lg font-bold"
              style={{ color: colors["text-primary"] }}
            >
              {label}
            </Text>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                  className="min-h-[48px] justify-center rounded-xl px-4"
                  style={{
                    backgroundColor:
                      value === item.value
                        ? colors["surface-elevated"]
                        : "transparent",
                  }}
                >
                  <Text
                    className="text-base"
                    style={{
                      color:
                        value === item.value
                          ? colors.primary
                          : colors["text-primary"],
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
